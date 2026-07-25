// Quick reconnaissance script: load each focus page on both Angular (:9000)
// and React (:5173), save a full-page screenshot + a slim DOM snapshot.
//
// Usage: node parity-audit/explore.mjs
//
// Requires the gateway (:9000) and the React dev server (:5173) to be up.

import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ANGULAR = process.env.ANGULAR_URL || 'http://localhost:9000';
const REACT   = process.env.REACT_URL   || 'http://localhost:5173';
const USER    = process.env.TAIGA_ADMIN_USER || 'admin';
const PASS    = process.env.TAIGA_ADMIN_PASS || 'adminpass';
const PROJECT = process.env.TAIGA_PROJECT_SLUG || 'project-1';

const ROOT = new URL('.', import.meta.url).pathname;
const OUT  = path.join(ROOT, 'screenshots');

const PAGES = [
  { id: 'login',     path: '/login',                              auth: false },
  { id: 'home',      path: '/',                                   auth: true  },
  { id: 'projects',  path: '/projects/',                          auth: true  },
  { id: 'backlog',   path: `/project/${PROJECT}/backlog`,         auth: true  },
  { id: 'kanban',    path: `/project/${PROJECT}/kanban`,          auth: true  },
  { id: 'issues',    path: `/project/${PROJECT}/issues`,          auth: true  },
];

async function getApiToken() {
  const r = await fetch(`${ANGULAR}/api/v1/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'normal', username: USER, password: PASS }),
  });
  return r.json();
}

async function setSession(page, base, info) {
  // Both apps use the same localStorage keys (token, refresh, userInfo).
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, refresh, info }) => {
    localStorage.setItem('token',    JSON.stringify(token));
    if (refresh) localStorage.setItem('refresh',  JSON.stringify(refresh));
    localStorage.setItem('userInfo', JSON.stringify(info));
  }, { token: info.auth_token, refresh: info.refresh, info });
}

async function capture(ctx, app, base, p) {
  const page = await ctx.newPage();
  page.on('pageerror', () => {}); // ignore noisy app-level errors
  try {
    await page.goto(`${base}${p.path}`, { waitUntil: 'networkidle', timeout: 30_000 });
  } catch {
    try { await page.goto(`${base}${p.path}`, { waitUntil: 'load', timeout: 30_000 }); }
    catch {}
  }
  await page.waitForTimeout(1500); // let async data render
  const file = path.join(OUT, app, `${p.id}.png`);
  await page.screenshot({ path: file, fullPage: true });
  // Slim DOM snapshot: tag names + classes + text we can grep.
  const dom = await page.evaluate(() => {
    function trim(s) { return (s || '').replace(/\s+/g, ' ').trim().slice(0, 200); }
    const root = document.body;
    const lines = [];
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
    let n = walker.currentNode;
    let count = 0;
    while (n && count < 1500) {
      const tag = n.tagName.toLowerCase();
      const cls = n.className && typeof n.className === 'string' ? '.' + n.className.replace(/\s+/g, '.').slice(0, 80) : '';
      const id  = n.id ? '#' + n.id : '';
      const t   = trim(n.textContent && n.children.length === 0 ? n.textContent : '');
      lines.push(`${tag}${id}${cls} ${t ? '› ' + t : ''}`);
      n = walker.nextNode();
      count++;
    }
    return { url: location.href, title: document.title, lines };
  });
  await writeFile(path.join(OUT, app, `${p.id}.dom.txt`),
    `URL: ${dom.url}\nTITLE: ${dom.title}\n\n${dom.lines.join('\n')}\n`);
  await page.close();
  console.log(`  ${app}/${p.id}.png`);
}

(async () => {
  for (const app of ['angular', 'react']) await mkdir(path.join(OUT, app), { recursive: true });
  const auth = await getApiToken();
  console.log(`logged in as ${auth.username}, projects available via API.`);

  const browser = await chromium.launch();
  for (const [app, base] of [['angular', ANGULAR], ['react', REACT]]) {
    console.log(`-- ${app} (${base}) --`);
    // Anonymous context for the /login screenshot (no session).
    const anon = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    for (const p of PAGES.filter((x) => !x.auth)) {
      await capture(anon, app, base, p);
    }
    await anon.close();

    // Authed context for everything else.
    const ctx = await browser.newContext({ viewport: { width: 1366, height: 900 } });
    await setSession(await ctx.newPage(), base, auth);
    for (const p of PAGES.filter((x) => x.auth)) {
      await capture(ctx, app, base, p);
    }
    await ctx.close();
  }
  await browser.close();
})();
