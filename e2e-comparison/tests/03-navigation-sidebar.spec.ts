import { test, expect } from '@playwright/test';
import { login, PROJECT_SLUG } from './helpers';

test.describe('Navigation Sidebar (Project Context)', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`/project/${PROJECT_SLUG}/backlog`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should show a left sidebar menu with navigation links', async ({ page }) => {
    // Angular: project pages have a left sidebar (.menu-secondary or similar)
    // with links to Backlog, Kanban, Issues, Wiki, etc.
    const sidebar = page.locator('.sidebar-nav, .menu-secondary, [class*="project-navigation"], sidebar, [class*="sidebar"]').first();
    await expect(sidebar).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-sidebar-overview.png`, fullPage: true });
  });

  test('should have a "Backlog" navigation link', async ({ page }) => {
    // Backlog link in the sidebar
    const backlogLink = page.locator('a[href*="backlog"]').first();
    await expect(backlogLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-sidebar-backlog-link.png` });
  });

  test('should have a "Kanban" navigation link', async ({ page }) => {
    const kanbanLink = page.locator('a[href*="kanban"]').first();
    await expect(kanbanLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-sidebar-kanban-link.png` });
  });

  test('should have an "Issues" navigation link', async ({ page }) => {
    const issuesLink = page.locator('a[href*="issues"]').first();
    await expect(issuesLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-sidebar-issues-link.png` });
  });

  test('should have a "Wiki" navigation link', async ({ page }) => {
    const wikiLink = page.locator('a[href*="wiki"]').first();
    await expect(wikiLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-sidebar-wiki-link.png` });
  });

  test('should visually highlight the active "Backlog" section', async ({ page }) => {
    // Angular: the currently active nav item has an "active" CSS class.
    const activeBacklog = page.locator('a.active[href*="backlog"], a[class*="active"][href*="backlog"], [class*="active"] a[href*="backlog"]').first();
    await expect(activeBacklog).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-sidebar-active-highlight.png` });
  });

  test('should display the project name in the sidebar header', async ({ page }) => {
    // Angular: the sidebar (tg-project-navigation) shows the project name in an <a> tag
    // with title="Project Example 4". This is in the h1 inside the sidebar.
    const projectNameLink = page.locator('a[title="Project Example 4"]').first();
    await expect(projectNameLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-sidebar-project-name.png` });
  });
});
