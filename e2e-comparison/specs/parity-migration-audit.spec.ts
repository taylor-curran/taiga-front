import { test, expect } from '@playwright/test';

const waitRoute = async (page: import('@playwright/test').Page) => {
  await page.waitForTimeout(2000);
};

test.describe('Taiga Angular vs React (react port is scaffold) — one assertion per row in migration-audit-results.csv', () => {
  test('parity_root_unauthenticated_redirects_to_discover_only_in_angular', async ({ page }, testInfo) => {
    await page.goto('/');
    await waitRoute(page);
    if (testInfo.project.name === 'angular') {
      await expect(page).toHaveURL(/\/discover/);
    } else {
      await expect(page).not.toHaveURL(/\/discover/);
    }
  });

  test('parity_discover_heading_discover_projects', async ({ page }, testInfo) => {
    await page.goto('/discover');
    await waitRoute(page);
    const h = page.getByRole('heading', { name: 'Discover projects', level: 1 });
    if (testInfo.project.name === 'angular') {
      await expect(h).toBeVisible();
    } else {
      await expect(h).toHaveCount(0);
    }
  });

  test('parity_discover_document_title', async ({ page }, testInfo) => {
    await page.goto('/discover');
    await waitRoute(page);
    if (testInfo.project.name === 'angular') {
      await expect(page).toHaveTitle('Discover projects - Taiga');
    } else {
      await expect(page).toHaveTitle('Taiga (React port)');
    }
  });

  test('parity_discover_search_input_placeholder', async ({ page }, testInfo) => {
    await page.goto('/discover');
    await waitRoute(page);
    const ph = page.getByPlaceholder('Type something...');
    if (testInfo.project.name === 'angular') {
      await expect(ph).toBeVisible();
    } else {
      await expect(ph).toHaveCount(0);
    }
  });

  test('parity_root_document_title', async ({ page }, testInfo) => {
    await page.goto('/');
    await waitRoute(page);
    if (testInfo.project.name === 'angular') {
      await expect(page).toHaveTitle('Discover projects - Taiga');
    } else {
      await expect(page).toHaveTitle('Taiga (React port)');
    }
  });

  test('parity_root_h1', async ({ page }, testInfo) => {
    await page.goto('/');
    await waitRoute(page);
    const s = page.getByRole('heading', { name: 'Taiga (React port) — scaffold', level: 1 });
    const d = page.getByRole('heading', { name: 'Discover projects', level: 1 });
    if (testInfo.project.name === 'angular') {
      await expect(s).toHaveCount(0);
      await expect(d).toBeVisible();
    } else {
      await expect(s).toBeVisible();
      await expect(d).toHaveCount(0);
    }
  });

  test('parity_topbar_login_cta', async ({ page }, testInfo) => {
    await page.goto('/discover');
    await waitRoute(page);
    const login = page
      .getByRole('navigation')
      .getByRole('link', { name: 'Login' })
      .first();
    if (testInfo.project.name === 'angular') {
      await expect(login).toBeVisible();
    } else {
      await expect(page.getByRole('navigation')).toHaveCount(0);
    }
  });

  test('parity_unknown_path_shows_angular_404', async ({ page }, testInfo) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await waitRoute(page);
    const notFound = page.getByRole('heading', { name: 'Not found', level: 1 });
    if (testInfo.project.name === 'angular') {
      await expect(notFound).toBeVisible();
    } else {
      await expect(notFound).toHaveCount(0);
    }
  });

  test('parity_unknown_path_404_subtext', async ({ page }, testInfo) => {
    await page.goto('/this-route-does-not-exist-xyz');
    await waitRoute(page);
    const p = page.getByText(/Error 404/i).first();
    if (testInfo.project.name === 'angular') {
      await expect(p).toBeVisible();
    } else {
      await expect(
        page.getByRole('heading', { name: 'Taiga (React port) — scaffold', level: 1 })
      ).toBeVisible();
    }
  });

  test('parity_login_document_title', async ({ page }, testInfo) => {
    await page.goto('/login');
    await waitRoute(page);
    if (testInfo.project.name === 'angular') {
      await expect(page).toHaveTitle('Login - Taiga');
    } else {
      await expect(page).toHaveTitle('Taiga (React port)');
    }
  });

  test('parity_login_brand_h1_taiga', async ({ page }, testInfo) => {
    await page.goto('/login');
    await waitRoute(page);
    const t = page.getByRole('heading', { name: 'Taiga', level: 1, exact: true });
    if (testInfo.project.name === 'angular') {
      await expect(t).toBeVisible();
    } else {
      await expect(t).toHaveCount(0);
    }
  });

  test('parity_login_tagline', async ({ page }, testInfo) => {
    await page.goto('/login');
    await waitRoute(page);
    const t = page.getByRole('heading', { name: 'LOVE YOUR PROJECT', level: 2 });
    if (testInfo.project.name === 'angular') {
      await expect(t).toBeVisible();
    } else {
      await expect(t).toHaveCount(0);
    }
  });

  test('parity_login_username_placeholder', async ({ page }, testInfo) => {
    await page.goto('/login');
    await waitRoute(page);
    const f = page.getByPlaceholder('Username or email (case sensitive)').first();
    if (testInfo.project.name === 'angular') {
      await expect(f).toBeVisible();
    } else {
      await expect(f).toHaveCount(0);
    }
  });

  test('parity_login_password_placeholder', async ({ page }, testInfo) => {
    await page.goto('/login');
    await waitRoute(page);
    const f = page.getByPlaceholder('Password (case sensitive)').first();
    if (testInfo.project.name === 'angular') {
      await expect(f).toBeVisible();
    } else {
      await expect(f).toHaveCount(0);
    }
  });

  test('parity_login_forgot_link', async ({ page }, testInfo) => {
    await page.goto('/login');
    await waitRoute(page);
    const a = page.getByRole('link', { name: 'Forgot it?' }).first();
    if (testInfo.project.name === 'angular') {
      await expect(a).toBeVisible();
    } else {
      await expect(a).toHaveCount(0);
    }
  });

  test('parity_login_submit_button', async ({ page }, testInfo) => {
    await page.goto('/login');
    await waitRoute(page);
    const b = page.getByRole('button', { name: 'Login' }).first();
    if (testInfo.project.name === 'angular') {
      await expect(b).toBeVisible();
    } else {
      await expect(b).toHaveCount(0);
    }
  });
});
