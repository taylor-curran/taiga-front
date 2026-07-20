import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const apiTarget = 'http://127.0.0.1:3000';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * envDir: load from web-react/ even when the dev server is started from repo root.
 * Proxy: forward API and static paths to the backend (json-server) on :3000.
 * Angular on :9000 is separate; the React app must not require it to boot.
 */
export default defineConfig(({ mode }) => {
  const rootDir = __dirname;
  const _env = loadEnv(mode, rootDir, '');

  return {
    root: rootDir,
    envDir: rootDir,
    resolve: {
      alias: { '@': path.resolve(rootDir, 'src') },
    },
    plugins: [react()],
    server: {
      port: 5173,
      host: '0.0.0.0',
      strictPort: true,
      proxy: {
        // Taiga client API
        '/api': { target: apiTarget, changeOrigin: true, secure: false },
        // Events (optional; some stacks expose WS here)
        '/events': { target: 'ws://127.0.0.1:3000', ws: true, changeOrigin: true },
        // Static/media from backend when not bundled in Vite
        '/media': { target: apiTarget, changeOrigin: true, secure: false },
        // Legacy front sometimes serves under /static
        '/static': { target: apiTarget, changeOrigin: true, secure: false },
        // config blob used by the Angular app (proxied for parity if requested from port 5173)
        '/conf.json': { target: apiTarget, changeOrigin: true, secure: false },
      },
    },
  };
});
