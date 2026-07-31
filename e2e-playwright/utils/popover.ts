import { Page, Locator } from '@playwright/test';

const TRANSITION = 400;

async function selectPopoverItem(page: Page, item: number) {
  const popover = page.locator('.popover.active');
  await popover.locator('a').nth(item).click();
  await page.waitForTimeout(TRANSITION);
}

export async function wait(page: Page): Promise<Locator> {
  await page.waitForFunction(
    () => document.querySelectorAll('.popover.active').length === 1,
    null,
    { timeout: 3000 }
  );
  return page.locator('.popover.active');
}

export async function open(page: Page, el: Locator, item?: number, item2?: number) {
  await el.click();
  await wait(page);

  if (item !== undefined) {
    await selectPopoverItem(page, item);

    if (item2 !== undefined) {
      await wait(page);
      await selectPopoverItem(page, item2);
    }
  }
}
