import { type Page } from '@playwright/test';

export const ANGULAR_BASE = 'http://localhost:9000';
export const REACT_BASE = 'http://localhost:5173';
export const CREDENTIALS = { username: 'admin', password: 'adminpass' };
export const PROJECT_SLUG = 'project-4'; // non-blocked project

export async function loginAngular(page: Page): Promise<void> {
  await page.goto(`${ANGULAR_BASE}/login`);
  await page.fill('input[name="username"]', CREDENTIALS.username);
  await page.fill('input[name="password"]', CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${ANGULAR_BASE}/`, { timeout: 15_000 });
}

export async function loginReact(page: Page): Promise<void> {
  await page.goto(`${REACT_BASE}/login`);
  await page.locator('input[type="text"]').fill(CREDENTIALS.username);
  await page.locator('input[type="password"]').fill(CREDENTIALS.password);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${REACT_BASE}/`, { timeout: 15_000 });
}
