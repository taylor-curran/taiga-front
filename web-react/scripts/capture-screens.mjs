/**
 * Capture paired screenshots from Angular dist (static server) and React preview.
 * Requires: Angular `dist/` from `npx ng build`, `npx serve dist -l 4200`, `vite preview -l 5173`.
 */
import puppeteer from 'puppeteer-core';
import { spawn } from 'child_process';
import { mkdir, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.MIGRATION_SCREENSHOT_DIR || '/opt/cursor/artifacts/migration-screenshots';
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/local/bin/google-chrome';

const routes = [
  { name: 'discover', path: '/discover' },
  { name: 'discover-search', path: '/discover/search?text=test' },
  { name: 'login', path: '/login' },
];

function startServer(cmd, args, cwd) {
  const child = spawn(cmd, args, { cwd, stdio: 'ignore', detached: true });
  child.unref();
  return child;
}

async function waitForHttp(url, attempts = 40) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const r = await fetch(url);
      if (r.ok || r.status === 404) return;
    } catch {
      /* retry */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function main() {
  await mkdir(OUT, { recursive: true });

  const distRoot = join(__dirname, '..', '..', 'dist');
  startServer('python3', ['-m', 'http.server', '4200', '--bind', '127.0.0.1'], distRoot);
  startServer('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '5173'], join(__dirname, '..'));

  await waitForHttp('http://127.0.0.1:4200/');
  await waitForHttp('http://127.0.0.1:5173/');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    for (const { name, path } of routes) {
      for (const [label, origin] of [
        ['angular', 'http://127.0.0.1:4200'],
        ['react', 'http://127.0.0.1:5173'],
      ]) {
        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(`${origin}${path}`, { waitUntil: 'networkidle2', timeout: 60000 });
        await new Promise((r) => setTimeout(r, 800));
        const buf = await page.screenshot({ type: 'png', fullPage: false });
        await writeFile(join(OUT, `${name}-${label}.png`), buf);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  await writeFile(
    join(OUT, 'README.txt'),
    'Paired screenshots: discover, discover-search, login — angular (port 4200) vs react (port 5173).\n',
  );
  console.log('Wrote screenshots to', OUT);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
