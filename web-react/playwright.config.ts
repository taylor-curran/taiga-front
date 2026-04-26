import { defineConfig, devices } from '@playwright/test';

const REACT_BASE = process.env.REACT_BASE_URL ?? 'http://localhost:5173';
const ANGULAR_BASE = process.env.ANGULAR_BASE_URL ?? 'http://localhost:9000';
const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9000';

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './tests/e2e/.results',
  timeout: 60_000,
  retries: 0,
  fullyParallel: false,
  reporter: [['list']],
  use: {
    headless: true,
    viewport: { width: 1366, height: 900 },
    ignoreHTTPSErrors: true,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'react',
      testMatch: /parity\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: REACT_BASE,
      },
      metadata: { app: 'react', api: API_BASE },
    },
    {
      name: 'angular',
      testMatch: /angular\.spec\.ts$/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: ANGULAR_BASE,
      },
      metadata: { app: 'angular', api: API_BASE },
    },
  ],
});
