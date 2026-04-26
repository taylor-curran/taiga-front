import { expect, test, type Page, type TestInfo } from '@playwright/test';
import {
  fetchAuthTokens,
  installApiProxyToTaiga,
  primeAngularUserInfo,
  type AuthTokens,
} from '../helpers/auth.js';

const TAIGA_ORIGIN = process.env.TAIGA_ORIGIN ?? 'http://127.0.0.1:9000';
const REACT_ORIGIN = process.env.REACT_BASE_URL ?? 'http://127.0.0.1:5173';

function isAngular(projectName: string | undefined) {
  return projectName === 'angular';
}

async function setupReactApiOnly(page: Page) {
  await installApiProxyToTaiga(page, REACT_ORIGIN, TAIGA_ORIGIN);
}

async function setupReactApiAndAuth(page: Page, tokens: AuthTokens) {
  await setupReactApiOnly(page);
  await page.addInitScript((t) => {
    window.localStorage.setItem('token', t);
  }, tokens.auth_token);
}

function needsPrimedSession(testInfo: TestInfo): boolean {
  const t = testInfo.title;
  if (testInfo.project.name === 'angular') {
    return t !== 'unauthenticated_projects_redirects_to_login';
  }
  if (t.startsWith('login_') || t === 'unauthenticated_projects_redirects_to_login') {
    return false;
  }
  return true;
}

/** Angular `LoginPage` redirects authenticated users away unless `force_login` is set. */
function loginPath() {
  return '/login?force_login=1';
}

test.beforeAll(async ({ browser }) => {
  const ctx = await browser.newContext({ baseURL: TAIGA_ORIGIN });
  const tokens = await fetchAuthTokens(ctx.request);
  await ctx.close();
  (globalThis as unknown as { __auditTokens?: AuthTokens }).__auditTokens = tokens;
});

test.beforeEach(async ({ page }, testInfo) => {
  const tokens = (globalThis as unknown as { __auditTokens?: AuthTokens }).__auditTokens;
  if (!tokens) {
    throw new Error('Missing __auditTokens from beforeAll');
  }
  if (!needsPrimedSession(testInfo)) {
    if (testInfo.project.name === 'angular') {
      return;
    }
    await setupReactApiOnly(page);
    return;
  }
  if (testInfo.project.name === 'angular') {
    await primeAngularUserInfo(page, tokens);
  } else {
    await setupReactApiAndAuth(page, tokens);
  }
});

test('login_page_no_global_navigation_bar', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('.navigation-bar, tg-navigation-bar').first()).toBeHidden();
});

test('login_page_username_password_fields', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('input[name="username"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
});

test('login_username_placeholder', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('input[name="username"]')).toHaveAttribute('placeholder', 'Username or email (case sensitive)');
});

test('login_password_placeholder', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('input[name="password"]')).toHaveAttribute('placeholder', 'Password (case sensitive)');
});

test('login_forgot_password_link', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('.forgot-pass').first()).toContainText('Forgot it?');
});

test('login_submit_button_login', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('form.login-form button[type="submit"]')).toContainText('Login');
});

test('login_document_title', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page).toHaveTitle(/Login - Taiga/);
});

test('login_tagline_love_your_project', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('h2.tagline')).toContainText('LOVE YOUR PROJECT');
});

test('login_brand_heading_taiga', async ({ page }) => {
  await page.goto(loginPath());
  await page.waitForTimeout(2500);
  await expect(page.locator('h1.logo')).toContainText('Taiga');
});

test('discover_home_section', async ({ page, browser }, testInfo) => {
  if (isAngular(testInfo.project.name)) {
    await page.goto('/discover');
    await page.waitForTimeout(2500);
    await expect(page.locator('section.discover')).toBeVisible();
    return;
  }
  const ctx = await browser.newContext({ baseURL: REACT_ORIGIN });
  const p = await ctx.newPage();
  await installApiProxyToTaiga(p, REACT_ORIGIN, TAIGA_ORIGIN);
  await p.goto('/discover');
  await p.waitForTimeout(2500);
  await expect(p.locator('section.discover')).toBeVisible();
  await ctx.close();
});

test('backlog_scrum_heading', async ({ page }) => {
  await page.goto('/project/project-1/backlog');
  await page.waitForTimeout(3500);
  await expect(page.getByRole('heading', { name: 'Backlog', exact: true })).toBeVisible();
});

test('kanban_board_shell', async ({ page }) => {
  await page.goto('/project/project-1/kanban');
  await page.waitForTimeout(3500);
  await expect(page.locator('.kanban')).toBeVisible();
});

test('issues_list_shell', async ({ page }) => {
  await page.goto('/project/project-1/issues');
  await page.waitForTimeout(3500);
  await expect(page.locator('.issues')).toBeVisible();
});

test('wiki_list_main', async ({ page }) => {
  await page.goto('/project/project-1/wiki-list');
  await page.waitForTimeout(3500);
  await expect(page.locator('section.main.wiki-main')).toBeVisible();
});

