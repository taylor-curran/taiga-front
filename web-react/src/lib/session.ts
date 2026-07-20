const STORAGE_KEY = 'taigaSessionId';

/** Stable per-tab session id for X-Session-Id (Taiga front parity). */
export function getOrCreateSessionId(): string {
  try {
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
  } catch {
    /* ignore */
  }
  const t = Date.now().toString(16);
  const a = new Uint8Array(16);
  crypto.getRandomValues(a);
  const id = `${t}:${Array.from(a)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')}`;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    /* ignore */
  }
  return id;
}
