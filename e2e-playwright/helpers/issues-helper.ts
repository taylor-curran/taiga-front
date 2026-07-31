import { Page, Locator } from '@playwright/test';
import * as lightbox from '../utils/lightbox';
import * as popover from '../utils/popover';

export function getCreateIssueLightbox(page: Page) {
  const el = page.locator('div[tg-lb-create-issue]');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
    subject: () => el.locator('input').first(),
    tags: () => el.locator('.tag-input'),
    submit: () => el.locator('button[type="submit"]').click(),
  };
}

export function getBulkCreateLightbox(page: Page) {
  const el = page.locator('div[tg-lb-create-bulk-issues]');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    textarea: () => el.locator('textarea'),
    submit: () => el.locator('button[type="submit"]').click(),
    waitClose: () => lightbox.close(page, el),
  };
}

export function openNewIssueLb(page: Page) {
  return page.locator('.new-issue .button-green').click();
}

export function openBulk(page: Page) {
  return page.locator('.new-issue .button-bulk').click();
}

export function clickColumn(page: Page, index: number) {
  return page.locator('.row.title > div').nth(index).click();
}

export function getTable(page: Page) {
  return page.locator('.basic-table');
}

export function openAssignTo(page: Page, index: number) {
  return page.locator('.issue-assignedto').nth(index).click();
}

export async function changeStatus(page: Page, index: number, statusIndex: number) {
  const status = page.locator('.issue-status').nth(index);
  await popover.open(page, status, statusIndex);
}

export function getStatus(page: Page) {
  return page.locator('.issue-status').allTextContents();
}

export async function getAssignTo(page: Page, index: number) {
  return page.locator('.assigned-field figcaption').nth(index).textContent();
}

export function getIssues(page: Page) {
  return page.locator('.row.table-main');
}
