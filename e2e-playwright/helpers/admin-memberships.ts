import { Page } from '@playwright/test';
import * as lightbox from '../utils/lightbox';

export function getNewMemberLightbox(page: Page) {
  const el = page.locator('.lightbox-add-member');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
    newEmail: (email: string) => el.locator('input[type="email"]').fill(email),
    setRole: (index: number) => el.locator('select option').nth(index).click(),
    submit: () => el.locator('.button-green').click(),
  };
}

export function openNewMemberLightbox(page: Page) {
  return page.locator('.add-member-button').click();
}
