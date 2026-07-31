import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as nav from '../utils/nav';
import * as sharedDetail from '../shared/detail';
import { wysiwygTesting } from '../shared/wysiwyg';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('Task detail', () => {
  let taskUrl = '';

  test.beforeEach(async ({ page }) => {
    await nav.init().project('Project Example 0').backlog().taskboard(0).task(0).go(page);
    taskUrl = page.url();
  });

  test('title edition', async ({ page }) => {
    await sharedDetail.titleTesting(page);
  });

  test('tags edition', async ({ page }) => {
    await sharedDetail.tagsTesting(page);
  });

  test.describe('description', () => {
    wysiwygTesting('.duty-content');
  });

  test('history', async ({ page }) => {
    await sharedDetail.historyTesting(page, 'tasks');
  });

  test('block', async ({ page }) => {
    await sharedDetail.blockTesting(page);
  });

  test('attachments', async ({ page }) => {
    await sharedDetail.attachmentTesting(page);
  });

  test.describe('delete & redirect', () => {
    test('delete', async ({ page }) => {
      await sharedDetail.deleteTesting(page);
      const url = page.url();
      expect(url).not.toBe(taskUrl);
    });
  });
});
