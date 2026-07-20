import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const API_TARGET = 'http://127.0.0.1:3000';
const LEGACY_WEB_TARGET = 'http://127.0.0.1:9000';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Taiga API (json-server / mock in cloud env)
      '/api': {
        target: API_TARGET,
        changeOrigin: true,
      },
      // Real-time (reference stack); keep on legacy dev server when present
      '/events': {
        target: LEGACY_WEB_TARGET,
        ws: true,
        changeOrigin: true,
      },
      '/media': {
        target: LEGACY_WEB_TARGET,
        changeOrigin: true,
      },
      '/static': {
        target: LEGACY_WEB_TARGET,
        changeOrigin: true,
      },
      '/conf.json': {
        target: LEGACY_WEB_TARGET,
        changeOrigin: true,
      },
    },
  },
});
