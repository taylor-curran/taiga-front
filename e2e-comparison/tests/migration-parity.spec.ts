import { expect, test } from '@playwright/test';
import { seedAngularAuthFromApi } from './angular-session';

/** Seeded Taiga API project slug (see `npm run taiga-sample-data`); Angular loads project from API. */
const ANGULAR_PSLUG = 'project-1';
/** React scaffold demo slug (`DEMO_PROJECT_SLUG` in `adminRoutePaths.ts`). */
const REACT_PSLUG = 'scrum';

function expectReactGap(testInfo: { project: { name: string } }) {
  test.fail(testInfo.project.name === 'react', 'Tracked migration gap — see migration-audit-results.csv');
}

async function gotoAngularReady(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
}

test.describe.configure({ mode: 'parallel' });

test.describe('Auth & shell', () => {
  test('login — document title matches reference app', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/login');
    await expect(page).toHaveTitle(/Login - Taiga/);
  });

  test('login — tagline LOVE YOUR PROJECT', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/login');
    await expect(page.getByRole('heading', { name: 'LOVE YOUR PROJECT', exact: true })).toBeVisible();
  });

  test('login — username placeholder', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/login');
    await expect(
      page.locator('input[name="username"], input#username').first(),
    ).toHaveAttribute('placeholder', 'Username or email (case sensitive)');
  });

  test('login — password placeholder', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/login');
    await expect(
      page.locator('input[type="password"][name="password"], input#password').first(),
    ).toHaveAttribute('placeholder', 'Password (case sensitive)');
  });

  test('login — primary button reads Login', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/login');
    await expect(page.locator('form.login-form button[type="submit"]').first()).toContainText('Login');
  });

  test('login — forgot password link text', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/login');
    await expect(page.locator('a.forgot-pass').first()).toContainText('Forgot it?');
  });

  test('login — no global marketing header on auth (Angular)', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/login');
    await expect(page.locator('[data-testid="app-header"]')).toHaveCount(0);
  });

  test('forgot-password — intro copy', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/forgot-password');
    await expect(page.getByText('Oops, did you forget your password?', { exact: true })).toBeVisible();
    await expect(
      page.getByText('Enter your username or email to get a new one', { exact: true }),
    ).toBeVisible();
  });

  test('forgot-password — field placeholder', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/forgot-password');
    await expect(page.locator('input[name="username"]').first()).toHaveAttribute(
      'placeholder',
      'Username or email',
    );
  });

  test('forgot-password — submit button', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/forgot-password');
    await expect(page.getByRole('button', { name: 'Reset Password', exact: true })).toBeVisible();
  });

  test('forgot-password — back link', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/forgot-password');
    await expect(page.getByText('Nah, take me back. I think I remember it.', { exact: true })).toBeVisible();
  });

  test('register — link back to login (copy from REGISTER_FORM)', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/register');
    await expect(
      page.getByRole('link', { name: 'Are you already registered? Log in', exact: true }),
    ).toBeVisible();
  });

  test('register — username placeholder', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/register');
    await expect(page.locator('input[name="username"]').first()).toHaveAttribute('placeholder', 'Pick a username');
  });

  test('register — sign up button', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/register');
    await expect(page.getByRole('button', { name: 'Sign up', exact: true })).toBeVisible();
  });
});

test.describe('Home & discover (Angular product surface)', () => {
  test('home — Projects Dashboard heading', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, '/');
    await expect(page.getByRole('heading', { name: 'Projects Dashboard', exact: true })).toBeVisible();
  });

  test('discover — route renders discover shell', async ({ page }, testInfo) => {
    expectReactGap(testInfo);
    await gotoAngularReady(page, '/discover');
    await expect(page.locator('.discover')).toHaveCount(1);
  });
});

test.describe('Project admin navigation & copy', () => {
  test('admin — tertiary nav includes Presets for default values', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/project-profile/default-values`);
    await expect(page.locator('#adminmenu-default-values .title').first()).toHaveText('Presets');
  });

  test('admin — tertiary nav uses Export not combined label', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/project-profile/export`);
    await expect(page.locator('#adminmenu-export .title').first()).toHaveText('Export');
  });

  test('admin — tertiary nav Reports label', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/project-profile/reports`);
    await expect(page.locator('#adminmenu-reports .title').first()).toHaveText('Reports');
  });

  test('admin — Kanban options vs power-ups wording', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/project-values/kanban-power-ups`);
    await expect(page.locator('#adminmenu-values-kanban-power-ups .title').first()).toHaveText('Kanban options');
  });

  test('admin — secondary nav Members', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/memberships`);
    await expect(page.locator('#adminmenu-memberships .title').first()).toHaveText('Members');
  });

  test('admin — GitHub integration section title casing', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/third-parties/github`);
    await expect(page.locator('section.main.admin-common header h1').first()).toContainText('GitHub');
  });

  test('admin — GitLab section uses Gitlab spelling', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/third-parties/gitlab`);
    await expect(page.locator('section.main.admin-common header h1').first()).toContainText('Gitlab');
  });

  test('admin — Webhooks section title', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/third-parties/webhooks`);
    await expect(page.locator('section.main.admin-common header h1').first()).toContainText('Webhooks');
  });

  test('admin — placeholder card is absent on Angular', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, `/project/${ANGULAR_PSLUG}/admin/project-profile/details`);
    await expect(page.locator('[data-testid="port-pending-banner"]')).toHaveCount(0);
  });
});

test.describe('User settings', () => {
  test('mail notifications — section heading', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, '/user-settings/mail-notifications');
    await expect(page.locator('section.main.admin-common h1').first()).toHaveText('Email Notifications');
  });

  test('live notifications — menu label Desktop notifications', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, '/user-settings/live-notifications');
    await expect(page.locator('#usersettingsmenu-live-notifications .title').first()).toHaveText(
      'Desktop notifications',
    );
  });

  test('web notifications — menu Events entry', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, '/user-settings/web-notifications');
    await expect(page.locator('#usersettingsmenu-web-notifications .title').first()).toHaveText('Events');
  });
});

test.describe('Profile & notifications', () => {
  test('notifications — page title', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, '/notifications');
    await expect(page.locator('.notifications-page h1.title').first()).toHaveText('My events');
  });

  test('profile — timeline tab label', async ({ page, request }, testInfo) => {
    expectReactGap(testInfo);
    test.skip(
      testInfo.project.name === 'angular' && !(await seedAngularAuthFromApi(page, request)),
      'Taiga API unreachable',
    );
    await gotoAngularReady(page, '/profile');
    await expect(page.locator('nav.profile-content-tabs a.tab span').first()).toHaveText('Timeline');
  });
});

test.describe('React structural / guard (documented divergence)', () => {
  test('unauthenticated guard target path', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'react', 'React-only assertion');
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).not.toHaveURL(/\/auth\/login/);
  });

  test('document title on React is Taiga (React port)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'react', 'React-only assertion');
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle('Taiga (React port)');
  });

  test('React login shows app header', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'react', 'React-only assertion');
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[data-testid="app-header"]')).toBeVisible();
  });

  test('React header shows Admin (React port) tag', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'react', 'React-only assertion');
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Admin (React port)', { exact: true })).toBeVisible();
  });

  test('root redirects to project admin details', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'react', 'React-only assertion');
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(new RegExp(`/project/${REACT_PSLUG}/admin/project-profile/details`));
  });
});
