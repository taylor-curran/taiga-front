import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(root, 'test-results');

export default defineConfig({
  testDir: 'specs',
  outputDir,
  /** Two workers against one Vite dev server can break lazy chunk loads mid-run. */
  workers: 1,
  fullyParallel: false,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
  },
  reporter: [['list'], ['html', { open: 'never', outputFolder: path.join(root, 'playwright-report') }]],
  projects: [
    {
      name: 'angular',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.ANGULAR_BASE_URL ?? 'http://127.0.0.1:9000',
      },
    },
    {
      name: 'react',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: process.env.REACT_BASE_URL ?? 'http://127.0.0.1:5173',
      },
    },
  ],
  webServer: {
    command: 'npm --prefix ../web-react run dev -- --host 127.0.0.1 --port 5173',
    url: process.env.REACT_BASE_URL ?? 'http://127.0.0.1:5173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
