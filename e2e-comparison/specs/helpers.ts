import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const e2eRoot = join(__dirname, '..');

type AuthPayload = { auth_token: string; [k: string]: unknown };

function loadAuth(): AuthPayload {
  const p = join(e2eRoot, '.auth-cache.json');
  const raw = readFileSync(p, 'utf-8');
  return JSON.parse(raw) as AuthPayload;
}

export async function seedAngularSession(page: Page, baseURL: string): Promise<void> {
  const user = loadAuth();
  const token = user.auth_token;
  if (!token) throw new Error('seedAngularSession: missing auth_token in .auth-cache.json');
  const userJson = JSON.stringify(user);
  // Ensure same-origin storage: Angular reads token/userInfo from localStorage on app origin.
  await page.goto(baseURL.replace(/\/$/, '') + '/');
  await page.evaluate(
    ({ t, u }) => {
      localStorage.setItem('token', t);
      localStorage.setItem('userInfo', u);
    },
    { t: token, u: userJson },
  );
}

export async function loginReact(page: Page, baseURL: string): Promise<void> {
  await page.goto(`${baseURL}/login`);
  await page.locator('#username').fill('admin');
  await page.locator('#password').fill('adminpass');
  await Promise.all([
    page.waitForURL(/\/(\?|$)/, { timeout: 25000 }),
    page.getByRole('button', { name: /^login$/i }).click(),
  ]);
  // LoginPage triggers a full reload to re-hydrate auth state; wait until it settles.
  await page.waitForLoadState('domcontentloaded');
  await page.locator('nav.tg-navbar').waitFor({ state: 'visible', timeout: 20000 });
}
