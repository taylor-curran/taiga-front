import { Page, expect } from '@playwright/test';
import * as detailHelper from '../helpers/detail-helper';
import * as commonHelper from '../helpers/common-helper';
import * as notifications from '../utils/notifications';
import * as lightbox from '../utils/lightbox';
import * as common from '../utils/common';

export async function titleTesting(page: Page) {
  const titleHelper = detailHelper.title(page);
  const title = await titleHelper.getTitle();
  const date = Date.now();
  await titleHelper.setTitle('New title ' + date);
  await titleHelper.save();
  const notificationSuccess = await notifications.success.open(page);
  expect(notificationSuccess).toBe(true);
  const newTitle = await titleHelper.getTitle();
  expect(newTitle).not.toBe(title);
  await notifications.success.close(page);
}

export async function tagsTesting(page: Page) {
  const tagsHelper = detailHelper.tags(page);
  const tagsText = await tagsHelper.getTagsText();
  await tagsHelper.clearTags();
  const date = Date.now();
  const tagsList = [1, 2, 3].map((i) => date + '-' + i);
  await tagsHelper.addTags(tagsList);
  const newTagsText = await tagsHelper.getTagsText();
  expect(newTagsText).not.toEqual(tagsText);
}

export async function statusTesting(page: Page, status1: string, status2: string) {
  const statusHelper = detailHelper.statusSelector(page);
  await statusHelper.setStatus(1);
  const selectedStatus = await statusHelper.getSelectedStatus();
  expect(selectedStatus).toBe(status1);
  await statusHelper.setStatus(2);
  const newSelectedStatus = await statusHelper.getSelectedStatus();
  expect(newSelectedStatus).toBe(status2);
}

export async function historyTesting(page: Page, screenshotsFolder: string) {
  const historyHelper = detailHelper.history(page);
  await historyHelper.selectActivityTab();
  await common.takeScreenshot(page, screenshotsFolder, 'show-activity-tab');
}

export async function blockTesting(page: Page) {
  const blockHelper = detailHelper.block(page);
  const blockLightboxHelper = detailHelper.blockLightbox(page);
  await blockHelper.block();
  await blockLightboxHelper.waitOpen();
  await blockLightboxHelper.fill('This is a testing block reason');
  await blockLightboxHelper.submit();
  await blockLightboxHelper.waitClose();
  const notificationSuccess = await notifications.success.open(page);
  expect(notificationSuccess).toBe(true);
  await notifications.success.close(page);
}

export async function attachmentTesting(page: Page) {
  const el = page.locator('tg-attachments-full');
  const addAttachment = el.locator('#add-attach');
  const countAttachments = await el.locator('.single-attachment').count();
  const fileToUpload1 = common.uploadImagePath();
  const fileToUpload2 = common.uploadFilePath();
  await common.uploadFile(page, addAttachment, fileToUpload1);
  await common.uploadFile(page, addAttachment, fileToUpload2);
  await page.waitForTimeout(1000);
  const newCountAttachments = await el.locator('.single-attachment').count();
  expect(newCountAttachments).toBe(countAttachments + 2);
}

export async function deleteTesting(page: Page) {
  await page.locator('.detail-header-line .delete').click();
  await lightbox.confirm.ok(page);
}

export async function watchersTesting(page: Page) {
  const watcherEl = page.locator('.watchers');
  await watcherEl.locator('.add-watcher').click();
}
