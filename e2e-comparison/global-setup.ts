import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const fixtureAngular = path.join(root, 'fixtures', 'conf.e2e.angular-dist.json');
const fixtureReact = path.join(root, 'fixtures', 'conf.e2e.react-vite.json');
const targetDir = path.join(root, '..', 'web-react', 'public');
const target = path.join(targetDir, 'conf.json');
const distDir = path.join(root, '..', 'dist');
const distIndex = path.join(distDir, 'index.html');
const distConf = path.join(distDir, 'conf.json');

const PATCH_MARKER = '<!-- E2E_AUDIT_TAIGA_CONFIG -->';

export default async function globalSetup() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  fs.copyFileSync(fixtureReact, target);

  if (fs.existsSync(distDir)) {
    fs.copyFileSync(fixtureAngular, distConf);
    if (fs.existsSync(distIndex)) {
      let html = fs.readFileSync(distIndex, 'utf8');
      const confRaw = fs.readFileSync(fixtureAngular, 'utf8');
      const confOneLine = JSON.stringify(JSON.parse(confRaw));
      const inject = `${PATCH_MARKER}<script>window.taigaConfig=${confOneLine};</script>`;
      if (html.includes(PATCH_MARKER)) {
        html = html.replace(
          /<!-- E2E_AUDIT_TAIGA_CONFIG --><script>window\.taigaConfig=[^<]+<\/script>/,
          inject,
        );
      } else {
        html = html.replace('<head>', `<head>\n    ${inject}`);
      }
      fs.writeFileSync(distIndex, html, 'utf8');
    }
  }
}
