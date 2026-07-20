import { defineConfig, devices } from '@playwright/test';

/**
 * Run against the Angular static server (gulp express, default 9001) and the React Vite app (5173).
 * Set ANGULAR_BASE and REACT_BASE to override.
 */
const angular = process.env.ANGULAR_BASE || 'http://127.0.0.1:9001';
const react = process.env.REACT_BASE || 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'angular',
      use: {
        baseURL: angular,
      },
    },
    {
      name: 'react',
      use: {
        baseURL: react,
      },
    },
  ],
});
