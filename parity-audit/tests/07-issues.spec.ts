import { expect, test } from '@playwright/test';
import { gotoAuthed, snap, PROJECT_SLUG } from './_helpers';

test.describe('Issues page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, `/project/${PROJECT_SLUG}/issues`);
    await page.waitForTimeout(2000);
    await snap(page, 'issues');
  });

  test('table columns include TYPE / SEVERITY / PRIORITY / ISSUE / STATUS / MODIFIED / ASSIGN TO', async ({ page }) => {
    // Angular column headers (uppercased via CSS): TYPE, SEVERITY, PRIORITY,
    // ISSUE, STATUS, MODIFIED, ASSIGN TO. React port columns: # SUBJECT
    // STATUS TYPE PRIORITY SEVERITY (no MODIFIED, no ASSIGN TO, different
    // ordering, ISSUE is "SUBJECT").
    const visibleText = await page.locator('body').evaluate((b) => (b as HTMLElement).innerText);
    for (const col of ['TYPE', 'SEVERITY', 'PRIORITY', 'ISSUE', 'STATUS', 'MODIFIED', 'ASSIGN TO']) {
      expect(visibleText).toContain(col);
    }
  });

  test('column headers have sort arrows / are sortable', async ({ page }) => {
    // Angular renders each .row.title header field with an inline <svg> sort
    // arrow (and click-to-sort handlers). React's table has plain
    // non-sortable <th>s.
    const sortIcons = await page
      .locator('.row.title svg, .issues-table .row.title svg, section.issues-table .row.title > div > svg')
      .count();
    expect(sortIcons).toBeGreaterThan(0);
  });

  test('TYPE / SEVERITY / PRIORITY are rendered as small colored DOTS, not text pills', async ({ page }) => {
    // Angular: .level (small SVG circles) for each issue's type/severity/priority.
    // React: full pill labels ("Low", "Medium", ...). The number of small
    // colored dot elements is a strong distinguishing feature.
    const dots = await page.locator('.level, .priority-dot, .severity-dot, .type-dot, .issue-row .colored-dot').count();
    expect(dots).toBeGreaterThan(5);
  });

  test('toolbar has Filters + reference search + Tags toggle + "+ NEW ISSUE"', async ({ page }) => {
    // Angular: button.btn-filter "Filters" + tg-input-search + #show-tags
    // toggle + a primary "+ NEW ISSUE" button. React replaces these with three
    // plain selects ("All statuses", "Sort: newest", "Search issues...").
    await expect(page.locator('button.btn-filter').first()).toBeVisible();
    await expect(page.locator('tg-input-search input').first()).toBeVisible();
    await expect(page.locator('#show-tags-input')).toHaveCount(1);
    const btn = page.locator('a, button').filter({ hasText: /^\s*new\s*issue\s*$/i }).first();
    await expect(btn).toBeVisible();
    const text = await btn.evaluate((el) => (el as HTMLElement).innerText.trim());
    expect(text).toBe('NEW ISSUE');
  });

  test('each row shows tag chips inline', async ({ page }) => {
    // Angular: <span class="tag">…</span> chips inside each row's .subject
    // next to the issue title. React: tags are dropped from the issues list
    // entirely.
    const tags = await page.locator('section.issues-table .row span.tag, .issue-text .tag').count();
    expect(tags).toBeGreaterThan(0);
  });

  test('each row exposes an assignee avatar control', async ({ page }) => {
    // Angular: each row's .assigned-field contains a .issue-assignedto
    // wrapper with a <figure class="avatar"> + <img>, plus a popover to
    // reassign. React: no assignee column, no avatar.
    const avatars = await page
      .locator('section.issues-table .assigned-field figure.avatar, .issue-assignedto figure.avatar, .issue-assignedto img')
      .count();
    expect(avatars).toBeGreaterThan(0);
  });
});
