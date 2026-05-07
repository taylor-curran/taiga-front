import { Page, expect } from '@playwright/test';

export const CREDENTIALS = { username: 'admin', password: 'adminpass' };
export const PROJECT_SLUG = 'project-4';

export async function login(page: Page) {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Angular uses input[name="username"], React uses unlabeled inputs
  const usernameInput =
    page.locator('input[name="username"]').or(page.locator('input[type="text"]')).first();
  const passwordInput =
    page.locator('input[name="password"]').or(page.locator('input[type="password"]')).first();

  await usernameInput.fill(CREDENTIALS.username);
  await passwordInput.fill(CREDENTIALS.password);

  // Angular uses button with title="Login", React uses button with text "Sign in"
  const submitBtn =
    page.locator('button[type="submit"]').first();
  await submitBtn.click();

  // Wait for navigation away from /login
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15_000 });
}
