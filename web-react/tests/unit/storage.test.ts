import { afterEach, describe, expect, it } from 'vitest';
import { storage } from '@/api/storage';

describe('storage', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('round-trips JSON values', () => {
    storage.set('foo', { a: 1, b: 'x' });
    expect(storage.get('foo')).toEqual({ a: 1, b: 'x' });
    storage.remove('foo');
    expect(storage.get('foo')).toBeNull();
  });

  it('namespaces under taiga.', () => {
    storage.set('token', 'abc');
    expect(localStorage.getItem('taiga.token')).toBe('"abc"');
  });

  it('returns null for invalid JSON', () => {
    localStorage.setItem('taiga.bad', 'not-json');
    expect(storage.get('bad')).toBeNull();
  });
});
