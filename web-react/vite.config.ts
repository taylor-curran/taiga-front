import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serve the legacy AngularJS locale JSON files at `/locales/...` so
// react-i18next can fetch them without duplicating translations.
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 5173,
    fs: {
      // Allow reading translations from the parent directory during dev.
      allow: [path.resolve(__dirname, '..')],
    },
    proxy: {
      '/api':       'http://localhost:9000',
      '/events':    { target: 'ws://localhost:9000', ws: true },
      '/media':     'http://localhost:9000',
      '/static':    'http://localhost:9000',
      '/conf.json': 'http://localhost:9000',
      // Forward locale fetches to the legacy app/locales tree via a Vite
      // middleware-friendly path. In dev we rely on the static server
      // started by the AngularJS app; in production the build copies the
      // JSON files into the public/ directory.
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
});
