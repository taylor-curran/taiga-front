import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:9000',
      '/events': { target: 'ws://localhost:9000', ws: true },
      '/media': 'http://localhost:9000',
      '/static': 'http://localhost:9000',
      '/conf.json': 'http://localhost:9000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**'],
  },
});
