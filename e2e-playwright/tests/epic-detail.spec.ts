import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as nav from '../utils/nav';
import * as epicDetailHelper from '../helpers/epic-detail-helper';
import * as sharedDetail from '../shared/detail';
import { wysiwygTesting } from '../shared/wysiwyg';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('Epic detail', () => {
  test.beforeEach(async ({ page }) => {
    await nav.init().project('Project Example 0').epics().epic(0).go(page);
  });

  test('color edition', async ({ page }) => {
    const colorEditorHelper = epicDetailHelper.colorEditor(page);
    await colorEditorHelper.open();
    await colorEditorHelper.selectFirstColor();
    await colorEditorHelper.open();
    await colorEditorHelper.selectLastColor();
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

  test.describe('related userstories', () => {
    test('create new user story', async ({ page }) => {
      const relatedUs = epicDetailHelper.relatedUserstories(page);
      await relatedUs.createNewUserStory('Testing subject');
    });

    test('create new user stories in bulk', async ({ page }) => {
      const relatedUs = epicDetailHelper.relatedUserstories(page);
      await relatedUs.createNewUserStories('Testing subject1\nTesting subject 2');
    });

    test('add related userstory', async ({ page }) => {
      const relatedUs = epicDetailHelper.relatedUserstories(page);
      await relatedUs.selectFirstRelatedUserstory();
    });

    test('delete related userstory', async ({ page }) => {
      const relatedUs = epicDetailHelper.relatedUserstories(page);
      await relatedUs.deleteFirstRelatedUserstory();
    });
  });

  test('history', async ({ page }) => {
    await sharedDetail.historyTesting(page, 'epics');
  });

  test('block', async ({ page }) => {
    await sharedDetail.blockTesting(page);
  });

  test('attachments', async ({ page }) => {
    await sharedDetail.attachmentTesting(page);
  });
});
