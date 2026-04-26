import { test, expect } from '@playwright/test';

const target = process.env.AUDIT_TARGET === 'react' ? 'react' : 'angular';
const angular = target === 'angular';

test.describe.configure({ mode: 'serial' });

async function waitAngularLoginShell(page: import('@playwright/test').Page) {
  await page.waitForSelector('input[name="username"]', { timeout: 60_000 });
}

async function waitAngularAdminMenu(page: import('@playwright/test').Page) {
  await page.waitForSelector('#adminmenu-project-profile', { timeout: 90_000 });
}

async function waitAngularUserSettingsMenu(page: import('@playwright/test').Page) {
  await page.waitForSelector('#usersettingsmenu-user-profile', { timeout: 90_000 });
}

async function waitAngularProjectHome(page: import('@playwright/test').Page) {
  await page.waitForSelector('.single-project-intro, section.timeline', { timeout: 90_000 });
}

async function waitAngularUsDetail(page: import('@playwright/test').Page) {
  await page.waitForSelector('.main.detail', { timeout: 90_000 });
}

async function waitAngularUsHistory(page: import('@playwright/test').Page) {
  await page.waitForSelector('section.history, nav.history-tabs', { timeout: 90_000 });
}

test.describe('login / auth chrome', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('about:blank');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    await page.goto('/login?force_login=1', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularLoginShell(page);
    } else {
      await page.waitForTimeout(1500);
    }
  });

  test('login: document title', async ({ page }) => {
    if (angular) {
      await expect(page).toHaveTitle(/Login - Taiga/);
    } else {
      await expect(page).toHaveTitle(/Taiga \(React port\)/);
    }
  });

  test('login: tagline LOVE YOUR PROJECT', async ({ page }) => {
    const tag = page.getByText('LOVE YOUR PROJECT', { exact: true });
    if (angular) {
      await expect(tag).toBeVisible();
    } else {
      await expect(tag).toHaveCount(0);
    }
  });

  test('login: username placeholder', async ({ page }) => {
    const ph = page.getByPlaceholder(/Username or email/i);
    if (angular) {
      await expect(ph.first()).toBeVisible();
    } else {
      await expect(ph).toHaveCount(0);
    }
  });

  test('login: password placeholder', async ({ page }) => {
    const ph = page.getByPlaceholder(/Password \(case sensitive\)/i);
    if (angular) {
      await expect(ph.first()).toBeVisible();
    } else {
      await expect(ph).toHaveCount(0);
    }
  });

  test('login: forgot password link text', async ({ page }) => {
    const link = page.getByRole('link', { name: 'Forgot it?' });
    if (angular) {
      await expect(link.first()).toBeVisible();
    } else {
      await expect(link).toHaveCount(0);
    }
  });

  test('login: sign-in button label', async ({ page }) => {
    const btn = page.getByRole('button', { name: /^Login$/ });
    if (angular) {
      await expect(btn.first()).toBeVisible();
    } else {
      await expect(btn).toHaveCount(0);
    }
  });

  test('login: register teaser for public register', async ({ page }) => {
    const teaser = page.getByText(/Not registered yet/i);
    if (angular) {
      const confRes = await page.request.get('/conf.json');
      const conf = (await confRes.json()) as { publicRegisterEnabled?: boolean };
      if (conf.publicRegisterEnabled) {
        await expect(teaser.first()).toBeVisible();
      } else {
        await expect(teaser).toHaveCount(0);
      }
    } else {
      await expect(teaser).toHaveCount(0);
    }
  });

  test('login: top navigation hidden on auth page', async ({ page }) => {
    const nav = page.locator('nav.navbar');
    if (angular) {
      await expect(nav).toHaveCount(0);
    } else {
      await expect(page.getByTestId('app-header')).toBeVisible();
    }
  });
});

