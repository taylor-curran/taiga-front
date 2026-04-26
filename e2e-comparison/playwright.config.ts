import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from '@playwright/test';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const angularUrl = process.env.ANGULAR_URL ?? 'http://127.0.0.1:9001';
const reactUrl = process.env.REACT_URL ?? 'http://127.0.0.1:5173';

export default defineConfig({
  globalSetup: path.join(__dirname, 'global-setup.ts'),
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'angular-baseline',
      use: {
        baseURL: angularUrl,
      },
    },
    {
      name: 'react-parity',
      use: {
        baseURL: reactUrl,
      },
    },
  ],
});
