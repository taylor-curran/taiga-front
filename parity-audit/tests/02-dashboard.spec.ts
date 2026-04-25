import { expect, test } from '@playwright/test';
import { gotoAuthed, snap } from './_helpers';

// Asserts the AngularJS home / dashboard layout. The React port (Home.tsx)
// renders a different "Working on" tile + "Activity" timeline; many of these
// assertions are expected to fail on react.

test.describe('Home / Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, '/');
    await snap(page, 'home');
  });

  test('page heading reads "Projects Dashboard"', async ({ page }) => {
    // Angular: home-wrapper › div.duty-summary › h1 "Projects Dashboard"
    // (A specific page-level title above the Working on/Watching sections.)
    // The React port renders a "Working on" tile + Activity feed instead, with
    // no top-level "Projects Dashboard" heading anywhere on the page.
    await expect(
      page.locator('h1').filter({ hasText: /projects dashboard/i }).first()
    ).toBeVisible();
  });

  test('renders both a "Working on" and a "Watching" section', async ({ page }) => {
    // Angular splits the dashboard into two sibling sections:
    //   tg-working-on / .working-on-title  ("Working on")
    //   tg-watching   / .watching-title    ("Watching")
    // The React port only renders "Working on" + a single Activity timeline.
    const body = page.locator('body');
    await expect(body).toContainText(/working on/i);
    await expect(body).toContainText(/^|\s*watching\s*$|>watching</i);
    // Stricter: there must be a heading whose normalized text equals "Watching".
    const watching = page
      .locator('h1, h2, h3, .title-bar')
      .filter({ hasText: /^\s*watching\s*$/i });
    await expect(watching.first()).toBeVisible();
  });

  test('Working on rows show project name + ticket type + status + ref', async ({ page }) => {
    // Angular renders each ticket as <a class="list-itemtype-ticket"> with
    //   .ticket-project / .ticket-type / .ticket-status / .ticket-id
    // The React port renders a flat "<actor> <verb> <project>" Activity feed
    // and never shows a ticket type / status / ref on the dashboard at all.
    const tickets = page.locator('a.list-itemtype-ticket, .list-itemtype-ticket');
    await expect(tickets.first()).toBeVisible();
    // The first row must expose the four data spans.
    const first = tickets.first();
    await expect(first.locator('.ticket-project')).toBeVisible();
    await expect(first.locator('.ticket-type')).toBeVisible();
    await expect(first.locator('.ticket-status')).toBeVisible();
    await expect(first.locator('.ticket-id')).toBeVisible();
  });

  test('top navbar exposes a Projects dropdown (not a flat tab list)', async ({ page }) => {
    // Angular: <nav class="navbar"> with a Projects dropdown that lists recent
    // projects + a "View all projects" link.
    // React: <header> with text NavLinks "Home / Discover / My Projects" and
    // no Projects dropdown.
    await expect(page.locator('nav.navbar')).toBeVisible();
    await expect(page.locator('.dropdown-project-list-projects')).toBeVisible();
    await expect(
      page.locator('a.see-more-projects-btn').first()
    ).toContainText(/view all projects/i);
  });

  test('document title is "Home - Taiga"', async ({ page }) => {
    await expect(page).toHaveTitle(/home\s*-\s*taiga/i);
  });
});
