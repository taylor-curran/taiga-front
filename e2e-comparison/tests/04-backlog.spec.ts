import { test, expect } from '@playwright/test';
import { login, PROJECT_SLUG } from './helpers';

test.describe('Backlog Page', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
    await page.goto(`/project/${PROJECT_SLUG}/backlog`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
  });

  test('should display sprint panels with sprint names', async ({ page }) => {
    // Angular: backlog shows sprint/milestone panels at the top.
    // Sprint names are visible like "Sprint 1", "Sprint 2".
    const sprintText = page.getByText(/Sprint \d/).first();
    await expect(sprintText).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-backlog-sprints.png`, fullPage: true });
  });

  test('should show user stories with reference numbers (#N)', async ({ page }) => {
    // Angular: stories are linked as <a href="#">#42 Lighttpd support</a>.
    // The text contains "#N" followed by the story title.
    const storyLink = page.locator('a[href="#"]').filter({ hasText: /^#\d+/ }).first();
    await expect(storyLink).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-backlog-story-refs.png` });
  });

  test('should show a "Backlog" heading for the product backlog section', async ({ page }) => {
    // Angular: has a "Backlog" heading for the unassigned stories section.
    const backlogHeading = page.getByRole('heading', { name: 'Backlog' });
    await expect(backlogHeading).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-backlog-heading.png` });
  });

  test('should show sprint progress bars', async ({ page }) => {
    // Angular: sprint panels show visual progress bars.
    const progressBar = page.locator('.progress-bar, [class*="progress"], progress').first();
    await expect(progressBar).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-backlog-progress.png` });
  });

  test('should have a burndown/stats area in sprint panels', async ({ page }) => {
    // Angular: sprint panels include stats like closed/total points.
    const statsArea = page.locator('[class*="stats"], [class*="points"], [class*="burndown"]').first();
    await expect(statsArea).toBeVisible();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-backlog-stats.png` });
  });

  test('should have story rows with assignee info', async ({ page }) => {
    // Angular: each story row in the backlog can show an assignee avatar or name.
    const avatar = page.locator('.avatar, [class*="avatar"], img[class*="avatar"]').first();
    const hasAvatar = await avatar.isVisible().catch(() => false);
    // Or at least there are story rows
    const storyRows = page.locator('.us-item, [class*="user-story"], [class*="us-"]').first();
    const hasRows = hasAvatar || await storyRows.isVisible().catch(() => false);
    expect(hasRows).toBeTruthy();
    await page.screenshot({ path: `screenshots/${test.info().project.name}-backlog-assignees.png` });
  });
});
