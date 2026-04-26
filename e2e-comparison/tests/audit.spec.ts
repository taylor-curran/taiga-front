import { expect, test } from '@playwright/test';

type AppKind = 'angular' | 'react';

const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9000';
/** First sprint slug from seeded `sample_data` (used for taskboard URL). */
const SAMPLE_TASKBOARD_SLUG = process.env.AUDIT_TASKBOARD_SLUG ?? 'sprint-2026-3-2';

async function loginViaApi(
  page: import('@playwright/test').Page,
  request: import('@playwright/test').APIRequestContext,
  app: AppKind,
) {
  const response = await request.post(`${API_BASE}/api/v1/auth`, {
    data: { type: 'normal', username: 'admin', password: 'adminpass' },
    headers: { 'Content-Type': 'application/json' },
  });
  expect(response.ok()).toBeTruthy();
  const user = await response.json();

  if (app === 'react') {
    await page.goto('/login');
    await page.evaluate(
      ([u, t, r]) => {
        localStorage.setItem('taiga.userInfo', JSON.stringify(u));
        localStorage.setItem('taiga.token', JSON.stringify(t));
        localStorage.setItem('taiga.refresh', JSON.stringify(r));
      },
      [user, user.auth_token, user.refresh],
    );
  } else {
    await page.goto('/');
    await page.evaluate(
      ([u, t, r]) => {
        localStorage.setItem('userInfo', JSON.stringify(u));
        localStorage.setItem('token', JSON.stringify(t));
        localStorage.setItem('refresh', JSON.stringify(r));
      },
      [user, user.auth_token, user.refresh],
    );
  }
}

async function gotoProjectPage(page: import('@playwright/test').Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState('networkidle');
  // Angular (especially inside dockerized reference builds) can paint slightly after `networkidle`.
  await page.waitForTimeout(2000);
}

test.describe('migration audit: exhaustive angular behavior assertions', () => {
  test('backlog page exposes the filter sidebar control', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/backlog');
    await page.screenshot({ path: `artifacts/${app}-backlog.png`, fullPage: true });
    await expect(page.locator('#show-filters-button')).toHaveCount(1);
  });

  test('kanban board exposes the filter control', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/kanban');
    await page.screenshot({ path: `artifacts/${app}-kanban.png`, fullPage: true });
    // Reference builds may omit `e2e-*` classes; rely on the Kanban screen structure + filter button.
    const filterOpen = page.locator('section.main.kanban .kanban-header button.btn-filter').first();
    await expect(filterOpen).toBeVisible();
  });

  test('issues list exposes the filter control', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/issues');
    await page.screenshot({ path: `artifacts/${app}-issues.png`, fullPage: true });
    const filterOpen = page.locator('section.main.issue-main .issue-header button.btn-filter').first();
    await expect(filterOpen).toBeVisible();
  });

  test('taskboard exposes the filter control', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, `/project/project-1/taskboard/${SAMPLE_TASKBOARD_SLUG}`);
    await page.screenshot({ path: `artifacts/${app}-taskboard.png`, fullPage: true });
    const filterOpen = page.locator('section.main.taskboard .taskboard-actions button.btn-filter').first();
    await expect(filterOpen).toBeVisible();
  });

  test('new scrum project form includes the real project title field', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/new/scrum');
    await page.screenshot({ path: `artifacts/${app}-create-scrum.png`, fullPage: true });
    await expect(page.locator('input[name="project-name"]')).toHaveCount(1);
  });

  test('duplicate project flow includes project selector and submit', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/new/duplicate');
    await page.screenshot({ path: `artifacts/${app}-duplicate-project.png`, fullPage: true });
    await expect(page.locator('form.duplicate-project')).toHaveCount(1);
    await expect(page.locator('select#project-selector-dropdown')).toHaveCount(1);
  });

  test('import project picker lists importers', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/new/import');
    await page.screenshot({ path: `artifacts/${app}-import-project.png`, fullPage: true });
    await expect(page.locator('ul.import-project-from')).toHaveCount(1);
  });

  test('admin webhooks page offers a way to add a webhook', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/admin/third-parties/webhooks');
    await page.screenshot({ path: `artifacts/${app}-webhooks-page.png`, fullPage: true });
    const addButton = page.locator('button.add-webhook');
    await expect(addButton).toHaveCount(1);
    await expect(addButton).toContainText(/add .* webhook/i);
  });

  test('admin github integration page includes editable secret key form', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/admin/third-parties/github');
    await page.screenshot({ path: `artifacts/${app}-github-admin-page.png`, fullPage: true });
    const secretInput = page.locator('input#secret-key');
    await expect(secretInput).toHaveCount(1);
    await expect(secretInput).toBeEditable();
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  });

  test('admin gitlab integration page includes editable secret key form', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/admin/third-parties/gitlab');
    await page.screenshot({ path: `artifacts/${app}-gitlab-admin-page.png`, fullPage: true });
    const secretInput = page.locator('input#secret-key');
    await expect(secretInput).toHaveCount(1);
    await expect(secretInput).toBeEditable();
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  });

  test('admin bitbucket integration page includes editable secret key form', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/admin/third-parties/bitbucket');
    await page.screenshot({ path: `artifacts/${app}-bitbucket-admin-page.png`, fullPage: true });
    const secretInput = page.locator('input#secret-key');
    await expect(secretInput).toHaveCount(1);
    await expect(secretInput).toBeEditable();
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  });

  test('admin gogs integration page includes editable secret key form', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/admin/third-parties/gogs');
    await page.screenshot({ path: `artifacts/${app}-gogs-admin-page.png`, fullPage: true });
    const secretInput = page.locator('input#secret-key');
    await expect(secretInput).toHaveCount(1);
    await expect(secretInput).toBeEditable();
    await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  });

  test('user story detail shows relate-to-epic action when epics are enabled', async ({ page, request }, testInfo) => {
    const app = testInfo.project.name as AppKind;
    await loginViaApi(page, request, app);
    await gotoProjectPage(page, '/project/project-1/us/1');
    await page.screenshot({ path: `artifacts/${app}-us-detail.png`, fullPage: true });
    await expect(page.locator('a.relate-to-epic-button')).toHaveCount(1);
  });
});
