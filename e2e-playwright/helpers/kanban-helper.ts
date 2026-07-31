import { Page, Locator } from '@playwright/test';

export function getHeaderColumns(page: Page) {
  return page.locator('.task-colum-name');
}

export function openNewUsLb(page: Page, column: number) {
  return getHeaderColumns(page).nth(column).locator('.option').nth(2).click();
}

export function getColumns(page: Page) {
  return page.locator('.task-column');
}

export async function getColumnUssTitles(page: Page, column: number) {
  return getColumns(page).nth(column).locator('.e2e-title').allTextContents();
}

export function getBoxUss(page: Page, column: number) {
  return getColumns(page).nth(column).locator('tg-card');
}

export function getUss(page: Page) {
  return page.locator('tg-card');
}

export async function editUs(page: Page, column: number, us: number) {
  const editionZone = getColumns(page).nth(column).locator('.card-owner-actions').nth(us);
  await editionZone.hover();
  await editionZone.locator('.e2e-edit').click();
}

export function openBulkUsLb(page: Page, column: number) {
  return page.locator('.icon-bulk').nth(column).click();
}

export function foldColumn(page: Page, column: number) {
  const columnNode = getHeaderColumns(page).nth(column);
  return columnNode.locator('.options a').nth(0).click();
}

export function unFoldColumn(page: Page, column: number) {
  const columnNode = getHeaderColumns(page).nth(column);
  return columnNode.locator('.options a').nth(1).click();
}

export async function scrollRight(page: Page) {
  await page.evaluate(() => {
    const el = document.querySelector('.kanban-table-body:last-child') as HTMLElement;
    if (el) el.scrollLeft = 10000;
  });
}

export function watchersLinks(page: Page) {
  return page.locator('.e2e-assign');
}

export async function zoom(page: Page, level: number) {
  const zoomEl = page.locator('tg-board-zoom');
  const box = await zoomEl.boundingBox();
  if (box) {
    await page.mouse.click(box.x + level * 49, box.y + 14);
  }
}
