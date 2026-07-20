import type { Page } from '@playwright/test';

export async function mockTaigaApi(page: Page, baseURL: string) {
  const apiRoot = new URL('/api/v1/', baseURL).href;

  await page.route('**/conf.json', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        api: `${apiRoot}/`,
        defaultLanguage: 'en',
        defaultLoginEnabled: true,
        loginFormType: 'normal',
        publicRegisterEnabled: false,
      }),
    });
  });

  await page.route('**/api/v1/auth', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    const body = route.request().postDataJSON() as { username?: string; password?: string };
    if (body?.username === 'bad') {
      await route.fulfill({ status: 400, body: '{}' });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 1,
        username: body.username || 'user',
        auth_token: 'mock-token',
        refresh: 'mock-refresh',
      }),
    });
  });
}

export async function mockProjectBySlug(
  page: Page,
  slug: string,
  payload: { i_am_admin: boolean; name?: string },
) {
  await page.route(`**/api/v1/projects/by_slug?slug=${encodeURIComponent(slug)}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 99,
        slug,
        name: payload.name ?? 'Mock project',
        i_am_admin: payload.i_am_admin,
        my_permissions: [],
      }),
    });
  });
}
