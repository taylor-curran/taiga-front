import { expect, test } from '@playwright/test';
import { gotoAuthed, snap, PROJECT_SLUG } from './_helpers';

// Asserts the AngularJS Scrum/Backlog page features. The React port replaces
// most of the rich feature set with a plain list + simple sprint cards.

test.describe('Backlog page', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, `/project/${PROJECT_SLUG}/backlog`);
    await page.waitForTimeout(2000);
    await snap(page, 'backlog');
  });

  test('page section heading reads "Scrum"', async ({ page }) => {
    // Angular: <h1><span>Scrum</span></h1> at the top of the .main.scrum
    // section. React: heading is "Backlog" (no "Scrum" wrapper).
    const heading = page.locator('main h1, header h1, h1').filter({ hasText: /^\s*scrum\s*$/i });
    await expect(heading.first()).toBeVisible();
  });

  test('renders the project burndown summary with 5 stat tiles', async ({ page }) => {
    // Angular: div.backlog-summary > div.summary > .summary-progress-bar +
    // 4 .summary-stats tiles (project points / defined points / closed points /
    // points per sprint). React: no burndown summary at all.
    await expect(page.locator('.backlog-summary').first()).toBeVisible();
    const stats = page.locator('.backlog-summary .summary-stats, .backlog-summary .summary-progress-bar');
    expect(await stats.count()).toBeGreaterThanOrEqual(4);
    // The completion percentage tile must show somewhere (rendered in
    // .data > span.number for the seeded data).
    await expect(page.locator('body')).toContainText(/%/);
  });

  test('renders a burndown chart (canvas)', async ({ page }) => {
    // Angular plots Flot-based burndown data on a <canvas>. React: no chart.
    const canvases = page.locator('.burndown canvas, .graphics-container canvas, canvas.flot-base');
    expect(await canvases.count()).toBeGreaterThan(0);
  });

  test('toolbar exposes a Filters button + reference search + Tags toggle', async ({ page }) => {
    // Angular: #show-filters-button .btn-filter, tg-input-search, #show-tags
    // React: only "+ New sprint" / "+ New stories" CTAs, no filters / search / tags.
    await expect(page.locator('#show-filters-button')).toBeVisible();
    await expect(page.locator('tg-input-search input').first()).toBeVisible();
    await expect(page.locator('#show-tags-input')).toHaveCount(1);
  });

  test('each user story row exposes status control + points + 3-dot menu + checkbox', async ({ page }) => {
    // Angular: each .row.us-item-row has .us-status anchor + .us-status-bind
    // span, .points button.us-points, .us-option-popup-button (3-dot), and a
    // checkbox input. React: only "color dot · #ref subject · points pill · ×".
    const rows = page.locator('.row.us-item-row');
    expect(await rows.count()).toBeGreaterThan(0);
    const first = rows.first();
    expect(await first.locator('a.us-status').count()).toBeGreaterThan(0);
    expect(await first.locator('span.us-status-bind').count()).toBeGreaterThan(0);
    expect(await first.locator('button.us-points').count()).toBeGreaterThan(0);
    expect(await first.locator('button.us-option-popup-button').count()).toBeGreaterThan(0);
    expect(await first.locator('input[type="checkbox"]').count()).toBeGreaterThan(0);
  });

  test('shows tag chips next to each user story subject', async ({ page }) => {
    // Angular: .user-stories.user-story-main-data > div.tag(.last) chips.
    // React renders tags only on Kanban, not in backlog list.
    const tags = page.locator('.row.us-item-row .tag');
    expect(await tags.count()).toBeGreaterThan(0);
  });

  test('right-rail sprint card has a "SPRINT TASKBOARD" CTA', async ({ page }) => {
    // Angular sidebar (right side): includes per-sprint card with a "Sprint
    // taskboard" CTA. React renders sprints inline as plain cards with no
    // "Sprint taskboard" button.
    const cta = page.locator('a, button').filter({ hasText: /sprint taskboard/i });
    await expect(cta.first()).toBeVisible();
  });
});
