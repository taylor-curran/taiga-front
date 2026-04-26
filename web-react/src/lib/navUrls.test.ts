import { describe, expect, it } from 'vitest';
import { resolveNavUrl } from './navUrls';

describe('resolveNavUrl', () => {
  it('matches Angular $tgNavUrls (no leading slash)', () => {
    expect(resolveNavUrl('discover')).toBe('discover');
    expect(resolveNavUrl('discover-search')).toBe('discover/search');
    expect(resolveNavUrl('login')).toBe('login');
  });

  it('interpolates :project', () => {
    expect(resolveNavUrl('project', { project: 'acme' })).toBe('project/acme');
  });
});
