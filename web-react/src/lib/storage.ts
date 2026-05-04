// Tiny typed wrapper over localStorage with JSON serialization.
// Mirrors the legacy `$tgStorage` service.

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = window.localStorage.getItem(key);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch {
      return null;
    }
  },
  set<T>(key: string, value: T): void {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Quota or privacy mode; ignore.
    }
  },
  remove(key: string): void {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  },
};

export const SESSION_KEYS = {
  user: 'taiga.user',
  token: 'taiga.token',
  refresh: 'taiga.refresh',
} as const;
