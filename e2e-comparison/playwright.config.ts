import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Use `localhost` (not `127.0.0.1`) so browser origin matches `conf.json` API host `localhost:9000`. */
const angularURL = process.env.ANGULAR_URL ?? 'http://localhost:9001';
const reactURL = process.env.REACT_URL ?? 'http://localhost:5173';

const reuse = !process.env.CI;

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 2,
  globalSetup: path.join(__dirname, 'global-setup.ts'),
  webServer: [
    {
      command: 'node /workspace/e2e-comparison/scripts/serve-angular-dist.mjs',
      url: angularURL,
      reuseExistingServer: reuse,
      timeout: 120_000,
    },
    {
      command:
        'bash -lc "source \\"$HOME/.nvm/nvm.sh\\" && nvm use 22 && cd /workspace/web-react && npm run dev -- --host localhost --port 5173"',
      url: reactURL,
      reuseExistingServer: reuse,
      timeout: 120_000,
    },
  ],
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'test-results/html-report' }],
    ['json', { outputFile: path.join(__dirname, 'playwright-report.json') }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  expect: {
    timeout: 15_000,
  },
  timeout: 60_000,
  projects: [
    {
      name: 'angular',
      use: {
        baseURL: angularURL,
      },
    },
    {
      name: 'react',
      use: {
        baseURL: reactURL,
      },
    },
  ],
});
