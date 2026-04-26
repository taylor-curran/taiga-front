import { expect, test } from '@playwright/test';

const conf = {
    api: 'http://127.0.0.1:5173/api/v1/',
    publicRegisterEnabled: true,
    defaultLanguage: 'en',
    defaultLoginEnabled: true,
    loginFormType: 'normal',
    eventsUrl: null,
    debug: true,
};

test.describe('auth (mocked API)', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('**/conf.json', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify(conf),
            });
        });
    });

    test('login posts auth body with type normal', async ({ page }) => {
        let posted: unknown = null;
        await page.route('**/api/v1/auth', async (route) => {
            if (route.request().method() !== 'POST') {
                await route.continue();
                return;
            }
            posted = route.request().postDataJSON();
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    id: 1,
                    username: 'admin',
                    email: 'a@a.com',
                    full_name: 'Admin',
                    auth_token: 'test-token',
                    refresh: 'test-refresh',
                }),
            });
        });

        await page.goto('/login');
        await page.locator('input[name="username"]').waitFor({ state: 'visible', timeout: 15_000 });
        await page.locator('input[name="password"]').waitFor({ state: 'visible' });
        await page.locator('input[name="username"]').fill('admin');
        await page.locator('input[name="password"]').fill('adminpass');
        await page.getByTestId('login-submit').click();
        await expect
            .poll(() => posted as { type?: string } | null)
            .toMatchObject({
                username: 'admin',
                password: 'adminpass',
                type: 'normal',
            });
    });

    test('guarded route redirects to login with next', async ({ page }) => {
        await page.goto('/user-settings/user-profile');
        await expect(page).toHaveURL(/\/login\?next=/);
    });
});
