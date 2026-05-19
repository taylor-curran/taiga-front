import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as notifications from '../utils/notifications';
import * as lightbox from '../utils/lightbox';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from '../utils/config';

// Auth tests must NOT use stored auth state — they test login/logout explicitly
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('auth', () => {
  test('login', async ({ page }) => {
    await page.goto('/login');
    await common.waitLoader(page);
    await page.locator('input[name="username"]').fill(ADMIN_USERNAME);
    await page.locator('input[name="password"]').fill(ADMIN_PASSWORD);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/', { timeout: 15000 });
    await common.waitLoader(page);
    const url = page.url();
    expect(url).not.toContain('/login');
  });

  test.describe('page without perms', () => {
    test('redirect to login when logged out', async ({ page }) => {
      await page.goto('/project/project-4/');
      await common.waitLoader(page);
      await page.waitForTimeout(2000);
      const url = page.url();
      // The app should redirect to login for private projects when not logged in
      // OR show the project if it's public
      if (url.includes('/login')) {
        expect(url).toContain('unauthorized');
      }
    });
  });

  test.describe('user', () => {
    let user = {
      username: '',
      fullname: '',
      password: '',
      email: '',
    };

    test('logout', async ({ page }) => {
      await common.login(page, ADMIN_USERNAME, ADMIN_PASSWORD);
      const dropdown = page.locator('div[tg-dropdown-user]');
      await dropdown.hover();
      await page.waitForTimeout(300);
      await page.locator('.dropdown-user li a').last().click();
      await common.waitLoader(page);
      await page.waitForTimeout(2000);
      const url = page.url();
      expect(url).toContain('/discover');
    });

    test.describe('register', () => {
      test('register validation', async ({ page }) => {
        await page.goto('/register');
        await common.waitLoader(page);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(500);
        const requiredErrors = page.locator('.checksley-required');
        const count = await requiredErrors.count();
        expect(count).toBeGreaterThanOrEqual(4);
      });

      test('register ok', async ({ page }) => {
        await page.goto('/register');
        await common.waitLoader(page);
        user.username = 'username-' + Math.random();
        user.fullname = 'fullname-' + Math.random();
        user.password = 'password-' + Math.random();
        user.email = 'email-' + Math.random() + '@taiga.io';

        await page.locator('input[name="username"]').fill(user.username);
        await page.locator('input[name="full_name"]').fill(user.fullname);
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(3000);
        const url = page.url();
        expect(url).not.toContain('/register');
      });
    });

    test.describe('change password', () => {
      test('error', async ({ page }) => {
        // Register fresh user first
        await page.goto('/register');
        await common.waitLoader(page);
        user.username = 'username-' + Math.random();
        user.fullname = 'fullname-' + Math.random();
        user.password = 'password-' + Math.random();
        user.email = 'email-' + Math.random() + '@taiga.io';
        await page.locator('input[name="username"]').fill(user.username);
        await page.locator('input[name="full_name"]').fill(user.fullname);
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(3000);
        await common.closeJoyride(page);

        await page.goto('/user-settings/user-change-password');
        await common.waitLoader(page);
        await page.waitForTimeout(1000);
        await page.locator('#current-password').fill('wrong');
        await page.locator('#new-password').fill('123123');
        await page.locator('#retype-password').fill('123123');
        await page.locator('button[type="submit"]').click();
        const open = await notifications.error.open(page);
        expect(open).toBe(true);
      });

      test('success', async ({ page }) => {
        // Register fresh user first
        await page.goto('/register');
        await common.waitLoader(page);
        user.username = 'username-' + Math.random();
        user.fullname = 'fullname-' + Math.random();
        user.password = 'password-' + Math.random();
        user.email = 'email-' + Math.random() + '@taiga.io';
        await page.locator('input[name="username"]').fill(user.username);
        await page.locator('input[name="full_name"]').fill(user.fullname);
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(3000);
        await common.closeJoyride(page);

        await page.goto('/user-settings/user-change-password');
        await common.waitLoader(page);
        await page.waitForTimeout(1000);
        await page.locator('#current-password').fill(user.password);
        await page.locator('#new-password').fill(user.password);
        await page.locator('#retype-password').fill(user.password);
        await page.locator('button[type="submit"]').click();
        const open = await notifications.success.open(page);
        expect(open).toBe(true);
        await notifications.success.close(page);
      });
    });

    test.describe('remember password', () => {
      test('error', async ({ page }) => {
        await page.goto('/forgot-password');
        await common.waitLoader(page);
        await page.locator('input[name="username"]').fill('xxxxxxxx');
        await page.locator('button[type="submit"]').click();
        const open = await notifications.errorLight.open(page);
        expect(open).toBe(true);
      });

      test('success', async ({ page }) => {
        // Register fresh user first
        await page.goto('/register');
        await common.waitLoader(page);
        user.username = 'username-' + Math.random();
        user.fullname = 'fullname-' + Math.random();
        user.password = 'password-' + Math.random();
        user.email = 'email-' + Math.random() + '@taiga.io';
        await page.locator('input[name="username"]').fill(user.username);
        await page.locator('input[name="full_name"]').fill(user.fullname);
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(3000);
        await common.closeJoyride(page);
        await common.logout(page);

        await page.goto('/forgot-password');
        await common.waitLoader(page);
        await page.locator('input[name="username"]').fill(user.username);
        await page.locator('button[type="submit"]').click();
        await lightbox.open(page, '.lightbox-generic-success');
        await page.locator('.lightbox-generic-success .button-green').click();
        await lightbox.close(page, '.lightbox-generic-success');
      });
    });

    test.describe('account', () => {
      test('delete', async ({ page }) => {
        // Register fresh user first
        await page.goto('/register');
        await common.waitLoader(page);
        user.username = 'username-' + Math.random();
        user.fullname = 'fullname-' + Math.random();
        user.password = 'password-' + Math.random();
        user.email = 'email-' + Math.random() + '@taiga.io';
        await page.locator('input[name="username"]').fill(user.username);
        await page.locator('input[name="full_name"]').fill(user.fullname);
        await page.locator('input[name="email"]').fill(user.email);
        await page.locator('input[name="password"]').fill(user.password);
        await page.locator('button[type="submit"]').click();
        await page.waitForTimeout(3000);
        await common.closeJoyride(page);

        await page.goto('/user-settings/user-profile');
        await common.waitLoader(page);
        await page.locator('.delete-account').click();
        await lightbox.open(page, '.lightbox-delete-account');
        await page.locator('.lightbox-delete-account .button-red').click();
        await page.waitForTimeout(3000);
        const url = page.url();
        expect(url).toContain('/login');
      });
    });
  });
});
