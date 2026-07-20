let _apiBase = '/api/v1';

export function getApiBase(): string {
  return _apiBase;
}

export async function loadApiBaseFromConf(): Promise<string> {
  try {
    const r = await fetch('/conf.json', { credentials: 'same-origin' });
    if (!r.ok) return _apiBase;
    const conf = (await r.json()) as { api?: string };
    if (conf.api && typeof conf.api === 'string') {
      const u = conf.api.replace(/\/$/, '');
      _apiBase = u.endsWith('/v1') ? u : `${u}/v1`;
    }
  } catch {
    /* keep default */
  }
  return _apiBase;
}
