const TOKEN_KEY = 'token';

/**
 * Same key as the Angular `tgAuth` / `$tgStorage` client (`app/coffee/modules/auth.coffee`).
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthHeader(): Record<string, string> {
  const t = getAuthToken();
  if (!t) {
    return {};
  }
  return { Authorization: `Bearer ${t}` };
}
