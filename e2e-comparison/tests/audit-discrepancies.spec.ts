import { expect, test } from '@playwright/test';
import { gotoAngularReady, loginAsAdmin } from './helpers';

const PS = 'project-1';
const PNAME = 'Project Example 1';
const SPRINT = 'sprint-2026-3-2';
const MILE = 'Sprint 2026-3-2';

/** Assert document title as set by the Angular `tgAppMetaService` (locale + route). */
async function expectAngularTitle(page: import('@playwright/test').Page, pattern: RegExp | string) {
  await expect(async () => {
    const t = await page.title();
    if (pattern instanceof RegExp) {
      expect(t).toMatch(pattern);
    } else {
      expect(t).toBe(pattern);
    }
  }).toPass({ timeout: 30_000, intervals: [150, 300, 500] });
}

test.describe.configure({ mode: 'parallel' });

function onlyAngular(testInfo: { project: { name: string } }) {
  test.skip(testInfo.project.name !== 'angular', 'Angular reference only');
}

function onlyReact(testInfo: { project: { name: string } }) {
  test.skip(testInfo.project.name !== 'react', 'React migration only');
}

/* --- Reference tests: encode Angular (gulp deploy) + Taiga API behavior only --- */
test.describe('unauthenticated (Angular reference)', () => {
  test.beforeEach(({}, testInfo) => onlyAngular(testInfo));

  test('index shell title before route meta: Taiga (not "Taiga (React port)")', async ({ page }) => {
    await page.goto('/login');
    await expect(page).toHaveTitle(/^Taiga$/);
  });

  test('login: tagline h2 is LOVE YOUR PROJECT (COMMON.TAG_LINE_2)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h2.tagline')).toContainText('LOVE YOUR PROJECT');
  });

  test('login: username/password placeholders require case sensitive (LOGIN_COMMON)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form.login-form input[name=username]')).toHaveAttribute(
      'placeholder',
      /case sensitive/i,
    );
    await expect(page.locator('form.login-form input[name=password]')).toHaveAttribute(
      'placeholder',
      /case sensitive/i,
    );
  });

  test('login: submit is "Login" (LOGIN_COMMON.ACTION_SIGN_IN)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('form.login-form button[type=submit]')).toContainText('Login');
  });

  test('login: forgot link is "Forgot it?" (LOGIN_COMMON.LINK_FORGOT_PASSWORD)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /^Forgot it\?$/ })).toBeVisible();
  });

  test('forgot password: Oops, did you forget… (FORGOT_PASSWORD_FORM.TITLE + SUBTITLE)', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('p.forgot-text').first()).toContainText('Oops, did you forget your password?');
  });

  test('register: submit CTA is "Sign up" (REGISTER_FORM.ACTION_SIGN_UP)', async ({ page }) => {
    await page.goto('/register');
    await expect(
      page.locator('form.register-form, .register-form').getByRole('button', { name: /^Sign up$/i }),
    ).toBeVisible();
  });

  test('unauthenticated /external-apps redirects to login (needs API token + query params in real use)', async ({
    page,
  }) => {
    await page.goto('/external-apps');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/login/);
  });

  test('not-found: heading ERROR.NOT_FOUND', async ({ page }) => {
    await page.goto('/definitely-missing-zz-abc');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.error-container h1')).toHaveText('Not found');
  });

  test('not-found: body includes Error 404 (ERROR.NOT_FOUND_TEXT)', async ({ page }) => {
    await page.goto('/definitely-missing-bb-xyz');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.error-container')).toContainText(/Error 404/);
  });

  test('permission-denied: heading & copy (ERROR.PERMISSION_DENIED / _TEXT)', async ({ page }) => {
    await page.goto('/permission-denied');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.error-container h1')).toHaveText('Permission denied');
    await expect(page.locator('.error-container')).toContainText(/don't have permission/);
  });
});

test.describe('auth page titles (Angular reference)', () => {
  test.beforeEach(({}, testInfo) => onlyAngular(testInfo));

  test('document title: Login - Taiga', async ({ page }) => {
    await gotoAngularReady(page, '/login');
    await expectAngularTitle(page, /^Login - Taiga$/);
  });

  test('document title: Forgot password - Taiga', async ({ page }) => {
    await gotoAngularReady(page, '/forgot-password');
    await expectAngularTitle(page, /^Forgot password - Taiga$/);
  });
});

