import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testResultsDir = path.join(__dirname, 'test-results');
fs.mkdirSync(testResultsDir, { recursive: true });
const repoRoot = path.resolve(__dirname, '..');
const distIndex = path.join(repoRoot, 'dist', 'index.html');

/**
 * Ensures the Gulp-built Angular bundle exists and is copied into `web-react/public/legacy`.
 * Does not modify Angular or React application source — only build output and the sync copy.
 */
export default async function globalSetup() {
  if (!fs.existsSync(distIndex)) {
    execSync(
      'bash -lc "source \\"$HOME/.nvm/nvm.sh\\" && nvm use 16.19.1 && cd /workspace && npx gulp deploy"',
      { stdio: 'inherit' },
    );
  }
  execSync(
    'bash -lc "source \\"$HOME/.nvm/nvm.sh\\" && nvm use 22 && cd /workspace/web-react && npm ci --no-audit --no-fund"',
    { stdio: 'ignore' },
  );
  execSync(
    'bash -lc "source \\"$HOME/.nvm/nvm.sh\\" && nvm use 22 && cd /workspace/web-react && node scripts/sync-legacy-dist.mjs"',
    { stdio: 'ignore' },
  );
}
