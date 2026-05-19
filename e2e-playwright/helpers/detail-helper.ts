import { Page, Locator } from '@playwright/test';
import * as popover from '../utils/popover';
import * as lightbox from '../utils/lightbox';

export function title(page: Page) {
  const el = page.locator('.e2e-story-header');
  return {
    el,
    getTitle: () => el.locator('.e2e-title-subject').textContent(),
    setTitle: async (title: string) => {
      await el.locator('.e2e-detail-edit').click();
      await el.locator('.e2e-title-input').fill(title);
    },
    save: async () => {
      await el.locator('.e2e-title-button').click();
      await page.waitForTimeout(1000);
    },
  };
}

export function description(page: Page) {
  const el = page.locator('section[tg-editable-description]');
  return {
    el,
    focus: () => el.locator('textarea').click(),
    enabledEditionMode: () => el.locator('.view-description').click(),
    getInnerHtml: () => el.locator('.wysiwyg.editable').innerHTML(),
    setText: async (text: string) => {
      await el.locator('textarea').fill(text);
    },
    save: async () => {
      await el.locator('.save').click();
      await page.waitForTimeout(1000);
    },
  };
}

export function tags(page: Page) {
  const el = page.locator('tg-tag-line-common');
  return {
    el,
    clearTags: async () => {
      let count = await el.locator('.e2e-delete-tag').count();
      while (count > 0) {
        await el.locator('.e2e-delete-tag').first().click();
        await page.waitForTimeout(500);
        count = await el.locator('.e2e-delete-tag').count();
      }
    },
    getTagsText: () => el.locator('tg-tag span').allTextContents(),
    addTags: async (tagsList: string[]) => {
      await page.locator('.e2e-show-tag-input').click();
      for (const tag of tagsList) {
        await el.locator('.e2e-add-tag-input').fill(tag);
        await el.locator('.save').click();
        await page.waitForTimeout(500);
      }
    },
  };
}

export function statusSelector(page: Page) {
  const el = page.locator('.ticket-data');
  return {
    el,
    setStatus: async (value: number) => {
      const status = el.locator('.detail-status-inner');
      await popover.open(page, status, value);
      return el.locator('.detail-status-inner .e2e-status').first().getAttribute('innerHTML');
    },
    getSelectedStatus: () =>
      el.locator('.detail-status-inner .e2e-status').first().getAttribute('innerHTML'),
  };
}

export function assignedTo(page: Page) {
  const el = page.locator('.menu-secondary .assigned-to');
  return {
    el,
    clear: async () => {
      const deleteIcon = el.locator('.icon-delete');
      if (await deleteIcon.isVisible().catch(() => false)) {
        await deleteIcon.click();
        await lightbox.confirm.ok(page);
        await page.waitForTimeout(1000);
      }
    },
    assign: () => el.locator('.user-assigned').click(),
    getUserName: () => el.locator('.user-assigned').textContent(),
    isUnassigned: () => el.locator('.assign-to-me').isVisible(),
  };
}

export function history(page: Page) {
  const el = page.locator('section.history');
  return {
    el,
    selectCommentsTab: async () => {
      await el.locator('.e2e-comments-tab').click();
      await page.waitForTimeout(500);
    },
    selectActivityTab: async () => {
      await el.locator('.e2e-activity-tab').click();
      await page.waitForTimeout(500);
    },
    countComments: () => el.locator('.comment-wrapper').count(),
    countActivities: () => el.locator('.activity').count(),
    countDeletedComments: () => el.locator('.deleted-comment-wrapper').count(),
  };
}

export function block(page: Page) {
  const el = page.locator('.block');
  return {
    el,
    block: () => page.locator('.detail-block .item-block').click(),
    unblock: () => page.locator('.detail-block .item-unblock').click(),
  };
}

export function blockLightbox(page: Page) {
  const el = page.locator('.lightbox-block');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
    fill: (text: string) => el.locator('textarea').fill(text),
    submit: () => el.locator('.button-green').click(),
  };
}

export function attachment(page: Page) {
  return page.locator('.attachments');
}

export function watchers(page: Page) {
  return page.locator('.watchers');
}

export function watchersLightbox(page: Page) {
  const el = page.locator('div[tg-lb-watchers]');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
  };
}

export function deleteItem(page: Page) {
  return page.locator('.detail-header-line .delete');
}

export function teamRequirement(page: Page) {
  return page.locator('.team-requirement');
}

export function clientRequirement(page: Page) {
  return page.locator('.client-requirement');
}
