import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const webReactRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: webReactRoot,
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(webReactRoot, 'src') },
  },
  test: {
    name: 'web-react',
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/playwright-report/**',
      '**/../app/**',
      '**/../../app/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/test/**',
        'src/main.tsx',
        '**/*.d.ts',
        'src/**/*.test.{ts,tsx}',
      ],
    },
  },
});
