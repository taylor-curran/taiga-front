import { defineConfig } from '@playwright/test';

const angular = process.env.ANGULAR_BASE_URL ?? 'http://localhost:9001';
const react = process.env.REACT_BASE_URL ?? 'http://localhost:5173';

export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'angular', use: { baseURL: angular } },
    { name: 'react', use: { baseURL: react } },
  ],
});
