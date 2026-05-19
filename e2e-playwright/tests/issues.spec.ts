import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as notifications from '../utils/notifications';
import * as lightbox from '../utils/lightbox';
import * as issuesHelper from '../helpers/issues-helper';
import * as commonHelper from '../helpers/common-helper';
import { filtersShared } from '../shared/filters';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('issues list', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-3/issues');
    await page.waitForTimeout(2000);
  });

  test.describe('create Issue', () => {
    test('fill form and submit', async ({ page }) => {
      const createIssueLightbox = issuesHelper.getCreateIssueLightbox(page);
      await issuesHelper.openNewIssueLb(page);
      await createIssueLightbox.waitOpen();

      await createIssueLightbox.subject().fill('subject ' + Date.now());
      await commonHelper.tags(page);
      await commonHelper.lightboxAttachment(page);

      await createIssueLightbox.submit();
      const openNotification = await notifications.success.open(page);
      expect(openNotification).toBe(true);
      await notifications.success.close(page);
    });
  });

  test.describe('bulk create Issue', () => {
    test('fill form and submit', async ({ page }) => {
      await issuesHelper.openBulk(page);
      const createIssueLightbox = issuesHelper.getBulkCreateLightbox(page);
      await createIssueLightbox.waitOpen();

      await createIssueLightbox.textarea().pressSequentially('aaa');
      await page.keyboard.press('Enter');
      await createIssueLightbox.textarea().pressSequentially('bbb');
      await page.keyboard.press('Enter');

      await createIssueLightbox.submit();
      await createIssueLightbox.waitClose();

      const notificationSuccess = await notifications.success.open(page);
      expect(notificationSuccess).toBe(true);
      await notifications.success.close(page);
    });
  });

  test('change order', async ({ page }) => {
    for (let i = 0; i < 7; i++) {
      await issuesHelper.clickColumn(page, i);
      await page.waitForTimeout(500);
      await issuesHelper.clickColumn(page, i);
      await page.waitForTimeout(500);
    }
  });

  test('assign to', async ({ page }) => {
    const assignToLightbox = commonHelper.assignToLightbox(page);
    await issuesHelper.openAssignTo(page, 0);
    await assignToLightbox.waitOpen();

    const newUserName = await assignToLightbox.getName(2);
    await assignToLightbox.select(2);
    await assignToLightbox.waitClose();

    const issueUserName = await issuesHelper.getAssignTo(page, 0);
    expect(issueUserName?.trim()).toBe(newUserName?.trim());
  });

  test('change status', async ({ page }) => {
    await issuesHelper.changeStatus(page, 0, 1);
    await page.waitForTimeout(500);
    const statusBefore = await page.locator('.issue-status').nth(0).textContent();

    await issuesHelper.changeStatus(page, 0, 2);
    await page.waitForTimeout(500);
    const statusAfter = await page.locator('.issue-status').nth(0).textContent();

    expect(statusBefore).not.toBe(statusAfter);
  });

  test.describe('issues filters', () => {
    filtersShared('issues', async (page) => {
      return issuesHelper.getIssues(page).count();
    });
  });
});
