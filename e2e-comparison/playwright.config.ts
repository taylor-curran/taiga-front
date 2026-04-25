import { defineConfig } from '@playwright/test';

const ANGULAR_URL = process.env.ANGULAR_URL ?? 'http://localhost:9000';
const REACT_URL = process.env.REACT_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'report' }],
  ],
  use: {
    screenshot: 'on',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  outputDir: './test-results',
  projects: [
    {
      name: 'angular',
      use: {
        baseURL: ANGULAR_URL,
      },
    },
    {
      name: 'react',
      use: {
        baseURL: REACT_URL,
      },
    },
  ],
});