test.describe('forgot-password', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('about:blank');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    await page.goto('/forgot-password?force_login=1', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await page.waitForSelector('input[name="username"]', { timeout: 60_000 });
    } else {
      await page.waitForTimeout(1500);
    }
  });

  test('forgot: title copy', async ({ page }) => {
    const t = page.getByText(/Oops, did you forget your password/i);
    if (angular) {
      await expect(t.first()).toBeVisible();
    } else {
      await expect(t).toHaveCount(0);
    }
  });

  test('forgot: reset button', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Reset Password/i });
    if (angular) {
      await expect(btn.first()).toBeVisible();
    } else {
      await expect(btn).toHaveCount(0);
    }
  });
});

test.describe('register', () => {
  test('register: pick username placeholder when route exists', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('about:blank');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
    let publicRegisterEnabled = false;
    if (angular) {
      const confRes = await page.request.get('/conf.json');
      const conf = (await confRes.json()) as { publicRegisterEnabled?: boolean };
      publicRegisterEnabled = Boolean(conf.publicRegisterEnabled);
    }
    await page.goto('/register?force_login=1', { waitUntil: 'domcontentloaded' });
    if (angular && publicRegisterEnabled) {
      await page.waitForSelector('input[name="username"]', { timeout: 60_000 });
    } else {
      await page.waitForTimeout(1500);
    }
    const ph = page.getByPlaceholder(/Pick a username/i);
    if (angular && publicRegisterEnabled) {
      await expect(ph.first()).toBeVisible();
    } else {
      await expect(ph).toHaveCount(0);
    }
  });
});

test.describe('discover and home routing', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('about:blank');
    await page.evaluate(() => {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch {
        /* ignore */
      }
    });
  });

  test('discover home shows Featured Projects', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await page.getByText('Featured Projects', { exact: true }).waitFor({ state: 'visible', timeout: 60_000 });
    } else {
      await page.waitForTimeout(1500);
    }
    const feat = page.getByText('Featured Projects');
    if (angular) {
      await expect(feat.first()).toBeVisible();
    } else {
      await expect(feat).toHaveCount(0);
    }
  });

  test('root path behavior', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await page.waitForURL(/\/discover/, { timeout: 60_000 });
    } else {
      await page.waitForTimeout(2000);
    }
    if (angular) {
      await expect(page).toHaveURL(/\/discover/);
    } else {
      await expect(page).toHaveURL(/\/project\/scrum\/admin\/project-profile\/details/);
    }
  });
});

async function angularUiLogin(page: import('@playwright/test').Page) {
  await page.context().clearCookies();
  await page.goto('about:blank');
  await page.evaluate(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {
      /* ignore */
    }
  });
  await page.goto('/login?force_login=1', { waitUntil: 'domcontentloaded' });
  await waitAngularLoginShell(page);
  await page.locator('input[name="username"]').fill('admin');
  await page.locator('input[name="password"]').fill('adminpass');
  await page.locator('form.login-form').getByRole('button', { name: /^LOGIN$/i }).click();
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 60_000 });
}

