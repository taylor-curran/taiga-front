import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const refBase = process.env.REFERENCE_BASE_URL ?? 'http://127.0.0.1:9000';
const reactBase = process.env.REACT_BASE_URL ?? 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.RECORD_ADMIN_VIDEO === '1' ? 'on' : 'retain-on-failure',
  },
  projects: [
    {
      name: 'reference-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: refBase,
      },
    },
    {
      name: 'react-chromium',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: reactBase,
      },
    },
  ],
  webServer: [
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 5173',
      cwd: __dirname,
      url: `${reactBase}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
