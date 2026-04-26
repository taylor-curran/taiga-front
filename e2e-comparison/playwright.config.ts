import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const angularPort = process.env.ANGULAR_STATIC_PORT || '9101';
const reactPort = process.env.REACT_DEV_PORT || '5173';

export default defineConfig({
  testDir: 'specs',
  outputDir: path.join(root, 'test-results'),
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [['list'], ['html', { open: 'never', outputFolder: path.join(root, 'playwright-report') }]],
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'off',
  },
  projects: [
    {
      name: 'angular',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${angularPort}`,
      },
    },
    {
      name: 'react',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: `http://127.0.0.1:${reactPort}`,
      },
    },
  ],
  globalSetup: path.join(root, 'global-setup.ts'),
  webServer: [
    {
      command: `node "${path.join(root, 'scripts/mock-taiga-api.mjs')}"`,
      url: `http://127.0.0.1:${angularPort}/conf.json`,
      reuseExistingServer: true,
      timeout: 120_000,
      env: { ...process.env, ANGULAR_STATIC_PORT: angularPort },
    },
    {
      command: `npm --prefix "${path.join(root, '..', 'web-react')}" run dev -- --host 127.0.0.1 --port ${reactPort}`,
      url: `http://127.0.0.1:${reactPort}/`,
      reuseExistingServer: true,
      timeout: 120_000,
      env: { ...process.env },
    },
  ],
});
