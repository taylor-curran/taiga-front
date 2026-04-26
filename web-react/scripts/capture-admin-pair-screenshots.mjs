#!/usr/bin/env node
/**
 * Writes reference vs React PNGs for PR documentation when both dev servers respond.
 * Output: artifacts/pr/screenshots/
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'artifacts', 'pr', 'screenshots');
mkdirSync(outDir, { recursive: true });

const refBase = process.env.REFERENCE_BASE_URL ?? 'http://127.0.0.1:9000';
const reactBase = process.env.REACT_BASE_URL ?? 'http://127.0.0.1:5173';
const slug = 'sample-scrum';
const routes = [
  'admin/project-profile/details',
  'admin/project-values/status',
  'admin/memberships',
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

async function tryShot(label, base, suffix) {
  const url = `${base}/project/${slug}/${suffix}`;
  try {
    const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 8000 });
    if (!res || !res.ok()) return false;
    await page.waitForTimeout(800);
    const shot = await page.screenshot({ fullPage: false });
    const name = `${label}_${suffix.replaceAll(/[^\w]+/g, '_')}.png`;
    writeFileSync(path.join(outDir, name), shot);
    return true;
  } catch {
    return false;
  }
}

const meta = { refBase, reactBase, captured: [] };
for (const suffix of routes) {
  const refOk = await tryShot('reference', refBase, suffix);
  const reactOk = await tryShot('react', reactBase, suffix);
  meta.captured.push({ suffix, refOk, reactOk });
}

writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(meta, null, 2));
await browser.close();
console.log('Wrote screenshots under', outDir, meta);
