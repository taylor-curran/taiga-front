import { Page, expect } from '@playwright/test';
import * as lightbox from '../utils/lightbox';
import * as common from '../utils/common';

export function assignToLightbox(page: Page) {
  const el = page.locator('div[tg-lb-assignedto]');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
    close: () => el.locator('.close').first().click(),
    selectFirst: () => el.locator('div[data-user-id]').first().click(),
    select: (index: number) => el.locator('div[data-user-id]').nth(index).click(),
    getName: (item: number) => el.locator('div[data-user-id] .user-list-name').nth(item).textContent(),
    getNames: () => el.locator('.user-list-name').allTextContents(),
    filter: (text: string) => el.locator('input').fill(text),
    userList: () => el.locator('.user-list-single'),
  };
}

export async function lightboxAttachment(page: Page) {
  const el = page.locator('tg-attachments-simple');
  const addAttachment = el.locator('#add-attach');
  const countAttachments = await el.locator('.single-attachment').count();

  const fileToUpload1 = common.uploadImagePath();
  const fileToUpload2 = common.uploadFilePath();

  await common.uploadFile(page, addAttachment, fileToUpload1);
  await common.uploadFile(page, addAttachment, fileToUpload2);

  await el.locator('.attachment-delete').nth(0).click();

  const newCountAttachments = await el.locator('.single-attachment').count();
  expect(countAttachments + 1).toBe(newCountAttachments);
}

export async function tags(page: Page) {
  await page.locator('.e2e-show-tag-input').click();
  await page.locator('.e2e-open-color-selector').click();
  await page.locator('.e2e-color-dropdown li').nth(1).click();
  const tagInput = page.locator('.e2e-add-tag-input');
  await tagInput.fill('xxxyy');
  await tagInput.press('Enter');
  await page.locator('.e2e-delete-tag').last().click();
  await tagInput.fill('a');
  await tagInput.press('ArrowDown');
  await tagInput.press('Enter');
}
