// Shared helpers for parity specs. The same specs run against both
// AngularJS (taiga-front, served by the gateway on :9000) and the React port
// (web-react, served by Vite on :5173). Each spec asserts AngularJS behaviour;
// the React port is *expected* to fail many of them — those failures are the
// audit findings.

import { Page, expect } from '@playwright/test';

export const ANGULAR_URL =
  process.env.ANGULAR_URL || 'http://localhost:9000';
export const REACT_URL =
  process.env.REACT_URL || 'http://localhost:5173';

export const TARGET =
  ((process.env.PARITY_TARGET || 'angular') as 'angular' | 'react');

export const ADMIN_USER = process.env.TAIGA_ADMIN_USER || 'admin';
export const ADMIN_PASS = process.env.TAIGA_ADMIN_PASS || 'adminpass';
export const PROJECT_SLUG = process.env.TAIGA_PROJECT_SLUG || 'project-1';

/**
 * Authenticate against the gateway and seed both apps' shared localStorage keys
 * (`token`, `refresh`, `userInfo`) so the page is logged in. Both Angular and
 * React intentionally read the same keys (see web-react/README.md), so this
 * helper works for both targets.
 */
export async function login(page: Page) {
  // The login endpoint must be hit through the gateway because the React dev
  // server proxies /api but only on its own origin. Hit the gateway directly
  // and then transplant the token into the React origin.
  const r = await page.request.post(`${ANGULAR_URL}/api/v1/auth`, {
    data: { type: 'normal', username: ADMIN_USER, password: ADMIN_PASS },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(r.ok()).toBeTruthy();
  const data = await r.json();

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.evaluate(({ token, refresh, info }) => {
    localStorage.setItem('token', JSON.stringify(token));
    if (refresh) localStorage.setItem('refresh', JSON.stringify(refresh));
    localStorage.setItem('userInfo', JSON.stringify(info));
  }, { token: data.auth_token, refresh: data.refresh, info: data });
}

export async function gotoAuthed(page: Page, p: string) {
  await login(page);
  await page.goto(p, { waitUntil: 'networkidle' }).catch(async () => {
    await page.goto(p, { waitUntil: 'load' });
  });
  // Give Angular's $digest / React's effects a tick to render lists.
  await page.waitForTimeout(1500);
}

/**
 * Check a piece of visible text exists on the page (case-insensitive,
 * collapses whitespace). Useful for quick parity assertions where the
 * AngularJS app uses translate keys / uppercase styling that the React port
 * may have replaced.
 */
export async function expectText(page: Page, needle: RegExp | string) {
  const re = typeof needle === 'string' ? new RegExp(needle, 'i') : needle;
  await expect(page.locator('body')).toContainText(re);
}

/** Persist a screenshot for the comparison report under reports/<target>/. */
export async function snap(page: Page, name: string) {
  await page.screenshot({ path: `reports/${TARGET}/${name}.png`, fullPage: true });
}
