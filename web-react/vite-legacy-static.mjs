import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Serves `public/legacy` like a static file server with SPA fallback to
 * `legacy/index.html` for Angular html5 routes.
 */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8',
};

function legacyMiddleware(legacyRoot) {
  return (req, res, next) => {
    if (!req.url || !req.url.startsWith('/legacy')) {
      return next();
    }
    try {
      const url = new URL(req.url, 'http://localhost');
      const rel = decodeURIComponent(url.pathname.replace(/^\/legacy\/?/, '') || '');
      const filePath = path.resolve(legacyRoot, rel);
      if (!filePath.startsWith(legacyRoot + path.sep) && filePath !== legacyRoot) {
        res.statusCode = 400;
        res.end();
        return;
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          res.statusCode = 405;
          res.end();
          return;
        }
        const ext = path.extname(filePath).toLowerCase();
        res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        fs.createReadStream(filePath).pipe(res);
        return;
      }
      const index = path.join(legacyRoot, 'index.html');
      if (fs.existsSync(index)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        fs.createReadStream(index).pipe(res);
        return;
      }
    } catch {
      // fall through
    }
    next();
  };
}

export function legacyStaticPlugin() {
  const legacyRoot = path.resolve(__dirname, 'public/legacy');

  return {
    name: 'taiga-legacy-static',
    configureServer(server) {
      server.middlewares.use(legacyMiddleware(legacyRoot));
    },
    configurePreviewServer(server) {
      server.middlewares.use(legacyMiddleware(legacyRoot));
    },
  };
}
