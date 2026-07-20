/** Same semantics as Angular `$tgStorage` (JSON in localStorage). */
export function storageGet<T>(key: string, defaultValue: T | null = null): T | null {
  const raw = localStorage.getItem(key);
  if (raw === null) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function storageSet(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function storageRemove(key: string): void {
  localStorage.removeItem(key);
}
