import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';
import * as notifications from '../utils/notifications';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('project home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-1/');
    await common.waitLoader(page);

    // Reset like state
    const link = page.locator('tg-like-project-button button');
    const likeActive = await common.hasClass(link, 'active');
    if (!likeActive) {
      await link.click();
      await page.waitForTimeout(1000);
    }
  });

  test('unlike', async ({ page }) => {
    const link = page.locator('tg-like-project-button button');
    const likesCounterOld = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    await link.click();
    await page.waitForTimeout(1000);

    const likeActive = await common.hasClass(link, 'active');
    const likesCounter = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    expect(likeActive).toBe(false);
    expect(likesCounter).toBe(likesCounterOld - 1);
  });

  test('like', async ({ page }) => {
    // First unlike
    const link = page.locator('tg-like-project-button button');
    await link.click();
    await page.waitForTimeout(1000);

    const likesCounterOld = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    await link.click();
    await page.waitForTimeout(1000);

    const likeActive = await common.hasClass(link, 'active');
    const likesCounter = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    expect(likeActive).toBe(true);
    expect(likesCounter).toBe(likesCounterOld + 1);
  });

  test('contact project', async ({ page }) => {
    await page.locator('tg-contact-project-button > .e2e-contact-team').click();
    const contactProjectLb = page.locator('div[tg-lb-contact-project]');
    await lightbox.open(page, contactProjectLb);

    const form = page.locator('.e2e-lightbox-contact-project');
    await form.locator('.e2e-lightbox-contact-project-message').fill('contact');
    await form.locator('.e2e-lightbox-contact-project-button').click();

    await notifications.success.open(page);
    await notifications.success.close(page);
  });

  test('unwatch', async ({ page }) => {
    const link = page.locator('tg-watch-project-button > button');
    const watchOptions = page.locator('tg-watch-project-button .watch-options');
    const watchCounterOld = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    await link.click();
    await page.waitForTimeout(1000);

    await page.waitForFunction(
      () => !document.querySelector('tg-watch-project-button .watch-options')?.classList.contains('hidden'),
      null,
      { timeout: 4000 }
    ).catch(() => {});

    await watchOptions.locator('a').last().click();

    await page.waitForFunction(
      () => document.querySelector('tg-watch-project-button .watch-options')?.classList.contains('hidden'),
      null,
      { timeout: 4000 }
    ).catch(() => {});

    const watchActive = await common.hasClass(link, 'active');
    const watchCounter = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    expect(watchActive).toBe(false);
    expect(watchCounter).toBe(watchCounterOld - 1);
  });

  test('watch', async ({ page }) => {
    // First unwatch
    const link = page.locator('tg-watch-project-button > button');
    const watchOptions = page.locator('tg-watch-project-button .watch-options');

    await link.click();
    await page.waitForTimeout(1000);
    await page.waitForFunction(
      () => !document.querySelector('tg-watch-project-button .watch-options')?.classList.contains('hidden'),
      null,
      { timeout: 4000 }
    ).catch(() => {});
    await watchOptions.locator('a').last().click();
    await page.waitForTimeout(1000);

    const watchCounterOld = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    await link.click();
    await page.waitForTimeout(1000);

    await page.waitForFunction(
      () => !document.querySelector('tg-watch-project-button .watch-options')?.classList.contains('hidden'),
      null,
      { timeout: 4000 }
    ).catch(() => {});

    await watchOptions.locator('a').first().click();

    await page.waitForFunction(
      () => document.querySelector('tg-watch-project-button .watch-options')?.classList.contains('hidden'),
      null,
      { timeout: 4000 }
    ).catch(() => {});

    const watchActive = await common.hasClass(link, 'active');
    const watchCounter = parseInt(await link.locator('.track-button-counter').textContent() || '0', 10);

    expect(watchActive).toBe(true);
    expect(watchCounter).toBe(watchCounterOld + 1);
  });

  test('blocked project', async ({ page }) => {
    await page.goto('/project/project-6/');
    await common.waitLoader(page);
    expect(page.url()).toContain('blocked-project/project-6');
  });
});
