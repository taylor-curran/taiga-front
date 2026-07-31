import { test, expect, Page } from '@playwright/test';

export function wysiwygTesting(parentSelector: string) {
  test('wysiwyg - bold and check markdown', async ({ page }) => {
    const parent = page.locator(parentSelector);
    const editor = parent.locator('.medium');
    const editorWrapper = parent.locator('tg-wysiwyg');

    // Click to enable edit mode
    await editor.click({ timeout: 10000 });
    await page.waitForTimeout(2000);

    // Type text
    await editor.pressSequentially('test');

    // Select all text
    await page.evaluate((sel) => {
      const elm = document.querySelector(sel + ' .medium');
      if (elm && elm.firstChild && elm.firstChild.firstChild) {
        const range = document.createRange();
        range.setStart(elm.firstChild.firstChild, 0);
        range.setEnd(elm.firstChild.firstChild, (elm.firstChild as HTMLElement).innerText.length);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }, parentSelector);

    // Click bold
    await page.locator('.medium-editor-toolbar-active .medium-editor-action-bold').click();

    // Switch to markdown mode
    await editorWrapper.locator('.e2e-markdown-mode').click().catch(() => {});
    await page.waitForTimeout(500);

    // Save
    await editorWrapper.locator('.e2e-save-editor').click();
    await page.waitForTimeout(1000);
  });
}
