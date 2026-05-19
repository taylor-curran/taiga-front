import { Page } from '@playwright/test';
import { hasClass } from './common';

const TRANSITION = 600;

export const success = {
  open: async (page: Page): Promise<boolean> => {
    const el = page.locator('.notification-message-success');
    try {
      await page.waitForFunction(
        () => document.querySelector('.notification-message-success')?.classList.contains('active'),
        null,
        { timeout: 6000 }
      );
      await page.waitForTimeout(TRANSITION);
      return true;
    } catch {
      return false;
    }
  },
  close: async (page: Page): Promise<boolean> => {
    const el = page.locator('.notification-message-success');
    try {
      await page.waitForFunction(
        () => document.querySelector('.notification-message-success')?.classList.contains('inactive'),
        null,
        { timeout: 6000 }
      );
      await page.waitForTimeout(TRANSITION);
      return true;
    } catch {
      return false;
    }
  },
};

export const error = {
  open: async (page: Page): Promise<boolean> => {
    try {
      await page.waitForFunction(
        () => document.querySelector('.notification-message-error')?.classList.contains('active'),
        null,
        { timeout: 6000 }
      );
      await page.waitForTimeout(TRANSITION);
      return true;
    } catch {
      return false;
    }
  },
  close: async (page: Page): Promise<boolean> => {
    try {
      await page.waitForFunction(
        () => document.querySelector('.notification-message-error')?.classList.contains('inactive'),
        null,
        { timeout: 6000 }
      );
      await page.waitForTimeout(TRANSITION);
      return true;
    } catch {
      return false;
    }
  },
};

export const errorLight = {
  open: async (page: Page): Promise<boolean> => {
    try {
      await page.waitForFunction(
        () => document.querySelector('.notification-message-light-error')?.classList.contains('active'),
        null,
        { timeout: 6000 }
      );
      await page.waitForTimeout(TRANSITION);
      return true;
    } catch {
      return false;
    }
  },
  close: async (page: Page): Promise<boolean> => {
    try {
      await page.waitForFunction(
        () => document.querySelector('.notification-message-light-error')?.classList.contains('inactive'),
        null,
        { timeout: 6000 }
      );
      await page.waitForTimeout(TRANSITION);
      return true;
    } catch {
      return false;
    }
  },
};
