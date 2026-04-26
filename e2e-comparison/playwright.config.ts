import { defineConfig, devices } from '@playwright/test';

const angularBaseUrl = process.env.ANGULAR_BASE_URL ?? 'http://localhost:9000';
const reactBaseUrl = process.env.REACT_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 90_000,
  retries: 0,
  reporter: [['list']],
  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'angular',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: angularBaseUrl,
      },
    },
    {
      name: 'react',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: reactBaseUrl,
      },
    },
  ],
});