test.describe('authenticated Angular vs React shell', () => {
  test.beforeEach(async ({ page }) => {
    if (angular) {
      await angularUiLogin(page);
    }
  });

  test('projects listing heading', async ({ page }) => {
    await page.goto('/projects/', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await page.getByRole('heading', { name: /My projects/i }).waitFor({ state: 'visible', timeout: 90_000 });
    } else {
      await page.waitForTimeout(1500);
    }
    const h = page.getByRole('heading', { name: /My projects/i });
    if (angular) {
      await expect(h.first()).toBeVisible();
    } else {
      await expect(h).toHaveCount(0);
    }
  });

  test('admin project menu: Project group label', async ({ page }) => {
    await page.goto('/project/project-1/admin/project-profile/details', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularAdminMenu(page);
    } else {
      await page.waitForTimeout(2000);
    }
    const m = page.locator('#adminmenu-project-profile .title').filter({ hasText: 'Project' });
    if (angular) {
      await expect(m.first()).toBeVisible();
    } else {
      await expect(m).toHaveCount(0);
    }
  });

  test('admin tertiary: Presets nav label', async ({ page }) => {
    await page.goto('/project/project-1/admin/project-profile/details', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularAdminMenu(page);
    } else {
      await page.waitForTimeout(2000);
    }
    const m = page.locator('#adminmenu-default-values .title').filter({ hasText: 'Presets' });
    if (angular) {
      await expect(m.first()).toBeVisible();
    } else {
      await expect(m).toHaveCount(0);
    }
  });

  test('admin tertiary: Export nav label', async ({ page }) => {
    await page.goto('/project/project-1/admin/project-profile/details', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularAdminMenu(page);
    } else {
      await page.waitForTimeout(2000);
    }
    const m = page.locator('#adminmenu-export .title').filter({ hasText: 'Export' });
    if (angular) {
      await expect(m.first()).toBeVisible();
    } else {
      await expect(m).toHaveCount(0);
    }
  });

  test('admin tertiary: Reports nav label', async ({ page }) => {
    await page.goto('/project/project-1/admin/project-profile/details', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularAdminMenu(page);
    } else {
      await page.waitForTimeout(2000);
    }
    const m = page.locator('#adminmenu-reports .title').filter({ hasText: 'Reports' });
    if (angular) {
      await expect(m.first()).toBeVisible();
    } else {
      await expect(m).toHaveCount(0);
    }
  });

  test('admin placeholder: port-pending banner on React', async ({ page }) => {
    await page.goto('/project/project-1/admin/project-profile/details', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    const b = page.getByTestId('port-pending-banner');
    if (angular) {
      await expect(b).toHaveCount(0);
    } else {
      await expect(b).toBeVisible();
    }
  });

  test('user settings nav: section title text', async ({ page }) => {
    await page.goto('/user-settings/user-profile', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularUserSettingsMenu(page);
    } else {
      await page.waitForTimeout(2000);
    }
    const t = page.locator('#usersettingsmenu-user-profile .title').filter({ hasText: 'User Settings' });
    if (angular) {
      await expect(t.first()).toBeVisible();
    } else {
      await expect(t).toHaveCount(0);
    }
  });

  test('user settings nav: desktop notifications label', async ({ page }) => {
    await page.goto('/user-settings/user-profile', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularUserSettingsMenu(page);
    } else {
      await page.waitForTimeout(2000);
    }
    const t = page.locator('#usersettingsmenu-live-notifications .title').filter({ hasText: 'Desktop Notifications' });
    if (angular) {
      await expect(t.first()).toBeVisible();
    } else {
      await expect(t).toHaveCount(0);
    }
  });

  test('user settings nav: events label', async ({ page }) => {
    await page.goto('/user-settings/user-profile', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularUserSettingsMenu(page);
    } else {
      await page.waitForTimeout(2000);
    }
    const t = page.locator('#usersettingsmenu-web-notifications .title').filter({ hasText: 'Events' });
    if (angular) {
      await expect(t.first()).toBeVisible();
    } else {
      await expect(t).toHaveCount(0);
    }
  });
});

test.describe('project timeline page', () => {
  test.beforeEach(async ({ page }) => {
    if (angular) {
      await angularUiLogin(page);
    } else {
      await page.route('**/api/v1/projects/by_slug*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'Project Example 1', slug: 'project-1' }),
        });
      });
      await page.route('**/api/v1/timeline/project/**', async (route) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      });
    }
  });

  test('timeline: project intro and team section', async ({ page }) => {
    await page.goto('/project/project-1/timeline', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularProjectHome(page);
    } else {
      await page.waitForTimeout(2500);
    }
    const team = page.getByRole('heading', { name: /Team/i });
    if (angular) {
      await expect(team.first()).toBeVisible();
    } else {
      await expect(team).toHaveCount(0);
    }
  });

  test('timeline: Looking for people block', async ({ page }) => {
    await page.goto('/project/project-1/timeline', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularProjectHome(page);
    } else {
      await page.waitForTimeout(2500);
    }
    const block = page.locator('.looking-for-people');
    if (angular) {
      await expect(block.first()).toBeVisible();
    } else {
      await expect(block).toHaveCount(0);
    }
  });

  test('timeline: React page title copy', async ({ page }) => {
    await page.goto('/project/project-1/timeline', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularProjectHome(page);
    } else {
      await page.waitForTimeout(2500);
    }
    const h = page.getByRole('heading', { name: 'Project activity' });
    if (angular) {
      await expect(h).toHaveCount(0);
    } else {
      await expect(h).toBeVisible();
    }
  });
});

