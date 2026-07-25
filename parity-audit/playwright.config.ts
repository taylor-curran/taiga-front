import { defineConfig, devices } from '@playwright/test';

// PARITY_TARGET=angular | react (default: angular)
// Each project has its own baseURL so the same specs run against both apps.
const TARGET = (process.env.PARITY_TARGET || 'angular') as 'angular' | 'react';

const ANGULAR_URL = process.env.ANGULAR_URL || 'http://localhost:9000';
const REACT_URL   = process.env.REACT_URL   || 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json',  { outputFile: `reports/${TARGET}.json` }],
    ['html',  { outputFolder: `reports/${TARGET}-html`, open: 'never' }],
  ],
  use: {
    baseURL: TARGET === 'react' ? REACT_URL : ANGULAR_URL,
    viewport: { width: 1366, height: 900 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: TARGET,
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
