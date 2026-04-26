import { describe, expect, it } from 'vitest';
import { adminRelatedPaths, projectAdminRoutes, userSettingsRoutes, globalAuthProfileRoutes } from './adminRoutes.export';

describe('admin route inventory', () => {
  it('excludes AngularJS and app/ from this package by construction', () => {
    expect(adminRelatedPaths.every((p) => !p.includes('app/'))).toBe(true);
  });

  it('keeps one entry per project admin feature from the Angular route table', () => {
    expect(projectAdminRoutes.length).toBe(24);
  });

  it('has user-settings and global companion routes for navigation parity', () => {
    expect(userSettingsRoutes.length).toBe(7);
    expect(globalAuthProfileRoutes.length).toBe(11);
  });
});
