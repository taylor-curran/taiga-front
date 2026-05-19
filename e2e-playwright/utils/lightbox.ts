import { Page, Locator } from '@playwright/test';
import { hasClass } from './common';

const TRANSITION = 400;

export async function open(page: Page, elOrSelector: Locator | string): Promise<boolean> {
  const el = typeof elOrSelector === 'string' ? page.locator(elOrSelector) : elOrSelector;
  try {
    await page.waitForFunction(
      (selector) => {
        const el = typeof selector === 'string'
          ? document.querySelector(selector)
          : null;
        return el ? el.classList.contains('open') : false;
      },
      typeof elOrSelector === 'string' ? elOrSelector : null,
      { timeout: 4000 }
    ).catch(async () => {
      // Fallback: wait for the locator to have 'open' class
      await el.waitFor({ state: 'visible', timeout: 4000 });
    });

    // Wait for the class directly on the locator
    const classes = await el.getAttribute('class');
    if (!classes?.includes('open')) {
      await page.waitForFunction(
        (sel) => {
          const elements = document.querySelectorAll('.lightbox');
          for (const e of elements) {
            if (e.classList.contains('open')) return true;
          }
          return false;
        },
        null,
        { timeout: 4000 }
      );
    }
    await page.waitForTimeout(TRANSITION + 100);
    return true;
  } catch {
    return false;
  }
}

export async function close(page: Page, elOrSelector: Locator | string): Promise<boolean> {
  const el = typeof elOrSelector === 'string' ? page.locator(elOrSelector) : elOrSelector;
  try {
    const isPresent = await el.count() > 0;
    if (!isPresent) return true;

    await page.waitForFunction(
      () => {
        const elements = document.querySelectorAll('.lightbox.open');
        return elements.length === 0;
      },
      null,
      { timeout: 4000 }
    ).catch(() => {});

    await page.waitForTimeout(300);
    return true;
  } catch {
    return true;
  }
}

export async function exit(page: Page, elOrSelector?: Locator | string) {
  const el = elOrSelector
    ? (typeof elOrSelector === 'string' ? page.locator(elOrSelector) : elOrSelector)
    : page.locator('.lightbox.open');

  await el.locator('.close').click();
  await close(page, el);
}

export const confirm = {
  ok: async (page: Page) => {
    const lb = page.locator('.lightbox-generic-ask');
    await open(page, lb);
    await lb.locator('.button-green').click();
    await close(page, lb);
  },
  cancel: async (page: Page) => {
    const lb = page.locator('.lightbox-generic-ask');
    await open(page, lb);
    await lb.locator('.button-red').click();
    await close(page, lb);
  },
};
