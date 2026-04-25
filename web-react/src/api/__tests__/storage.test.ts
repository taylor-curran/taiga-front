import { describe, expect, it, beforeEach } from 'vitest';
import { storage } from '../storage';

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('round-trips JSON values', () => {
    storage.set('a', { x: 1, y: 'two' });
    expect(storage.get('a')).toEqual({ x: 1, y: 'two' });
  });
  it('returns null when key is missing', () => {
    expect(storage.get('missing')).toBeNull();
  });
  it('removes entries', () => {
    storage.set('k', 1);
    storage.remove('k');
    expect(storage.get('k')).toBeNull();
  });
});
