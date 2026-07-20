import { test, expect, type Page } from '@playwright/test';

const ADMIN = 'admin';
const PASS = 'adminpass';
const PROJECT_DEMO = '/project/project-1/';

async function loginAdminAngular(page: Page) {
  await page.goto('/login', { waitUntil: 'load' });
  await page.waitForTimeout(2000);
  await page.locator('input[name="username"]').fill(ADMIN);
  await page.locator('input[name="password"]').fill(PASS);
  await page.locator('button.btn-small[type="submit"], .submit-button').first().click();
  await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });
  await page.waitForTimeout(2000);
}

test.describe('migration audit — Angular is source of truth', () => {
  test('login: document title is Login - Taiga', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page).toHaveTitle(/Login - Taiga/);
  });

  test('login: main brand h1 is exactly Taiga', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page.locator('h1.logo')).toHaveText('Taiga');
  });

  test('login: h2 tagline includes LOVE YOUR PROJECT', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page.locator('h2.tagline')).toContainText('LOVE YOUR PROJECT');
  });

  test('login: username field placeholder (discrimination string)', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const ph = await page.locator('input[name="username"]').getAttribute('placeholder');
    expect(ph).toBe('Username or email (case sensitive)');
  });

  test('login: password field placeholder (discrimination string)', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const ph = await page.locator('input[name="password"]').getAttribute('placeholder');
    expect(ph).toBe('Password (case sensitive)');
  });

  test('login: forgot link text is Forgot it?', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page.locator('a.forgot-pass')).toHaveText('Forgot it?');
  });

  test('login: primary submit button says Login', async ({ page }, testInfo) => {
    await page.goto('/login', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page.locator('form.login-form button[type="submit"]')).toHaveText('Login');
  });

  test('discover: h1 page title is Discover projects', async ({ page }, testInfo) => {
    await page.goto('/discover', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page.locator('.discover-header h1.title')).toHaveText('Discover projects');
  });

  test('discover: search placeholder is Type something...', async ({ page }, testInfo) => {
    await page.goto('/discover', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    const ph = await page.locator('.searchbox input[name="search"]').getAttribute('placeholder');
    expect(ph).toBe('Type something...');
  });

  test('discover: featured section title is Featured Projects', async ({ page }, testInfo) => {
    await page.goto('/discover', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeVisible();
  });

  test('discover: most liked block title is Most liked', async ({ page }, testInfo) => {
    await page.goto('/discover', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { name: 'Most liked' })).toBeVisible();
  });

  test('discover: most active block title is Most active', async ({ page }, testInfo) => {
    await page.goto('/discover', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { name: 'Most active' })).toBeVisible();
  });

  test('home: main dashboard heading is Projects Dashboard (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    const dash = page.getByRole('heading', { name: 'Projects Dashboard', exact: true });
    await expect(dash.first()).toBeVisible();
  });

  test('home: working-on has duty items (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    const n = await page.locator('.working-on [tg-duty], .working-on div[tg-duty]').count();
    expect(n).toBeGreaterThan(0);
  });

  test('home: sidebar lists at least one home-project row (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto('/', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    const n = await page.locator('.home-project').count();
    expect(n).toBeGreaterThan(0);
  });

  test('project home: h1 project name is non-empty (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto(PROJECT_DEMO, { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const t = (await page.locator('h1.project-name').textContent())?.trim() ?? '';
    expect(t.length).toBeGreaterThan(0);
  });

  test('project home: section Team heading (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto(PROJECT_DEMO, { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    const team = page.locator('h2.title').filter({ hasText: /^Team$/ });
    await expect(team.first()).toBeVisible();
  });

  test('project home: user timeline block visible (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto(PROJECT_DEMO, { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    await expect(page.locator('div[tg-user-timeline]')).toBeVisible();
  });

  test('forgot-password: document title is Forgot password - Taiga', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page).toHaveTitle(/Forgot password - Taiga/);
  });

  test('forgot-password: intro line 1 is Oops, did you forget your password?', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page.getByText('Oops, did you forget your password?')).toBeVisible();
  });

  test('forgot-password: single-line input placeholder is Username or email', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const ph = await page.locator('form[ng-submit] input[name="username"], .forgot-form-container input[name="username"]').first().getAttribute('placeholder');
    expect(ph).toBe('Username or email');
  });

  test('forgot-password: primary button is Reset Password', async ({ page }) => {
    await page.goto('/forgot-password', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page.locator('.forgot-form-container button.btn-small')).toHaveText('Reset Password');
  });

  test('register: document title is Register - Taiga', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page).toHaveTitle(/Register - Taiga/);
  });

  test('register: username input placeholder is Pick a username', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    const ph = await page.locator('form.register-form input[name="username"]').getAttribute('placeholder');
    expect(ph).toBe('Pick a username');
  });

  test('register: sign-up button is Sign up', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
  });

  test('not-found: error heading is Not found', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-audit-xyz', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible();
  });

  test('not-found: Go home link text is Take me home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-audit-xyz', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page.getByRole('link', { name: 'Take me home' })).toBeVisible();
  });

  test('discover: document title is Discover projects - Taiga', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'load' });
    await page.waitForTimeout(3000);
    await expect(page).toHaveTitle(/Discover projects - Taiga/);
  });

  test('backlog: main section h1 is Backlog (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto('/project/project-1/backlog', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    await expect(page.getByRole('heading', { name: 'Backlog' }).first()).toBeVisible();
  });

  test('kanban: main section h1 is Kanban (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto('/project/project-1/kanban', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    await expect(page.getByRole('heading', { name: 'Kanban' }).first()).toBeVisible();
  });

  test('issues: main section h1 is Issues (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto('/project/project-1/issues', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    await expect(page.getByRole('heading', { name: 'Issues' }).first()).toBeVisible();
  });

  test('wiki: main section h1 is Wiki (requires auth in Angular)', async ({ page }, testInfo) => {
    if (testInfo.project.name === 'angular') {
      await loginAdminAngular(page);
    }
    await page.goto('/project/project-1/wiki/home', { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    await expect(page.getByRole('heading', { name: 'Wiki' }).first()).toBeVisible();
  });
});
