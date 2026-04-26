import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(root, '..');
const outputDir = path.join(root, 'test-results');

const target = process.env.AUDIT_TARGET === 'react' ? 'react' : 'angular';
/** Angular reference: use docker gateway (9000) so `conf.json` matches the live API; gulp-only 9001 can show GitHub-only auth. */
const baseURL = target === 'react' ? 'http://127.0.0.1:5173' : 'http://127.0.0.1:9000';

export default defineConfig({
  testDir: 'specs',
  outputDir,
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  metadata: { auditTarget: target },
  webServer: [
    {
      command: `bash -lc 'cd "${workspaceRoot}/web-react" && npm run dev -- --host 127.0.0.1 --port 5173'`,
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
  use: {
    ...devices['Desktop Chrome'],
    baseURL,
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  reporter: [['list'], ['html', { open: 'never', outputFolder: path.join(root, 'playwright-report') }]],
});
