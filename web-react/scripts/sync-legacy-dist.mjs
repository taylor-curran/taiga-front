/**
 * Copies the Gulp-built Taiga frontend from ../dist into public/legacy
 * and rewrites <base href> so the bundle works under /legacy/.
 *
 * Does not modify the Angular source tree — only the copied output.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const srcDist = path.join(root, 'dist');
const destLegacy = path.resolve(__dirname, '../public/legacy');

function rmrf(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    const st = fs.statSync(from);
    if (st.isDirectory()) {
      copyRecursive(from, to);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

const indexSrc = path.join(srcDist, 'index.html');
if (!fs.existsSync(indexSrc)) {
  console.error(
    '[sync-legacy-dist] Missing ../dist/index.html. Run from repo root:\n' +
      '  source ~/.nvm/nvm.sh && nvm use 16.19.1 && npx gulp deploy',
  );
  process.exit(1);
}

rmrf(destLegacy);
copyRecursive(srcDist, destLegacy);

const indexDest = path.join(destLegacy, 'index.html');
let html = fs.readFileSync(indexDest, 'utf8');
html = html.replace(/<base href="\/">/i, '<base href="/legacy/">');
fs.writeFileSync(indexDest, html, 'utf8');

console.log('[sync-legacy-dist] Wrote', destLegacy);
