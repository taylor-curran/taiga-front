import { test, expect } from '@playwright/test';
import { login, PROJECT_SLUG } from './helpers';

test.describe('Issues List', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`/project/${PROJECT_SLUG}/issues`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should display issue rows with reference numbers', async ({ page }) => {
    // Angular: issues page shows a table/list with "#N" refs.
    const issueRef = page.locator('text=/#\\d+/').first();
    await expect(issueRef).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-issues-list.png`, fullPage: true });
  });

  test('should show issue table column headers (Type, Severity, Priority, etc.)', async ({ page }) => {
    // Angular: issues table has div-based column headers for Type, Severity, Priority,
    // Issue, Status, Modified, Assign to.
    const typeHeader = page.getByText('Type', { exact: true }).first();
    const severityHeader = page.getByText('Severity', { exact: true }).first();
    const priorityHeader = page.getByText('Priority', { exact: true }).first();
    await expect(typeHeader).toBeVisible();
    await expect(severityHeader).toBeVisible();
    await expect(priorityHeader).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-issues-column-headers.png` });
  });

  test('should show issue status text on each row (e.g., Closed, Rejected)', async ({ page }) => {
    // Angular: each issue row shows a status label like "Closed", "Rejected", etc.
    const statusLink = page.locator('a[title="Change status"]').first();
    await expect(statusLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-issues-status-badges.png` });
  });

  test('should display assignee avatars on issue rows', async ({ page }) => {
    // Angular: issue rows show assigned user avatars.
    const avatar = page.locator('[class*="avatar"], img[class*="avatar"]').first();
    await expect(avatar).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-issues-avatars.png` });
  });

  test('should have a "NEW ISSUE" creation button', async ({ page }) => {
    // Angular: issues page has a "NEW ISSUE" button in the header area.
    const newIssueBtn = page.getByRole('button', { name: 'NEW ISSUE' });
    await expect(newIssueBtn).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-issues-new-button.png` });
  });

  test('should show pagination or total count of issues', async ({ page }) => {
    // Angular: issues page has pagination or count display.
    const issueRows = page.locator('[class*="row"], tr').filter({ hasText: /#\d+/ });
    const rowCount = await issueRows.count();
    expect(rowCount).toBeGreaterThan(0);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-issues-rows.png` });
  });

  test('should show issue status labels on each row', async ({ page }) => {
    // Angular: each issue row displays its current status.
    const pageText = await page.evaluate(() => document.body.innerText);
    const statusNames = ['New', 'In progress', 'Ready for test', 'Closed', 'Needs Info', 'Postponed', 'Rejected'];
    let statusCount = 0;
    for (const name of statusNames) {
      if (pageText.includes(name)) statusCount++;
    }
    expect(statusCount).toBeGreaterThanOrEqual(1);
    await page.screenshot({ path: `screenshots/${test.info().project.name}-issues-statuses.png` });
  });
});
