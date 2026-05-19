import { Page, Locator } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';

export function links(page: Page) {
  const el = page.locator('sidebar[tg-wiki-nav]');
  return {
    el,
    addLink: async (pageTitle: string) => {
      await el.locator('.add-button').click();
      await el.locator('.new input').fill(pageTitle);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);
      return el.locator('.e2e-wiki-page-link a').last();
    },
    get: (index?: number) => {
      if (index !== undefined && index !== null) {
        return el.locator('.e2e-wiki-page-link a.link-title').nth(index);
      }
      return el.locator('.e2e-wiki-page-link a.link-title');
    },
    row: (index: number) => el.locator('.e2e-wiki-page-link').nth(index),
    getNameOf: async (index: number) => {
      return el.locator('.e2e-wiki-page-link a.link-title').nth(index).textContent();
    },
    deleteLink: async (link: Locator) => {
      await link.click();
      await lightbox.confirm.ok(page);
      await page.waitForTimeout(1000);
    },
  };
}

export async function dragAndDropLinks(page: Page, indexFrom: number, indexTo: number) {
  const selectedLink = links(page).row(indexFrom).locator('.dragger');
  const target = links(page).get(indexTo);
  await common.drag(page, selectedLink, target);
}

export function editor(page: Page) {
  const el = page.locator('.main.wiki');
  return {
    el,
    focus: () => el.locator('textarea').click(),
    enabledEditionMode: () => el.locator('section[tg-editable-wiki-content] .view-wiki-content').click(),
    getTimesEdited: () => el.locator('.wiki-times-edited .number').textContent(),
    getLastEditionDateTime: () => el.locator('.wiki-last-modified .number').textContent(),
    getLastEditor: () => el.locator('.wiki-user-modification .username').textContent(),
    getInnerHtml: () => el.locator('.view-wiki-content .wysiwyg').innerHTML(),
    getText: () => el.locator('textarea').inputValue(),
    setText: async (text: string) => {
      await el.locator('textarea').fill(text);
    },
    preview: () => el.locator('.preview-icon a').click(),
    closePreview: () => el.locator('.actions .wysiwyg').click(),
    save: async () => {
      await el.locator('.save').click();
      await page.waitForTimeout(1000);
    },
    delete: async () => {
      await el.locator('.remove').click();
      await lightbox.confirm.ok(page);
      await page.waitForTimeout(1000);
    },
  };
}
