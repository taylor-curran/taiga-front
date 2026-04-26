import react from '@vitejs/plugin-react';
import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    root: path.resolve(__dirname),
    dir: './tests/unit',
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '../app/**',
      '../**/app/**',
      '**/*.spec.coffee',
      '**/*.coffee',
    ],
    setupFiles: ['./tests/unit/setupTests.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      exclude: ['**/node_modules/**', 'tests/**', 'playwright/**', 'scripts/**'],
    },
  },
});
