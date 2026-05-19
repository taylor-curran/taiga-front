import { test, expect } from '@playwright/test';
import * as common from '../utils/common';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await common.waitLoader(page);
  });

  test('working-on section filled', async ({ page }) => {
    const count = await page.locator('.working-on div[tg-duty]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('watching section filled', async ({ page }) => {
    const count = await page.locator('.watching div[tg-duty]').count();
    expect(count).toBeGreaterThan(0);
  });

  test('project list filled', async ({ page }) => {
    const count = await page.locator('.home-project').count();
    expect(count).toBeGreaterThan(0);
  });

  test('projects list page', async ({ page }) => {
    await page.locator('.home-main a[tg-nav="projects"]').click();
    await common.waitLoader(page);
    expect(page.url()).toContain('/projects/');
  });

  test('project drag and drop', async ({ page }) => {
    const projects = page.locator('.home-project');
    const count = await projects.count();
    if (count < 4) return;

    const namesBefore = await page.locator('.home-project .project-name').allTextContents();
    const dragEl = projects.nth(3);
    const target = projects.nth(0);
    await common.drag(page, dragEl, target);
    await page.waitForTimeout(1000);
    const namesAfter = await page.locator('.home-project .project-name').allTextContents();
    expect(namesAfter[0]).not.toBe(namesBefore[0]);
  });
});
