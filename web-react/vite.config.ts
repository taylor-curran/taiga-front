/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api':       'http://localhost:9000',
      '/events':    { target: 'ws://localhost:9000', ws: true },
      '/media':     'http://localhost:9000',
      '/static':    'http://localhost:9000',
      '/conf.json': 'http://localhost:9000',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: false,
    include: ['tests/unit/**/*.{test,spec}.{ts,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      'playwright',
      'tests/e2e/**',
      'tests/visuals/**',
    ],
  },
});
