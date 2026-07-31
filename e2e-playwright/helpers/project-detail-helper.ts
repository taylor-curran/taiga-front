import { Page } from '@playwright/test';
import * as lightbox from '../utils/lightbox';

export function changeOwner(page: Page) {
  return page.locator('.transfer-project').click();
}

export function getChangeOwnerLb(page: Page) {
  const el = page.locator('.lightbox-transfer-project');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
    search: (name: string) => el.locator('input').fill(name),
    select: (index: number) => el.locator('.user-list-single').nth(index).click(),
    addComment: (text: string) => el.locator('textarea').fill(text),
    send: () => el.locator('.button-green').click(),
  };
}

export function changeOwnerSuccessLb(page: Page) {
  return page.locator('.lightbox-transfer-project-accepted');
}
