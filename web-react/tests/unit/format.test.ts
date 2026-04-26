import { describe, expect, it } from 'vitest';
import { gravatarUrl, statusContrastColor, formatDate, pluralize, userPhotoUrl } from '@/lib/format';

describe('format helpers', () => {
  it('builds gravatar URL', () => {
    expect(gravatarUrl('abc')).toBe('https://www.gravatar.com/avatar/abc?s=80&d=identicon');
    expect(gravatarUrl('abc', 40)).toBe('https://www.gravatar.com/avatar/abc?s=40&d=identicon');
    expect(gravatarUrl(null)).toBe('');
  });

  it('prefers explicit photo over gravatar', () => {
    expect(userPhotoUrl({ photo: 'http://x/y.png', gravatar_id: 'abc' })).toBe('http://x/y.png');
    expect(userPhotoUrl({ photo: null, gravatar_id: 'abc' }, 40)).toBe(
      'https://www.gravatar.com/avatar/abc?s=40&d=identicon',
    );
    expect(userPhotoUrl(null)).toBe('');
  });

  it('formats date strings', () => {
    expect(formatDate('2024-04-25T10:00:00Z')).not.toBe('');
    expect(formatDate(null)).toBe('');
    expect(formatDate('not-a-date')).toBe('');
  });

  it('pluralizes', () => {
    expect(pluralize(1, 'sprint')).toBe('sprint');
    expect(pluralize(2, 'sprint')).toBe('sprints');
    expect(pluralize(2, 'task', 'tasks')).toBe('tasks');
  });

  it('picks readable text colour for a status pill', () => {
    expect(statusContrastColor('#ffffff')).toBe('#1f2937');
    expect(statusContrastColor('#000000')).toBe('#fff');
    expect(statusContrastColor('#5e9bda')).toBe('#fff');
    expect(statusContrastColor('not-a-color')).toBe('#fff');
  });
});