test.describe('authenticated home & projects (Angular reference)', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    onlyAngular(testInfo);
    await loginAsAdmin(page, 'angular', request);
  });

  test('home: main heading Projects Dashboard (HOME.DASHBOARD)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(
      page.locator('div.duty-summary h1, .home-wrapper h1').filter({ hasText: 'Projects Dashboard' }),
    ).toBeVisible();
  });

  test('title: Home - Taiga', async ({ page }) => {
    await gotoAngularReady(page, '/');
    await expectAngularTitle(page, /^Home - Taiga$/);
  });

  test('my projects: create is "New project" (not "+ Create project")', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('link', { name: 'New project' })).toBeVisible();
  });

  test('my projects: aside help (PROJECT.HELP) mentions top navigation', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('aside.help-area p')).toContainText(/top navigation/);
  });

  test('title: My projects - Taiga', async ({ page }) => {
    await gotoAngularReady(page, '/projects/');
    await expectAngularTitle(page, /^My projects - Taiga$/);
  });

  test('discover: Featured Projects (DISCOVER.FEATURED) plus search/most-liked, not a simple list alone', async ({
    page,
  }) => {
    await page.goto('/discover');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeVisible();
  });

  test('title: Discover projects - Taiga', async ({ page }) => {
    await gotoAngularReady(page, '/discover');
    await expectAngularTitle(page, /^Discover projects - Taiga$/);
  });
});

