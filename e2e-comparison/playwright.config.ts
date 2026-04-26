import { defineConfig, devices } from '@playwright/test';

const angularBase = process.env.ANGULAR_BASE_URL ?? 'http://127.0.0.1:9001';
const reactBase = process.env.REACT_BASE_URL ?? 'http://127.0.0.1:5173';

/**
 * Comparison suite: identical assertions run on Angular (reference) and React (migration).
 * Expectation is pass on Angular, intentional fail on React until parity is reached.
 * Start servers first: root `npm start` (9001) and `npm run react` (5173).
 */
export default defineConfig({
  testDir: 'tests',
  timeout: 90_000,
  expect: { timeout: 15_000 },
  forbidOnly: !!process.env.CI,
  fullyParallel: true,
  use: {
    ...devices['Desktop Chrome'],
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  projects: [
    {
      name: 'angular',
      use: { baseURL: angularBase },
    },
    {
      name: 'react',
      use: { baseURL: reactBase },
    },
  ],
});
