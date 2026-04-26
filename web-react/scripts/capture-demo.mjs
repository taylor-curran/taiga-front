/**
 * Short MP4 demo: React discover → search (puppeteer + ffmpeg).
 * Starts `vite preview` on 5173 if nothing responds.
 */
import puppeteer from 'puppeteer-core';
import { spawn, spawnSync } from 'child_process';
import { mkdir, writeFile, readdir, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = process.env.MIGRATION_ARTIFACT_DIR || '/opt/cursor/artifacts';
const TMP = join(OUT, 'demo-frames');
const CHROME = process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/local/bin/google-chrome';

function startPreview() {
  const child = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', '5173'], {
    cwd: join(__dirname, '..'),
    stdio: 'ignore',
    detached: true,
  });
  child.unref();
  return child;
}

async function waitForHttp(url) {
  for (let i = 0; i < 40; i += 1) {
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
  await mkdir(TMP, { recursive: true });

  try {
    await waitForHttp('http://127.0.0.1:5173/');
  } catch {
    startPreview();
    await waitForHttp('http://127.0.0.1:5173/');
  }

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:5173/discover', { waitUntil: 'networkidle2', timeout: 60000 });
  await writeFile(join(TMP, 'f1.png'), await page.screenshot({ type: 'png' }));
  await page.goto('http://127.0.0.1:5173/discover/search?text=demo', { waitUntil: 'networkidle2', timeout: 60000 });
  await writeFile(join(TMP, 'f2.png'), await page.screenshot({ type: 'png' }));
  await browser.close();

  const videoOut = join(OUT, 'react-migration-demo.mp4');
  const r = spawnSync(
    'ffmpeg',
    [
      '-y',
      '-framerate',
      '1/2',
      '-i',
      join(TMP, 'f%d.png'),
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-r',
      '2',
      videoOut,
    ],
    { stdio: 'inherit' },
  );
  if (r.status !== 0) throw new Error('ffmpeg failed');

  for (const f of await readdir(TMP)) {
    await unlink(join(TMP, f));
  }

  console.log('Wrote', videoOut);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
