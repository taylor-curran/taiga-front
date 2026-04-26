import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Fetches a fresh auth payload from the local Taiga API (same as `npm run taiga-seed` admin).
 * Requires `http://127.0.0.1:9000` to be reachable before tests run.
 */
export default async function globalSetup(): Promise<void> {
  const api = process.env.TAIGA_API_URL ?? 'http://127.0.0.1:9000';
  const res = await fetch(`${api}/api/v1/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'normal', username: 'admin', password: 'adminpass' }),
  });
  if (!res.ok) {
    throw new Error(`globalSetup: auth failed ${res.status} (is Taiga on ${api} running?)`);
  }
  const json = await res.text();
  writeFileSync(join(__dirname, '.auth-cache.json'), json, 'utf-8');
}
