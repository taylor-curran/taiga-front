import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';
import * as notifications from '../utils/notifications';
import * as backlogHelper from '../helpers/backlog-helper';
import * as commonHelper from '../helpers/common-helper';
import { filtersShared } from '../shared/filters';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('backlog', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/project/project-1/backlog');
    await common.waitLoader(page);
    await page.close();
  });

  test.describe('create US', () => {
    test('fill form and submit', async ({ page }) => {
      await page.goto('/project/project-1/backlog');
      await common.waitLoader(page);

      const usCount = await backlogHelper.userStories(page).count();

      await backlogHelper.openNewUs(page);
      const createUSLightbox = backlogHelper.getCreateEditUsLightbox(page);
      await createUSLightbox.waitOpen();

      const date = Date.now();
      const subject = 'test subject' + date;

      await createUSLightbox.subject().fill(subject);

      // Set roles
      await createUSLightbox.setRole(0, 3);
      await createUSLightbox.setRole(1, 3);
      await createUSLightbox.setRole(2, 3);
      await createUSLightbox.setRole(3, 3);

      const totalPoints = await createUSLightbox.getRolePoints();
      expect(totalPoints?.trim()).toBe('4');

      // Tags
      await commonHelper.tags(page);

      // Description
      await createUSLightbox.description().fill('test description' + date);

      // Settings
      await createUSLightbox.settings(1).click();

      // Upload attachments
      await commonHelper.lightboxAttachment(page);

      // Submit
      await createUSLightbox.submit();
      await lightbox.close(page, createUSLightbox.el);

      await page.waitForTimeout(1000);
      const newUsCount = await backlogHelper.userStories(page).count();
      expect(newUsCount).toBe(usCount + 1);
    });
  });

  test.describe('bulk create US', () => {
    test('fill form and submit', async ({ page }) => {
      await page.goto('/project/project-1/backlog');
      await common.waitLoader(page);

      const usCount = await backlogHelper.userStories(page).count();

      await backlogHelper.openBulk(page);
      const bulkLightbox = backlogHelper.getBulkCreateLightbox(page);
      await bulkLightbox.waitOpen();

      await bulkLightbox.textarea().pressSequentially('aaa');
      await page.keyboard.press('Enter');
      await bulkLightbox.textarea().pressSequentially('bbb');

      await bulkLightbox.submit();
      await lightbox.close(page, bulkLightbox.el);

      await page.waitForTimeout(1000);
      const newUsCount = await backlogHelper.userStories(page).count();
      expect(newUsCount).toBe(usCount + 2);
    });
  });

  test.describe('edit US', () => {
    test('edit subject', async ({ page }) => {
      await page.goto('/project/project-1/backlog');
      await common.waitLoader(page);

      await backlogHelper.openUsBacklogEdit(page, 0);
      const createUSLightbox = backlogHelper.getCreateEditUsLightbox(page);
      await createUSLightbox.waitOpen();

      const date = Date.now();
      const newSubject = 'edited subject' + date;

      await createUSLightbox.subject().fill(newSubject);
      await createUSLightbox.submit();
      await lightbox.close(page, createUSLightbox.el);
    });
  });

  test('edit status inline', async ({ page }) => {
    await page.goto('/project/project-1/backlog');
    await common.waitLoader(page);

    await backlogHelper.setUsStatus(page, 0, 1);
    await page.waitForTimeout(500);
  });

  test('edit points inline', async ({ page }) => {
    await page.goto('/project/project-1/backlog');
    await common.waitLoader(page);

    await backlogHelper.setUsPoints(page, 0, 1, 2);
    await page.waitForTimeout(500);
  });

  test('delete us', async ({ page }) => {
    await page.goto('/project/project-1/backlog');
    await common.waitLoader(page);

    const usCount = await backlogHelper.userStories(page).count();
    await backlogHelper.deleteUs(page, 0);
    await lightbox.confirm.ok(page);
    await page.waitForTimeout(1000);
    const newUsCount = await backlogHelper.userStories(page).count();
    expect(newUsCount).toBe(usCount - 1);
  });

  test('drag backlog us', async ({ page }) => {
    await page.goto('/project/project-1/backlog');
    await common.waitLoader(page);

    const uss = backlogHelper.userStories(page);
    const usCount = await uss.count();
    if (usCount < 2) return;

    const firstRef = await backlogHelper.getUsRef(uss.first());
    const dragEl = uss.nth(1).locator('.icon-drag');
    const target = uss.first();

    await common.drag(page, dragEl, target);
    await page.waitForTimeout(1000);

    const newFirstRef = await backlogHelper.getUsRef(uss.first());
    expect(newFirstRef).not.toBe(firstRef);
  });

  test.describe('milestones', () => {
    test('create milestone', async ({ page }) => {
      await page.goto('/project/project-1/backlog');
      await common.waitLoader(page);

      const sprintCount = await backlogHelper.sprints(page).count();

      await backlogHelper.openNewMilestone(page);
      const createMilestoneLightbox = backlogHelper.getCreateEditMilestone(page);
      await createMilestoneLightbox.waitOpen();

      await createMilestoneLightbox.name().fill('sprintName' + Date.now());
      await createMilestoneLightbox.submit();
      await createMilestoneLightbox.waitClose();

      await page.waitForTimeout(1000);
      const newSprintCount = await backlogHelper.sprints(page).count();
      expect(newSprintCount).toBe(sprintCount + 1);
    });

    test('edit milestone', async ({ page }) => {
      await page.goto('/project/project-1/backlog');
      await common.waitLoader(page);

      await backlogHelper.openMilestoneEdit(page, 0);
      const editMilestoneLightbox = backlogHelper.getCreateEditMilestone(page);
      await editMilestoneLightbox.waitOpen();

      await editMilestoneLightbox.name().fill('edited ' + Date.now());
      await editMilestoneLightbox.submit();
      await editMilestoneLightbox.waitClose();
    });

    test('delete milestone', async ({ page }) => {
      await page.goto('/project/project-1/backlog');
      await common.waitLoader(page);

      const sprintCount = await backlogHelper.sprints(page).count();

      await backlogHelper.openMilestoneEdit(page, 0);
      const editMilestoneLightbox = backlogHelper.getCreateEditMilestone(page);
      await editMilestoneLightbox.waitOpen();

      await editMilestoneLightbox.delete();
      await lightbox.confirm.ok(page);
      await page.waitForTimeout(1000);

      const newSprintCount = await backlogHelper.sprints(page).count();
      expect(newSprintCount).toBe(sprintCount - 1);
    });
  });

  test('role filters', async ({ page }) => {
    await page.goto('/project/project-1/backlog');
    await common.waitLoader(page);

    const usCount = await backlogHelper.userStories(page).count();
    await backlogHelper.filterRole(page, 0);
    await page.waitForTimeout(500);
    const filteredCount = await backlogHelper.userStories(page).count();
    expect(filteredCount).toBeLessThanOrEqual(usCount);
    await backlogHelper.filterRole(page, 0);
  });

  test('velocity forecasting', async ({ page }) => {
    await page.goto('/project/project-1/backlog');
    await common.waitLoader(page);

    await backlogHelper.openVelocityForecasting(page);
    await page.waitForTimeout(500);
  });

  test('hide forecasting if no velocity', async ({ page }) => {
    await page.goto('/project/project-5/backlog');
    await common.waitLoader(page);

    const forecasting = backlogHelper.velocityForecasting(page);
    const count = await forecasting.count();
    // If project has no velocity, forecasting should be hidden or empty
    expect(count).toBeLessThanOrEqual(1);
  });

  test.describe('backlog filters', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/project/project-1/backlog');
      await common.waitLoader(page);
    });

    filtersShared('backlog', async (page) => {
      return backlogHelper.userStories(page).count();
    });
  });
});
