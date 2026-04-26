import type { Page } from '@playwright/test';

/** Angular boot + `$translate` resolution needs a short settle after navigation. */
export async function settleAfterNav(page: Page, ms = 2800) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(ms);
}

export function isAngular(projectName: string) {
  return projectName === 'angular';
}

/**
 * React `localStorage` uses raw strings; Angular `$tgStorage` JSON-stringifies scalars.
 */
export function seedAuthenticatedSession(page: Page, stack: 'angular' | 'react') {
  return page.addInitScript((s) => {
    const u = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      full_name: 'Admin User',
      auth_token: 'mock-token-e2e',
      lang: null,
      theme: null,
      photo: null,
      is_active: true,
    };
    const enc = (v: string) => (s === 'angular' ? JSON.stringify(v) : v);
    window.localStorage.setItem('token', enc('mock-token-e2e'));
    window.localStorage.setItem('refresh', enc('mock-refresh-e2e'));
    window.localStorage.setItem('userInfo', JSON.stringify(u));
  }, stack);
}
