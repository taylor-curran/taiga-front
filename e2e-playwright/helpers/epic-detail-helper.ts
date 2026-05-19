import { Page } from '@playwright/test';
import * as lightbox from '../utils/lightbox';

export function colorEditor(page: Page) {
  const el = page.locator('tg-color-selector');
  return {
    el,
    open: () => el.locator('.e2e-open-color-selector').click(),
    selectFirstColor: async () => {
      await el.locator('.color-selector-option').first().click();
      await page.waitForTimeout(1000);
    },
    selectLastColor: async () => {
      await el.locator('.color-selector-option').last().click();
      await page.waitForTimeout(1000);
    },
  };
}

export function relatedUserstories(page: Page) {
  const el = page.locator('tg-related-userstories');
  const lightboxCreateRelatedUserStories = el.locator('.lightbox-create-related-user-stories');
  return {
    el,
    createNewUserStory: async (subject: string) => {
      await el.locator('.e2e-add-userstory-button').click();
      await el.locator('.e2e-new-userstory-label').click();
      await el.locator('.e2e-single-creation-label').click();
      await el.locator('.e2e-new-userstory-input-text').fill(subject);
      await el.locator('.e2e-create-userstory-button').click();
      await lightbox.close(page, lightboxCreateRelatedUserStories);
    },
    createNewUserStories: async (subject: string) => {
      await el.locator('.e2e-add-userstory-button').click();
      await el.locator('.e2e-new-userstory-label').click();
      await el.locator('.e2e-bulk-creation-label').click();
      await el.locator('.e2e-new-userstories-input-textarea').fill(subject);
      await el.locator('.e2e-create-userstory-button').click();
      await lightbox.close(page, lightboxCreateRelatedUserStories);
    },
    selectFirstRelatedUserstory: async () => {
      await el.locator('.e2e-add-userstory-button').click();
      await el.locator('.e2e-existing-user-story-label').click();
      await el.locator('.e2e-filter-userstories-input').fill('#1');
      await el.locator('.e2e-userstories-select option').nth(1).click();
      await el.locator('.e2e-select-related-userstory-button').click();
      await lightbox.close(page, lightboxCreateRelatedUserStories);
    },
    deleteFirstRelatedUserstory: async () => {
      const relatedUSRow = el.locator('tg-related-userstory-row').first();
      await relatedUSRow.hover();
      await relatedUSRow.locator('.e2e-delete-userstory').click();
      await lightbox.confirm.ok(page);
    },
  };
}
