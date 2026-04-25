#!/usr/bin/env node
// Idempotent seed: superuser + sample data.
//
// 1) waits for the gateway to come up
// 2) creates the admin superuser (silently no-op if it already exists)
// 3) waits for /api/v1/auth to accept admin/adminpass
// 4) checks /api/v1/projects with the admin token; if empty, runs
//    `taiga-manage sample_data` (7 example projects + 10 users + stories,
//    tasks, issues, wiki, etc., baked into the taigaio/taiga-back image).
//
// Safe to run on every cold boot. Fast no-op on warm boots.

import { spawn } from 'node:child_process';
import http from 'node:http';
import https from 'node:https';
import { setTimeout as wait } from 'node:timers/promises';

const GATEWAY = process.env.TAIGA_GATEWAY || 'http://localhost:9000';
const ADMIN_USER = process.env.TAIGA_ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.TAIGA_ADMIN_PASS || 'adminpass';
const ADMIN_EMAIL = process.env.TAIGA_ADMIN_EMAIL || 'admin@example.com';

function log(msg) { console.log(`[taiga-seed] ${msg}`); }

function requestJson(url, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const data = body === undefined ? undefined : JSON.stringify(body);
    const target = new URL(url);
    const client = target.protocol === 'https:' ? https : http;
    const req = client.request(target, {
      method,
      headers: {
        ...headers,
        ...(data ? { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) } : {}),
      },
    }, (res) => {
      let raw = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let json = null;
        if (raw) {
          try { json = JSON.parse(raw); } catch {}
        }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json });
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function run(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: 'inherit', ...opts });
    p.on('exit', (code) => resolve(code ?? 0));
  });
}

function runCapture(cmd, args, opts = {}) {
  return new Promise((resolve) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
    let out = ''; let err = '';
    p.stdout.on('data', (d) => { out += d; });
    p.stderr.on('data', (d) => { err += d; });
    p.on('exit', (code) => resolve({ code: code ?? 0, out, err }));
  });
}

async function pollOk(url, { tries = 180, delayMs = 2000 } = {}) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await requestJson(url);
      if (r.ok) return true;
    } catch {}
    await wait(delayMs);
  }
  return false;
}

async function getAdminToken() {
  const r = await requestJson(`${GATEWAY}/api/v1/auth`, {
    method: 'POST',
    body: { type: 'normal', username: ADMIN_USER, password: ADMIN_PASS },
  });
  if (!r.ok) return null;
  return r.json?.auth_token || null;
}

async function pollAdminLogin({ tries = 90, delayMs = 2000 } = {}) {
  for (let i = 0; i < tries; i++) {
    const t = await getAdminToken();
    if (t) return t;
    await wait(delayMs);
  }
  return null;
}

(async () => {
  log(`gateway: ${GATEWAY}`);
  log('waiting for gateway / api/v1/ ...');
  if (!(await pollOk(`${GATEWAY}/api/v1/`))) {
    log('gateway never came up; abort');
    process.exit(1);
  }
  log('gateway up.');

  log('ensuring superuser ...');
  const su = await runCapture('docker', [
    'compose', '-f', 'docker-compose.yml', '-f', 'docker-compose-inits.yml',
    'run', '--rm',
    '-e', `DJANGO_SUPERUSER_USERNAME=${ADMIN_USER}`,
    '-e', `DJANGO_SUPERUSER_EMAIL=${ADMIN_EMAIL}`,
    '-e', `DJANGO_SUPERUSER_PASSWORD=${ADMIN_PASS}`,
    'taiga-manage', 'createsuperuser', '--noinput',
  ], { cwd: 'taiga-docker' });
  const exists = /already (exists|taken)|that username is already/i.test(su.out + su.err);
  if (su.code === 0) log(`superuser created.`);
  else if (exists) log(`superuser already exists; skip.`);
  else log(`createsuperuser exited ${su.code} (continuing): ${(su.err || su.out).trim().slice(-200)}`);

  log(`waiting for ${ADMIN_USER} login to succeed ...`);
  const token = await pollAdminLogin();
  if (!token) {
    log(`could not log in as ${ADMIN_USER}; abort`);
    process.exit(1);
  }
  log('admin login ok.');

  const r = await requestJson(`${GATEWAY}/api/v1/projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const projects = r.ok && Array.isArray(r.json) ? r.json : [];
  log(`existing projects: ${projects.length}`);
  if (projects.length > 0) {
    log('skipping sample_data (db already has projects).');
    return;
  }

  log('seeding sample_data (7 example projects + ~10 users + stories/tasks/issues/wiki) ...');
  const code = await run('docker', [
    'compose', '-f', 'docker-compose.yml', '-f', 'docker-compose-inits.yml',
    'run', '--rm', 'taiga-manage', 'sample_data',
  ], { cwd: 'taiga-docker' });
  if (code !== 0) {
    log(`sample_data exited ${code}`);
    process.exit(code);
  }
  log('done.');
})().catch((e) => {
  log(`fatal: ${e?.stack || e}`);
  process.exit(1);
});
