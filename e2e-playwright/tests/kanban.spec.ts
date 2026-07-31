import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';
import * as kanbanHelper from '../helpers/kanban-helper';
import * as backlogHelper from '../helpers/backlog-helper';
import * as commonHelper from '../helpers/common-helper';
import { filtersShared } from '../shared/filters';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('kanban', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-0/kanban');
    await common.waitLoader(page);
  });

  test('zoom', async ({ page }) => {
    await kanbanHelper.zoom(page, 1);
    await page.waitForTimeout(1000);
    await kanbanHelper.zoom(page, 2);
    await page.waitForTimeout(1000);
    await kanbanHelper.zoom(page, 3);
    await page.waitForTimeout(1000);
    await kanbanHelper.zoom(page, 4);
    await page.waitForTimeout(1000);
  });

  test.describe('create us', () => {
    test('fill form and submit', async ({ page }) => {
      await kanbanHelper.openNewUsLb(page, 0);
      const createUSLightbox = backlogHelper.getCreateEditUsLightbox(page);
      await createUSLightbox.waitOpen();

      const date = Date.now();
      const subject = 'test subject' + date;
      await createUSLightbox.subject().fill(subject);

      await createUSLightbox.setRole(0, 3);
      await createUSLightbox.setRole(1, 3);
      await createUSLightbox.setRole(2, 3);
      await createUSLightbox.setRole(3, 3);

      const totalPoints = await createUSLightbox.getRolePoints();
      expect(totalPoints?.trim()).toBe('4');

      await commonHelper.tags(page);
      await createUSLightbox.description().fill('test description' + date);
      await createUSLightbox.settings(1).click();

      await commonHelper.lightboxAttachment(page);

      await createUSLightbox.submit();
      await lightbox.close(page, createUSLightbox.el);

      const ussTitles = await kanbanHelper.getColumnUssTitles(page, 0);
      expect(ussTitles.join('|')).toContain(subject);
    });
  });

  test.describe('edit us', () => {
    test('fill form and submit', async ({ page }) => {
      await kanbanHelper.editUs(page, 0, 0);
      const createUSLightbox = backlogHelper.getCreateEditUsLightbox(page);
      await createUSLightbox.waitOpen();

      const date = Date.now();
      const subject = 'test subject' + date;
      await createUSLightbox.subject().fill(subject);

      await createUSLightbox.submit();
      await lightbox.close(page, createUSLightbox.el);

      const ussTitles = await kanbanHelper.getColumnUssTitles(page, 0);
      expect(ussTitles.join('|')).toContain(subject);
    });
  });

  test.describe('bulk create', () => {
    test('fill form and submit', async ({ page }) => {
      const ussCount = await kanbanHelper.getBoxUss(page, 0).count();

      await kanbanHelper.openBulkUsLb(page, 0);
      const createUSLightbox = backlogHelper.getBulkCreateLightbox(page);
      await createUSLightbox.waitOpen();

      await createUSLightbox.textarea().pressSequentially('aaa');
      await page.keyboard.press('Enter');
      await createUSLightbox.textarea().pressSequentially('bbb');
      await page.keyboard.press('Enter');

      await createUSLightbox.submit();
      await lightbox.close(page, createUSLightbox.el);
      await page.waitForTimeout(1000);

      const newUssCount = await kanbanHelper.getBoxUss(page, 0).count();
      expect(newUssCount).toBe(ussCount + 2);
    });
  });

  test.describe('folds', () => {
    test('fold column', async ({ page }) => {
      await kanbanHelper.foldColumn(page, 0);
      await page.waitForTimeout(500);
      const foldedColumns = await page.locator('.vfold.task-column').count();
      expect(foldedColumns).toBe(1);
    });

    test('unfold column', async ({ page }) => {
      await kanbanHelper.foldColumn(page, 0);
      await page.waitForTimeout(500);
      await kanbanHelper.unFoldColumn(page, 0);
      const foldedColumns = await page.locator('.vfold.task-column').count();
      expect(foldedColumns).toBe(0);
    });
  });

  test('move us between columns', async ({ page }) => {
    const initOriginUsCount = await kanbanHelper.getBoxUss(page, 0).count();
    const initDestinationUsCount = await kanbanHelper.getBoxUss(page, 1).count();

    const usOrigin = kanbanHelper.getBoxUss(page, 0).first();
    const destination = kanbanHelper.getColumns(page).nth(1);

    await common.drag(page, usOrigin, destination, 0, 10);
    await page.waitForTimeout(1000);

    const originUsCount = await kanbanHelper.getBoxUss(page, 0).count();
    const destinationUsCount = await kanbanHelper.getBoxUss(page, 1).count();

    expect(originUsCount).toBe(initOriginUsCount - 1);
    expect(destinationUsCount).toBe(initDestinationUsCount + 1);
  });

  test.describe('archive', () => {
    test('move to archive', async ({ page }) => {
      const initOriginUsCount = await kanbanHelper.getBoxUss(page, 3).count();

      const usOrigin = kanbanHelper.getBoxUss(page, 3).first();
      const destination = kanbanHelper.getColumns(page).last();

      await kanbanHelper.scrollRight(page);
      await common.drag(page, usOrigin, destination, 0, 10);
      await page.waitForTimeout(1000);

      const originUsCount = await kanbanHelper.getBoxUss(page, 3).count();
      expect(originUsCount).toBe(initOriginUsCount - 1);
    });
  });

  test('edit assigned to', async ({ page }) => {
    await kanbanHelper.watchersLinks(page).first().click();

    const assignToLightbox = commonHelper.assignToLightbox(page);
    await assignToLightbox.waitOpen();

    const assignedToName = await assignToLightbox.getName(0);
    await assignToLightbox.selectFirst();
    await assignToLightbox.waitClose();

    const usAssignedTo = await kanbanHelper.getBoxUss(page, 0).nth(0).locator('.card-owner-name').textContent();
    expect(assignedToName?.trim()).toBe(usAssignedTo?.trim());
  });

  test.describe('kanban filters', () => {
    filtersShared('kanban', async (page) => {
      return kanbanHelper.getUss(page).count();
    });
  });
});
