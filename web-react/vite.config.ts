import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { legacyStaticPlugin } from './vite-legacy-static.mjs';

export default defineConfig({
  plugins: [react(), legacyStaticPlugin()],
  server: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:9000', changeOrigin: true },
      '/events': { target: 'ws://localhost:9000', ws: true, changeOrigin: true },
      '/media': { target: 'http://localhost:9000', changeOrigin: true },
      '/static': { target: 'http://localhost:9000', changeOrigin: true },
      '/conf.json': { target: 'http://localhost:9000', changeOrigin: true },
    },
  },
  preview: {
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:9000', changeOrigin: true },
      '/events': { target: 'ws://localhost:9000', ws: true, changeOrigin: true },
      '/media': { target: 'http://localhost:9000', changeOrigin: true },
      '/static': { target: 'http://localhost:9000', changeOrigin: true },
      '/conf.json': { target: 'http://localhost:9000', changeOrigin: true },
    },
  },
});