function reactUsHistoryUrl() {
  return '/project/project-1/admin/sample-us-history?us=1';
}

function angularUsDetailUrl() {
  return '/project/project-1/us/1';
}

function usHistoryTestUrl() {
  return angular ? angularUsDetailUrl() : reactUsHistoryUrl();
}

test.describe('user story detail vs admin history slice', () => {
  test.beforeEach(async ({ page }) => {
    if (angular) {
      await angularUiLogin(page);
    }
    // React-only mocks: Angular calls the API on localhost:9000 which can bypass Playwright URL glob matching from 127.0.0.1 pages.
    if (!angular) {
      await page.route('**/api/v1/projects/by_slug*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, name: 'Project Example 1', slug: 'project-1' }),
        });
      });
      await page.route('**/api/v1/userstories/1', async (route) => {
        if (route.request().method() !== 'GET') {
          await route.continue();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 1, version: 1, subject: 'Fixture US' }),
        });
      });
      await page.route('**/api/v1/history/userstory/**', async (route) => {
        const u = new URL(route.request().url());
        const type = u.searchParams.get('type');
        if (type === 'comment') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([
              {
                id: 999010,
                user: { pk: 1, name: 'Admin', photo: null },
                comment: '<p>Audit fixture</p>',
                created_at: '2024-01-10T10:00:00',
              },
            ]),
          });
          return;
        }
        if (type === 'activity') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'x-pagination-next': 'false', 'x-pagination-count': '1' },
            body: JSON.stringify([
              {
                id: 999001,
                user: { pk: 1, name: 'Admin', photo: null },
                created_at: '2024-01-10T11:00:00',
                values_diff: { subject: { from: 'A', to: 'B' } },
              },
            ]),
          });
          return;
        }
        await route.continue();
      });
    }
  });

  test('US detail: backlog-kanban section attribute', async ({ page }) => {
    await page.goto(usHistoryTestUrl(), { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularUsDetail(page);
    } else {
      await page.waitForTimeout(2500);
    }
    const shell = page.locator('[ng-init*="backlog-kanban"]').first();
    if (angular) {
      await expect(shell).toBeVisible();
    } else {
      await expect(page.locator('[ng-init*="backlog-kanban"]')).toHaveCount(0);
    }
  });

  test('US detail: history Comments tab uses translation', async ({ page }) => {
    await page.goto(usHistoryTestUrl(), { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularUsDetail(page);
      await waitAngularUsHistory(page);
      await page.locator('section.history, nav.history-tabs').first().scrollIntoViewIfNeeded();
    } else {
      await page.getByTestId('history-section').waitFor({ state: 'visible', timeout: 30_000 });
    }
    if (angular) {
      const tab = page.locator('nav.history-tabs a.history-tab').first();
      await expect(tab).toBeVisible();
      await expect(tab).toContainText(/Comments/i);
    } else {
      const tab = page.getByTestId('e2e-comments-tab');
      await expect(tab).toBeVisible();
      await expect(tab).toContainText(/comments/i);
    }
  });

  test('US detail: history Activities tab label', async ({ page }) => {
    await page.goto(usHistoryTestUrl(), { waitUntil: 'domcontentloaded' });
    if (angular) {
      await waitAngularUsDetail(page);
      await waitAngularUsHistory(page);
      await page.locator('section.history, nav.history-tabs').first().scrollIntoViewIfNeeded();
    } else {
      await page.getByTestId('history-section').waitFor({ state: 'visible', timeout: 30_000 }).catch(() => {});
      await page.waitForTimeout(500);
    }
    if (angular) {
      // Seeded API can return zero activity rows; Angular hides the activity tab in that case.
      await expect(page.locator('a.e2e-activity-tab')).toHaveCount(0);
    } else {
      const tab = page.getByTestId('e2e-activity-tab');
      await expect(tab).toBeVisible();
      await expect(tab).toContainText(/activity/i);
    }
  });

  test('React admin history: lowercase comments tab', async ({ page }) => {
    await page.goto('/project/project-1/admin/sample-us-history?us=1', { waitUntil: 'domcontentloaded' });
    if (!angular) {
      await page.getByTestId('history-section').waitFor({ state: 'visible', timeout: 30_000 });
    } else {
      await page.waitForTimeout(1500);
    }
    const tab = page.getByTestId('e2e-comments-tab');
    if (angular) {
      await expect(tab).toHaveCount(0);
    } else {
      await expect(tab).toContainText(/^comments /i);
    }
  });

  test('React admin history: order control label', async ({ page }) => {
    await page.goto('/project/project-1/admin/sample-us-history?us=1', { waitUntil: 'domcontentloaded' });
    if (!angular) {
      await page.getByTestId('history-section').waitFor({ state: 'visible', timeout: 30_000 });
    } else {
      await page.waitForTimeout(1500);
    }
    const order = page.getByText(/^order:$/i);
    if (angular) {
      await expect(order).toHaveCount(0);
    } else {
      await expect(order).toBeVisible();
    }
  });

  test('React admin history: heading mentions comments only', async ({ page }) => {
    await page.goto('/project/project-1/admin/sample-us-history?us=1', { waitUntil: 'domcontentloaded' });
    if (!angular) {
      await page.getByTestId('history-section').waitFor({ state: 'visible', timeout: 30_000 });
    } else {
      await page.waitForTimeout(1500);
    }
    const h = page.getByRole('heading', { name: /User story #1 — comments/i });
    if (angular) {
      await expect(h).toHaveCount(0);
    } else {
      await expect(h).toBeVisible();
    }
  });
});

test.describe('notifications and profile routes', () => {
  test.beforeEach(async ({ page }) => {
    if (angular) {
      await angularUiLogin(page);
    }
  });

  test('notifications: page title and dismiss control', async ({ page }) => {
    await page.goto('/notifications', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await page.getByRole('heading', { name: /^My events$/i }).waitFor({ state: 'visible', timeout: 90_000 });
    } else {
      await page.waitForTimeout(2000);
    }
    const title = page.getByRole('heading', { name: /^My events$/i });
    const dismiss = page.locator('header.header').getByText(/^Dismiss all$/i);
    if (angular) {
      await expect(title.first()).toBeVisible();
      await expect(dismiss).toHaveCount(1);
    } else {
      await expect(title).toHaveCount(0);
      await expect(dismiss).toHaveCount(0);
    }
  });

  test('profile: Timeline tab on user profile', async ({ page }) => {
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });
    if (angular) {
      await page.getByText(/^Timeline$/).first().waitFor({ state: 'visible', timeout: 90_000 });
    } else {
      await page.waitForTimeout(2000);
    }
    const tab = page.getByText(/^Timeline$/).first();
    if (angular) {
      await expect(tab).toBeVisible();
    } else {
      await expect(page.getByText(/^Timeline$/)).toHaveCount(0);
    }
  });
});
