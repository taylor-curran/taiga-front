import { describe, it, expect } from 'vitest';
import { getAvatarUrl, getUserColor } from './gravatar';

describe('getAvatarUrl', () => {
  it('returns photo if present', () => {
    expect(getAvatarUrl({ photo: '/my-photo.jpg' })).toBe('/my-photo.jpg');
  });

  it('returns gravatar URL from gravatar_id', () => {
    const url = getAvatarUrl({ gravatar_id: 'abc123' });
    expect(url).toContain('gravatar.com/avatar/abc123');
    expect(url).toContain('d=identicon');
  });

  it('includes custom size', () => {
    const url = getAvatarUrl({ gravatar_id: 'abc123' }, 80);
    expect(url).toContain('s=80');
  });

  it('returns default gravatar for null user', () => {
    const url = getAvatarUrl(null);
    expect(url).toContain('gravatar.com/avatar/');
  });

  it('returns default gravatar for undefined user', () => {
    const url = getAvatarUrl(undefined);
    expect(url).toContain('gravatar.com/avatar/');
  });
});

describe('getUserColor', () => {
  it('returns user color', () => {
    expect(getUserColor({ color: '#ff0000' })).toBe('#ff0000');
  });

  it('returns default for null', () => {
    expect(getUserColor(null)).toBe('#a9aabc');
  });

  it('returns default for no color', () => {
    expect(getUserColor({})).toBe('#a9aabc');
  });
});
