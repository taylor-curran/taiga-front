import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
  css: {
    preprocessorOptions: {
      scss: {
        // Make variables available in all SCSS files without explicit import
        // (optional — can be removed if explicit imports are preferred)
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          query: ['@tanstack/react-query'],
          i18n: ['i18next', 'react-i18next', 'i18next-http-backend'],
        },
      },
    },
  },
});