test.describe('project :project-1 (Angular reference titles)', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    onlyAngular(testInfo);
    await loginAsAdmin(page, 'angular', request);
  });

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  test('title: timeline is project name (PROJECT.PAGE_TITLE)', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/timeline`);
    await expectAngularTitle(page, new RegExp(`^${esc(PNAME)}$`));
  });

  test('title: backlog / kanban / issues / team / search / epics (lists)', async ({ page }) => {
    const cases: Array<{ path: string; re: RegExp }> = [
      { path: 'backlog', re: new RegExp(`^Backlog - ${esc(PNAME)}$`) },
      { path: 'kanban', re: new RegExp(`^Kanban - ${esc(PNAME)}$`) },
      { path: 'issues', re: new RegExp(`^Issues - ${esc(PNAME)}$`) },
      { path: 'team', re: new RegExp(`^Team - ${esc(PNAME)}$`) },
      { path: 'search', re: new RegExp(`^Search - ${esc(PNAME)}$`) },
      { path: 'epics', re: new RegExp(`^Epics - ${esc(PNAME)}$`) },
    ];
    for (const c of cases) {
      await gotoAngularReady(page, `/project/${PS}/${c.path}`);
      await expectAngularTitle(page, c.re);
    }
  });

  test('title: user story 1 (US.PAGE_TITLE uses # before ref)', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/us/1`);
    await expectAngularTitle(page, /User Story #1/);
  });

  test('title: task 2 (TASK.PAGE_TITLE)', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/task/2`);
    await expectAngularTitle(page, /Task #2/);
  });

  test('title: issue 38 (ISSUE.PAGE_TITLE)', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/issue/38`);
    await expectAngularTitle(page, /Issue #38/);
  });

  test('title: epic 39 (EPIC.PAGE_TITLE)', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/epic/39`);
    await expectAngularTitle(page, /Epic #39/);
  });

  test('title: wiki home', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/wiki/home`);
    await expectAngularTitle(page, new RegExp(` - Wiki - ${esc(PNAME)}$`));
  });

  test('title: taskboard (TASKBOARD.PAGE_TITLE)', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/taskboard/${SPRINT}`);
    await expectAngularTitle(
      page,
      new RegExp(`^${esc(MILE)} - Sprint taskboard - ${esc(PNAME)}$`),
    );
  });

  test('title: admin project details (observed: single space; locale template has a known spacing quirk in index.html only)', async ({
    page,
  }) => {
    await gotoAngularReady(page, `/project/${PS}/admin/project-profile/details`);
    await expectAngularTitle(
      page,
      new RegExp(`^Project details - Project profile - ${esc(PNAME)}$`),
    );
  });
});

test.describe('admin sub-routes (Angular reference titles)', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    onlyAngular(testInfo);
    await loginAsAdmin(page, 'angular', request);
  });

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const p = esc(PNAME);

  test('project profile: default values, modules, export, reports', async ({ page }) => {
    const sub: Array<[string, string]> = [
      ['default-values', 'Default Values'],
      ['modules', 'Modules'],
      ['export', 'Export'],
      ['reports', 'Reports'],
    ];
    for (const [pathSeg, label] of sub) {
      await gotoAngularReady(page, `/project/${PS}/admin/project-profile/${pathSeg}`);
      await expectAngularTitle(
        page,
        new RegExp(`^${esc(label)} - Project profile - ${p}$`),
      );
    }
  });

  test('project values sub-pages: meta title begins with a lone dash (empty section in PAGE_TITLE) then Project values (observed 6.10)', async ({
    page,
  }) => {
    const segs = [
      'status',
      'points',
      'priorities',
      'severities',
      'types',
      'tags',
      'due-dates',
      'kanban-power-ups',
    ];
    for (const pathSeg of segs) {
      await gotoAngularReady(page, `/project/${PS}/admin/project-values/${pathSeg}`);
      await expectAngularTitle(page, new RegExp(`^- Project values - ${p}$`));
    }
  });

  test('admin: memberships & roles', async ({ page }) => {
    await gotoAngularReady(page, `/project/${PS}/admin/memberships`);
    await expectAngularTitle(page, new RegExp(`^Memberships - ${p}$`));
    await gotoAngularReady(page, `/project/${PS}/admin/roles`);
    await expectAngularTitle(page, new RegExp(`^Roles - ${p}$`));
  });

  test('admin third parties: webhooks, github, gitlab, bitbucket, gogs', async ({ page }) => {
    const sub: Array<[string, string]> = [
      ['webhooks', 'Webhooks'],
      ['github', 'GitHub'],
      ['gitlab', 'Gitlab'],
      ['bitbucket', 'Bitbucket'],
      ['gogs', 'Gogs'],
    ];
    for (const [api, t] of sub) {
      await gotoAngularReady(page, `/project/${PS}/admin/third-parties/${api}`);
      await expectAngularTitle(page, new RegExp(`^${esc(t)} - ${p}$`));
    }
  });
});

test.describe('discover search (Angular reference)', () => {
  test.beforeEach(({}, testInfo) => onlyAngular(testInfo));

  test('title: Search - Discover projects - Taiga', async ({ page, request }) => {
    await loginAsAdmin(page, 'angular', request);
    await gotoAngularReady(page, '/discover/search');
    await expectAngularTitle(page, /^Search - Discover projects - Taiga$/);
  });
});

test.describe('profile (Angular reference)', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    onlyAngular(testInfo);
    await loginAsAdmin(page, 'angular', request);
  });

  test('title: own profile (USER.PROFILE.PAGE_TITLE)', async ({ page }) => {
    await gotoAngularReady(page, '/profile');
    await expectAngularTitle(page, /^admin \(@admin\)$/);
  });
});

/* --- Migration: assert legacy Taiga (Angular) copy/structure; fails on React where gaps remain --- */
test.describe('migration: authenticated flows', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    onlyReact(testInfo);
    await loginAsAdmin(page, 'react', request);
  });

  test('m_auth_index_title: document title is not the static Vite dev suffix on every page', async ({ page }) => {
    await page.goto('/login');
    expect(await page.title()).not.toMatch(/react port/i);
  });

  test('m_auth_home_h1: home uses HOME.DASHBOARD not a generic "Dashboard"', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Projects Dashboard' })).toBeVisible();
  });

  test('m_auth_title_projects: /projects/ updates document title (not index.html only)', async ({ page }) => {
    await page.goto('/projects/');
    expect(await page.title()).not.toMatch(/Taiga \(React port\)/);
  });

  test('m_auth_projects_cta: create project is "New project" (not "+ Create project")', async ({ page }) => {
    await page.goto('/projects/');
    await expect(page.getByRole('link', { name: 'New project' })).toBeVisible();
  });

  test('m_auth_discover_featured: discover shows Featured Projects (not only a Discover list)', async ({ page }) => {
    await page.goto('/discover');
    await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeVisible();
  });

  test('m_auth_discover_title: discover title matches "Discover projects - Taiga"', async ({ page }) => {
    await page.goto('/discover');
    expect(await page.title()).toMatch(/^Discover projects - Taiga$/);
  });

  test('m_auth_timeline_title: project timeline title is the project name', async ({ page }) => {
    await page.goto(`/project/${PS}/timeline`);
    expect(await page.title()).toMatch(new RegExp(`^${PNAME}$`));
  });

  test('m_auth_backlog_title: backlog page title "Backlog - {project}"', async ({ page }) => {
    await page.goto(`/project/${PS}/backlog`);
    expect(await page.title()).toBe(`Backlog - ${PNAME}`);
  });

  test('m_auth_us1_title: user story 1 document title includes User Story #1', async ({ page }) => {
    await page.goto(`/project/${PS}/us/1`);
    expect(await page.title()).toMatch(/User Story #1/);
  });

  test('m_auth_wiki_title: wiki home page title includes " - Wiki - "', async ({ page }) => {
    await page.goto(`/project/${PS}/wiki/home`);
    expect(await page.title()).toMatch(new RegExp(` - Wiki - ${PNAME}$`));
  });

  test('m_auth_profile_title: /profile document title is "admin (@admin)" for admin', async ({ page }) => {
    await page.goto('/profile');
    expect(await page.title()).toBe('admin (@admin)');
  });

  test('m_auth_epics_title: epics list title', async ({ page }) => {
    await page.goto(`/project/${PS}/epics`);
    expect(await page.title()).toBe(`Epics - ${PNAME}`);
  });

  test('m_auth_kanban_title: kanban title', async ({ page }) => {
    await page.goto(`/project/${PS}/kanban`);
    expect(await page.title()).toBe(`Kanban - ${PNAME}`);
  });

  test('m_auth_issues_title: issues list title', async ({ page }) => {
    await page.goto(`/project/${PS}/issues`);
    expect(await page.title()).toBe(`Issues - ${PNAME}`);
  });

  test('m_auth_team_title: team page title', async ({ page }) => {
    await page.goto(`/project/${PS}/team`);
    expect(await page.title()).toBe(`Team - ${PNAME}`);
  });

  test('m_auth_taskboard_title: sprint taskboard title includes sprint name', async ({ page }) => {
    await page.goto(`/project/${PS}/taskboard/${SPRINT}`);
    expect(await page.title()).toBe(`${MILE} - Sprint taskboard - ${PNAME}`);
  });

  test('m_auth_us_ref_title: t/:ref route sets user story title in document', async ({ page }) => {
    await page.goto(`/project/${PS}/t/1`);
    expect(await page.title()).toMatch(/User Story #1/);
  });

  test('m_auth_notif_title: notifications list page has its own document title in legacy', async ({ page }) => {
    await page.goto('/notifications');
    expect(await page.title()).not.toMatch(/Taiga \(React port\)/);
  });

  test('m_auth_user_settings: user-settings shell matches legacy menu naming', async ({ page }) => {
    await page.goto('/user-settings/user-profile');
    expect(await page.title()).not.toMatch(/Taiga \(React port\)/);
  });
});

/* Extra migration surface area (string / structure) */
test.describe('migration: project shell and admin placeholders', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    onlyReact(testInfo);
    await loginAsAdmin(page, 'react', request);
  });

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  test('m_shell_sidebar_epics: when epics on, nav says Epics with exact casing', async ({ page }) => {
    await page.goto(`/project/${PS}/timeline`);
    await expect(page.getByTestId('project-sidebar').getByText('Epics', { exact: true })).toBeVisible();
  });

  test('m_shell_sidebar_wiki: when wiki on, link label is Wiki', async ({ page }) => {
    await page.goto(`/project/${PS}/timeline`);
    await expect(page.getByTestId('project-sidebar').getByText('Wiki', { exact: true })).toBeVisible();
  });

  test('m_admin_status_title: /admin project-values/status document title is not a placeholder', async ({ page }) => {
    await page.goto(`/project/${PS}/admin/project-values/status`);
    expect(await page.title()).not.toMatch(/Taiga \(React port\)/);
  });

  test('m_admin_webhooks_placeholder: webhooks is not a static third-party name in title', async ({ page }) => {
    await page.goto(`/project/${PS}/admin/third-parties/webhooks`);
    const t = await page.title();
    expect(t).toMatch(new RegExp(`^Webhooks - ${esc(PNAME)}$`));
  });

  test('m_admin_details_title: project profile details title is not a generic h2 only', async ({ page }) => {
    await page.goto(`/project/${PS}/admin/project-profile/details`);
    expect(await page.title()).toMatch(
      new RegExp(`^Project details - Project profile - ${esc(PNAME)}$`),
    );
  });

  test('m_search_page_title: project search sets Search - {project} in head', async ({ page }) => {
    await page.goto(`/project/${PS}/search`);
    expect(await page.title()).toBe(`Search - ${PNAME}`);
  });

  test('m_issue_38_title: issue detail head includes Issue #38', async ({ page }) => {
    await page.goto(`/project/${PS}/issue/38`);
    expect(await page.title()).toMatch(/Issue #38/);
  });

  test('m_epic_39_title: epic detail head includes Epic #39', async ({ page }) => {
    await page.goto(`/project/${PS}/epic/39`);
    expect(await page.title()).toMatch(/Epic #39/);
  });

  test('m_task2_title: task head includes Task #2', async ({ page }) => {
    await page.goto(`/project/${PS}/task/2`);
    expect(await page.title()).toMatch(/Task #2/);
  });

  test('m_discover_search_title: /discover/search has discover search head title', async ({ page }) => {
    await page.goto('/discover/search');
    expect(await page.title()).toMatch(/Discover/);
  });
});

/** Dense title-route checks (legacy sets document.title on almost every view). */
test.describe('migration: document.title vs locale PAGE_TITLE (logged-in)', () => {
  test.beforeEach(async ({ page, request }, testInfo) => {
    onlyReact(testInfo);
    await loginAsAdmin(page, 'react', request);
  });

  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  test('m_title_home', async ({ page }) => {
    await page.goto('/');
    expect(await page.title()).toBe('Home - Taiga');
  });
  test('m_title_my_projects', async ({ page }) => {
    await page.goto('/projects/');
    expect(await page.title()).toBe('My projects - Taiga');
  });
  test('m_title_discover', async ({ page }) => {
    await page.goto('/discover');
    expect(await page.title()).toBe('Discover projects - Taiga');
  });
  test('m_title_discover_search', async ({ page }) => {
    await page.goto('/discover/search');
    expect(await page.title()).toBe('Search - Discover projects - Taiga');
  });
  test('m_title_timeline', async ({ page }) => {
    await page.goto(`/project/${PS}/timeline`);
    expect(await page.title()).toBe(PNAME);
  });
  test('m_title_backlog', async ({ page }) => {
    await page.goto(`/project/${PS}/backlog`);
    expect(await page.title()).toBe(`Backlog - ${PNAME}`);
  });
  test('m_title_kanban', async ({ page }) => {
    await page.goto(`/project/${PS}/kanban`);
    expect(await page.title()).toBe(`Kanban - ${PNAME}`);
  });
  test('m_title_issues', async ({ page }) => {
    await page.goto(`/project/${PS}/issues`);
    expect(await page.title()).toBe(`Issues - ${PNAME}`);
  });
  test('m_title_team', async ({ page }) => {
    await page.goto(`/project/${PS}/team`);
    expect(await page.title()).toBe(`Team - ${PNAME}`);
  });
  test('m_title_epics', async ({ page }) => {
    await page.goto(`/project/${PS}/epics`);
    expect(await page.title()).toBe(`Epics - ${PNAME}`);
  });
  test('m_title_search', async ({ page }) => {
    await page.goto(`/project/${PS}/search`);
    expect(await page.title()).toBe(`Search - ${PNAME}`);
  });
  test('m_title_wiki', async ({ page }) => {
    await page.goto(`/project/${PS}/wiki/home`);
    expect(await page.title()).toMatch(new RegExp(`^home - Wiki - ${esc(PNAME)}$`));
  });
  test('m_title_taskboard', async ({ page }) => {
    await page.goto(`/project/${PS}/taskboard/${SPRINT}`);
    expect(await page.title()).toBe(`${MILE} - Sprint taskboard - ${PNAME}`);
  });
  test('m_title_memberships', async ({ page }) => {
    await page.goto(`/project/${PS}/admin/memberships`);
    expect(await page.title()).toBe(`Memberships - ${PNAME}`);
  });
  test('m_title_roles', async ({ page }) => {
    await page.goto(`/project/${PS}/admin/roles`);
    expect(await page.title()).toBe(`Roles - ${PNAME}`);
  });
  test('m_title_github', async ({ page }) => {
    await page.goto(`/project/${PS}/admin/third-parties/github`);
    expect(await page.title()).toBe(`GitHub - ${PNAME}`);
  });
  test('m_title_profile', async ({ page }) => {
    await page.goto('/profile');
    expect(await page.title()).toBe('admin (@admin)');
  });
});

test.describe('migration: document.title public routes (no session)', () => {
  test.beforeEach(({}, testInfo) => onlyReact(testInfo));

  test('m_title_login', async ({ page }) => {
    await page.goto('/login');
    expect(await page.title()).toBe('Login - Taiga');
  });
  test('m_title_forgot', async ({ page }) => {
    await page.goto('/forgot-password');
    expect(await page.title()).toBe('Forgot password - Taiga');
  });
  test('m_title_register', async ({ page }) => {
    await page.goto('/register');
    expect(await page.title()).toBe('Register - Taiga');
  });
});

test.describe('migration: unauthenticated / chrome', () => {
  test.beforeEach(({}, testInfo) => onlyReact(testInfo));

  test('m_unauth_login_tagline: h2 tagline is LOVE YOUR PROJECT (COMMON.TAG_LINE_2)', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByText('LOVE YOUR PROJECT')).toBeVisible();
  });

  test('m_unauth_login_placeholder: username placeholder includes case sensitive', async ({ page }) => {
    await page.goto('/login');
    const ph = await page.locator('#username').getAttribute('placeholder');
    expect(ph ?? '').toMatch(/case sensitive/i);
  });

  test('m_unauth_login_submit: submit reads Login (not Sign in)', async ({ page }) => {
    await page.goto('/login');
    await page.locator('#username').fill('a');
    await page.locator('#password').fill('b');
    await expect(page.getByTestId('login-submit')).toContainText('Login');
  });

  test('m_unauth_login_forgot: link text is "Forgot it?"', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('link', { name: /^Forgot it\?$/ })).toBeVisible();
  });

  test('m_unauth_forgot_title: h1 is not "Recover" (FORGOT_PASSWORD_FORM has Taiga h1 in legacy)', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByRole('heading', { level: 1, name: 'Taiga' })).toBeVisible();
  });

  test('m_unauth_forgot_copy: Oops, did you forget (FORGOT_PASSWORD_FORM.TITLE)', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByText('Oops, did you forget your password?')).toBeVisible();
  });

  test('m_unauth_404_h1: not-found heading is "Not found" (not "404 — Not found")', async ({ page }) => {
    await page.goto('/m-audit-404-xyz-abc');
    await expect(
      page.getByTestId('not-found').getByRole('heading', { name: 'Not found', exact: true }),
    ).toBeVisible();
  });

  test('m_unauth_404_body: not-found copy mentions Taiga 404 (ERROR.NOT_FOUND_TEXT)', async ({ page }) => {
    await page.goto('/m-audit-404-xyz-def');
    await expect(page.getByTestId('not-found')).toContainText(/Error 404/);
  });

  test('m_unauth_403: permission-denied heading is plain "Permission denied"', async ({ page }) => {
    await page.goto('/permission-denied');
    await expect(
      page.getByTestId('permission-denied').getByRole('heading', { name: 'Permission denied', exact: true }),
    ).toBeVisible();
  });

  test('m_unauth_register_signup: register submit is "Sign up" not only heading', async ({ page }) => {
    await page.goto('/register');
    await expect(page.getByTestId('register-form').getByRole('button', { name: /sign up/i })).toBeVisible();
  });
});
