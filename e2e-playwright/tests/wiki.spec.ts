import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';
import * as wikiHelper from '../helpers/wiki-helper';
import * as sharedDetail from '../shared/detail';
import { wysiwygTesting } from '../shared/wysiwyg';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('wiki', () => {
  let currentWikiSlug = '';

  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-0/wiki/home');
    await common.waitLoader(page);
  });

  test('add link', async ({ page }) => {
    const linkText1 = 'Test link' + Date.now();
    await wikiHelper.links(page).addLink(linkText1);

    const timestamp = Date.now();
    currentWikiSlug = 'test-link' + timestamp;
    const linkText2 = 'Test link' + timestamp;
    await wikiHelper.links(page).addLink(linkText2);
  });

  test('follow last link', async ({ page }) => {
    const timestamp = Date.now();
    const linkText = 'Test link' + timestamp;
    await wikiHelper.links(page).addLink(linkText);

    const lastLink = wikiHelper.links(page).get().last();
    await lastLink.hover();
    await lastLink.click();
    await common.waitLoader(page);

    const url = page.url();
    expect(url).toContain('/wiki/');
  });

  test('remove link', async ({ page }) => {
    const linkText = 'remove-test-' + Date.now();
    const newLink = await wikiHelper.links(page).addLink(linkText);
    await wikiHelper.links(page).deleteLink(newLink);
  });

  test.describe('wiki editor', () => {
    wysiwygTesting('.wiki');
  });

  test('attachments', async ({ page }) => {
    await sharedDetail.attachmentTesting(page);
  });

  test('delete', async ({ page }) => {
    // Create a page first
    const linkText = 'del-test-' + Date.now();
    await wikiHelper.links(page).addLink(linkText);
    const lastLink = wikiHelper.links(page).get().last();
    await lastLink.hover();
    await lastLink.click();
    await common.waitLoader(page);

    await wikiHelper.editor(page).delete();
    expect(page.url()).toContain('/wiki/home');
  });
});
