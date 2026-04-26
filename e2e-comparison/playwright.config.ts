import { defineConfig, devices } from '@playwright/test';

const REACT = process.env.REACT_BASE_URL ?? 'http://127.0.0.1:5173';
const ANGULAR = process.env.ANGULAR_BASE_URL ?? 'http://127.0.0.1:9001';
const API = process.env.API_BASE_URL ?? 'http://127.0.0.1:9000';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 90_000,
  retries: 0,
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never', outputFolder: './playwright-report' }]],
  use: {
    headless: true,
    viewport: { width: 1400, height: 900 },
    ignoreHTTPSErrors: true,
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    expect: { timeout: 20_000 },
  },
  projects: [
    {
      name: 'angular',
      use: { ...devices['Desktop Chrome'], baseURL: ANGULAR, metadata: { app: 'angular' } },
    },
    {
      name: 'react',
      use: { ...devices['Desktop Chrome'], baseURL: REACT, metadata: { app: 'react' } },
    },
  ],
  metadata: { api: API },
});
