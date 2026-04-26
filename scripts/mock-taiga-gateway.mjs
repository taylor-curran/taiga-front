#!/usr/bin/env node
/**
 * Minimal static responses so Angular (dist) app-loader and React (Vite) can load /conf.json
 * without a full taiga-back. Used for local audit static comparison only.
 */
import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const PORT = Number(process.env.MOCK_TAIGA_PORT || 9000);

const fixtureConf = path.join(root, 'e2e-comparison', 'fixtures', 'conf.json');
const defaultConf = JSON.parse(
  readFileSync(
    existsSync(fixtureConf) ? fixtureConf : path.join(root, 'conf', 'conf.example.json'),
    'utf8'
  )
);
defaultConf.api = `http://127.0.0.1:${PORT}/api/v1/`;
const confData = JSON.stringify(defaultConf, null, 2);

const server = http.createServer((req, res) => {
  const u = new URL(req.url || '/', `http://localhost:${PORT}`);

  if (u.pathname === '/conf.json') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(confData);
    return;
  }
  if (u.pathname === '/api/v1/' || u.pathname === '/api/v1') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'mock gateway' }));
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[mock-taiga-gateway] http://127.0.0.1:${PORT} (conf.json + /api/v1/ stub)`);
});
