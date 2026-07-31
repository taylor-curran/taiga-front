import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api':       'http://localhost:9000',
      '/events':    { target: 'ws://localhost:9000', ws: true },
      '/media':     'http://localhost:9000',
      '/static':    'http://localhost:9000',
      '/conf.json': 'http://localhost:9000',
    },
  },
});
