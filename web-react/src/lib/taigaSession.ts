/**
 * Mirrors `taiga.generateUniqueSessionIdentifier` / `taiga.sessionId` from the Angular app.
 */
function simpleHash(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(16).padStart(8, '0');
}

export function getTaigaSessionId(): string {
  const key = 'taigaSessionId';
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = simpleHash(`${Date.now()}:${Math.random()}:${performance.now()}`);
  sessionStorage.setItem(key, id);
  return id;
}
