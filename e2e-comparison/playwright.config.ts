import { defineConfig, devices } from '@playwright/test';

/**
 * Dual-app comparison: same spec file runs against Angular (static dist) and React (Vite preview).
 * Set TARGET=angular | react (default react). BASE_URL points at the server for that target.
 */
const target = process.env.TARGET || 'react';
const defaultBase =
  target === 'angular' ? 'http://127.0.0.1:9101' : 'http://127.0.0.1:5173';

export default defineConfig({
  testDir: './specs',
  timeout: 45_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  outputDir: 'test-results/artifacts',
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: process.env.BASE_URL || defaultBase,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
