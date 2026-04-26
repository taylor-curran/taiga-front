import { describe, expect, it } from 'vitest';
import { legacyFrameSrc, legacyIndexPath, STORAGE_TOKEN, STORAGE_USER_INFO } from './legacyUrls';

describe('legacy URL helpers', () => {
  it('uses /legacy/index.html for home', () => {
    expect(legacyIndexPath()).toBe('/legacy/index.html');
    expect(legacyFrameSrc('/', '')).toBe('/legacy/index.html');
  });

  it('maps nested routes under /legacy/', () => {
    expect(legacyFrameSrc('/login', '?next=%2F')).toBe('/legacy/login?next=%2F');
    expect(legacyFrameSrc('/project/foo/timeline', '')).toBe('/legacy/project/foo/timeline');
  });
});

describe('auth storage keys (match Angular $tgStorage)', () => {
  it('uses token and userInfo', () => {
    expect(STORAGE_TOKEN).toBe('token');
    expect(STORAGE_USER_INFO).toBe('userInfo');
  });
});
