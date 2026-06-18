/**
 * Serves the Gulp `dist/` tree like Taiga's `gulp express` task, but uses the
 * `TAIGA_VERSION` already embedded in `dist/index.html` (avoids `gulpfile.js`
 * generating a fresh `v-<Date.now()>` on each process start, which breaks locale JSON loads).
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const distRoot = path.join(repoRoot, 'dist');
const indexPath = path.join(distRoot, 'index.html');

const port = Number(process.env.ANGULAR_AUDIT_PORT || 9001);

function readVersion() {
  const html = fs.readFileSync(indexPath, 'utf8');
  const m = html.match(/TAIGA_VERSION\s*=\s*'([^']+)'/);
  if (!m) throw new Error('Could not parse TAIGA_VERSION from dist/index.html');
  return m[1];
}

const version = readVersion();
const versionRoot = path.join(distRoot, version);

const mime = {
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

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.setHeader('Content-Type', mime[ext] || 'application/octet-stream');
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${port}`);
    let pathname = decodeURIComponent(url.pathname);

    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      res.end();
      return;
    }

    if (pathname === '/conf.json') {
      const p = path.join(distRoot, 'conf.json');
      if (!fs.existsSync(p)) {
        res.statusCode = 404;
        res.end();
        return;
      }
      if (req.method === 'HEAD') {
        res.end();
        return;
      }
      return sendFile(res, p);
    }

    const prefix = `/${version}/`;
    if (pathname.startsWith(prefix)) {
      let rel = pathname.slice(prefix.length);
      if (rel.includes('..')) {
        res.statusCode = 400;
        res.end();
        return;
      }
      const filePath = path.join(versionRoot, rel);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        return sendFile(res, filePath);
      }
    }

    if (pathname.startsWith('/plugins')) {
      const rel = pathname.replace(/^\/+/, '');
      const filePath = path.join(distRoot, rel);
      if (!rel.includes('..') && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        if (req.method === 'HEAD') {
          res.end();
          return;
        }
        return sendFile(res, filePath);
      }
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    fs.createReadStream(indexPath).pipe(res);
  } catch (e) {
    res.statusCode = 500;
    res.end(String(e));
  }
});

server.listen(port, '0.0.0.0', () => {
  // eslint-disable-next-line no-console
  console.log(`[serve-angular-dist] ${version} on http://localhost:${port}`);
});