test('team_page_shell', async ({ page }) => {
  await page.goto('/project/project-1/team');
  await page.waitForTimeout(3500);
  await expect(page.locator('.team')).toBeVisible();
});

test('project_timeline_intro', async ({ page }) => {
  await page.goto('/project/project-1/timeline');
  await page.waitForTimeout(3500);
  await expect(page.locator('section.single-project-intro')).toBeVisible();
});

test('home_working_on_section_heading_level', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3500);
  await expect(page.locator('h1.working-on-title')).toBeVisible();
});

test('home_watching_section_heading_level', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3500);
  await expect(page.locator('h1.watching-title')).toBeVisible();
});

test('home_hidden_items_toggle', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3500);
  const toggle = page.locator('.toggle-hidden a').first();
  await expect(toggle.or(page.locator('.toggle-hidden span').first())).toBeVisible();
});

test('projects_new_project_button_enabled', async ({ page }) => {
  await page.goto('/projects/');
  await page.waitForTimeout(3500);
  await expect(page.locator('.project-list-title a.create-project-btn').first()).toBeEnabled();
});

test('projects_help_sidebar_line_break', async ({ page }) => {
  await page.goto('/projects/');
  await page.waitForTimeout(3500);
  await expect(page.locator('aside.help-area p')).toContainText('top navigation bar');
});

test('dashboard_duty_href_entity_route', async ({ page }) => {
  await page.goto('/');
  await page.waitForTimeout(3500);
  const first = page.locator('a.list-itemtype-ticket, a.tg-ticket').first();
  if ((await first.count()) === 0) {
    test.skip();
    return;
  }
  const href = await first.getAttribute('href');
  expect(href ?? '').not.toMatch(/\/t\/\d+$/);
  expect(href ?? '').toMatch(/project\/[^/]+\/(us|task|issue|epic)\/\d+/);
});

test('admin_memberships_title_manage_members', async ({ page }) => {
  await page.goto('/project/project-1/admin/memberships');
  await page.waitForTimeout(3500);
  await expect(page.getByRole('heading', { name: 'Manage members' })).toBeVisible();
});

test('admin_memberships_new_member_button', async ({ page }) => {
  await page.goto('/project/project-1/admin/memberships');
  await page.waitForTimeout(3500);
  await expect(page.getByRole('button', { name: '+ New member' })).toBeVisible();
});

test('admin_roles_delete_button', async ({ page }) => {
  await page.goto('/project/project-1/admin/roles');
  await page.waitForTimeout(4000);
  await expect(
    page.locator('.header-with-actions button[variant="destructive"], .action-buttons button').filter({ hasText: 'Delete' }).first(),
  ).toBeVisible();
});

test('admin_roles_computable_checkbox', async ({ page }) => {
  await page.goto('/project/project-1/admin/roles');
  await page.waitForTimeout(4000);
  await expect(page.locator('.general-category input[type="checkbox"]').first()).toBeVisible();
});

test('profile_full_layout', async ({ page }) => {
  await page.goto('/profile');
  await page.waitForTimeout(3500);
  await expect(page.locator('.profile')).toBeVisible();
});

test('notifications_list_layout', async ({ page }) => {
  await page.goto('/notifications');
  await page.waitForTimeout(3500);
  await expect(page.locator('.notifications-page')).toBeVisible();
});

test('mail_notifications_policy_table', async ({ page }) => {
  await page.goto('/user-settings/mail-notifications');
  await page.waitForTimeout(3500);
  await expect(page.locator('section.policy-table')).toBeVisible();
});

test('shell_no_admin_port_brand_label', async ({ page }) => {
  await page.goto('/projects');
  await page.waitForTimeout(3500);
  await expect(page.getByText('Admin (React port)')).toHaveCount(0);
});

test('unauthenticated_projects_redirects_to_login', async ({ browser }, testInfo) => {
  const baseURL = isAngular(testInfo.project.name) ? TAIGA_ORIGIN : REACT_ORIGIN;
  const ctx = await browser.newContext({ baseURL });
  const p = await ctx.newPage();
  if (!isAngular(testInfo.project.name)) {
    await installApiProxyToTaiga(p, REACT_ORIGIN, TAIGA_ORIGIN);
  }
  await ctx.clearCookies();
  await p.goto(`${baseURL}/`);
  await p.evaluate(() => window.localStorage.clear());
  await p.goto(`${baseURL}/projects/`);
  await p.waitForTimeout(3500);
  await expect(p).toHaveURL(/\/login/);
  await ctx.close();
});

test('admin_project_details_not_placeholder', async ({ page }) => {
  await page.goto('/project/project-1/admin/project-profile/details');
  await page.waitForTimeout(3500);
  await expect(page.getByTestId('port-pending-banner')).toHaveCount(0);
  await expect(page.locator('section.main.project-details')).toBeVisible();
});
