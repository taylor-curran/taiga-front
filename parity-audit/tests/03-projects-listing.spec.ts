import { expect, test } from '@playwright/test';
import { gotoAuthed, snap } from './_helpers';

// /projects/ — "My projects" page.

test.describe('My projects listing', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, '/projects/');
    await snap(page, 'projects');
  });

  test('header has a "NEW PROJECT" call-to-action button (uppercase)', async ({ page }) => {
    // Angular renders <a class="create-project-btn btn-small">NEW PROJECT</a>
    // in the page header (uppercased via CSS). The React port renders
    // <button>+ New project</button> in mixed case. (We exclude the navbar
    // "+ New project" link which exists on both sides.)
    const cta = page
      .locator('a.create-project-btn.btn-small, a.btn-small.create-project-btn, header a:has-text("New project"), header button:has-text("New project")')
      .first();
    await expect(cta).toBeVisible();
    const text = await cta.evaluate((el) => (el as HTMLElement).innerText.trim());
    expect(text).toBe('NEW PROJECT');
  });

  test('shows the "Reorder your projects to set at the top..." help copy', async ({ page }) => {
    // Angular ships an aside on /projects with reordering instructions.
    // The React port omits any reorder helper text.
    await expect(page.locator('body')).toContainText(
      /reorder your projects to set/i
    );
  });

  test('lists the seeded projects in user-defined order (newest first by default)', async ({ page }) => {
    // The seeded data creates "Project Example 1" .. "Project Example 7".
    // Angular's tg-projects-list orders by the user's saved project_index_order
    // (newest assigned slot first → 7, 6, 5, 3, 2, 1). The React port renders
    // a stable ascending sort (1, 2, 3, 5, 6, 7).
    const items = page.locator('a, h2, h3').filter({ hasText: /^Project Example \d$/ });
    const names = await items.allTextContents();
    const cleaned = names.map((n) => n.trim()).filter((n) => /^Project Example \d$/.test(n));
    // Take the *first occurrence* of each project name (the page may render
    // the same name in multiple decorations).
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const n of cleaned) if (!seen.has(n)) { seen.add(n); ordered.push(n); }
    expect(ordered.length).toBeGreaterThanOrEqual(6);
    expect(ordered[0]).toBe('Project Example 7');
    expect(ordered[1]).toBe('Project Example 6');
  });

  test('does NOT render an in-page "Filter projects" search input', async ({ page }) => {
    // The AngularJS projects listing has no client-side filter input. The
    // React port adds <input placeholder="Filter projects…">. This test passes
    // on Angular and is expected to fail on React.
    const filter = page.locator(
      'input[placeholder*="Filter projects" i], input[placeholder*="Search projects" i]'
    );
    await expect(filter).toHaveCount(0);
  });
});
