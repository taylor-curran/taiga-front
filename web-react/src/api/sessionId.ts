// Mirror taiga.generateUniqueSessionIdentifier from app.coffee. The exact hash
// algorithm is irrelevant to the back-end (it just stamps the session); the
// requirement is that the same X-Session-Id is sent on every request from one
// browser tab.
function hex(n: number, len: number): string {
  return n.toString(16).padStart(len, '0');
}

function randomHex(bytes: number): string {
  const arr = new Uint8Array(bytes);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < bytes; i++) arr[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(arr)
    .map((b) => hex(b, 2))
    .join('');
}

export const sessionId = randomHex(20); // 40-char hex, similar shape to sha1
