import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as createProjectHelper from '../helpers/create-project-helper';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('create-duplicate-delete project', () => {
  test('duplicate project', async ({ page }) => {
    await page.goto('/project/new');
    await common.waitLoader(page);
    const screen = createProjectHelper.newProjectScreen(page);
    await screen.selectDuplicateOption();
    await screen.selectProjectToDuplicate();
    const projectName = 'duplicated-project-' + Date.now();
    await screen.fillNameAndDescription(projectName, 'Lorem Ipsum');
    await screen.createProject();
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toContain('admin-' + projectName);
  });

  test('create scrum project', async ({ page }) => {
    await page.goto('/project/new');
    await common.waitLoader(page);
    const screen = createProjectHelper.newProjectScreen(page);
    await screen.selectScrumOption();
    const projectName = 'scrum-project-' + Date.now();
    await screen.fillNameAndDescription(projectName, 'Lorem Ipsum');
    await screen.createProject();
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toContain('admin-' + projectName);
  });

  test('create kanban project', async ({ page }) => {
    await page.goto('/project/new');
    await common.waitLoader(page);
    const screen = createProjectHelper.newProjectScreen(page);
    await screen.selectKanbanOption();
    const projectName = 'kanban-project-' + Date.now();
    await screen.fillNameAndDescription(projectName, 'Lorem Ipsum');
    await screen.createProject();
    await page.waitForTimeout(3000);
    const url = page.url();
    expect(url).toContain('admin-' + projectName);
  });

  test('delete', async ({ page }) => {
    await page.goto('/project/new');
    await common.waitLoader(page);
    const screen = createProjectHelper.newProjectScreen(page);
    await screen.selectKanbanOption();
    const projectName = 'delete-test-' + Date.now();
    await screen.fillNameAndDescription(projectName, 'Lorem Ipsum');
    await screen.createProject();
    await page.waitForTimeout(3000);

    await common.link(page, page.locator('#nav-admin a'));
    await page.waitForFunction(() => !!document.querySelector('.project-details'), null, { timeout: 5000 });
    await createProjectHelper.deleteProject(page);
    await page.waitForTimeout(2000);
  });
});
