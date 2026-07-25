import { expect, test, Page } from '@playwright/test';
import { gotoAuthed, snap, PROJECT_SLUG } from './_helpers';

// AngularJS renders the per-project sidebar (`tg-project-menu`) inside an
// Angular 10 component embedded under `<tg-legacy-loader>` shadow root. We
// pierce shadow DOM for Angular and use plain DOM for React.

async function sidebarText(page: Page) {
  return page.evaluate(() => {
    const host = document.querySelector('tg-legacy-loader, aside, nav.menu-secondary');
    // Try shadow DOM first (Angular).
    const shadowHost = document.querySelector('tg-legacy-loader') as HTMLElement | null;
    if (shadowHost && shadowHost.shadowRoot) {
      return (shadowHost.shadowRoot.querySelector('tg-project-navigation, .nav-wrapper, ul.main-menu') as HTMLElement | null)?.innerText || '';
    }
    // React: the sidebar is just a plain <aside>.
    const aside = document.querySelector('aside') as HTMLElement | null;
    return aside?.innerText || (host as HTMLElement | null)?.innerText || '';
  });
}

test.describe('Project sidebar', () => {
  test.beforeEach(async ({ page }) => {
    await gotoAuthed(page, `/project/${PROJECT_SLUG}/backlog`);
    // The Angular sidebar mounts via tg-legacy-loader after a delay.
    await page.waitForTimeout(2500);
    await snap(page, 'sidebar-on-backlog');
  });

  test('shows a "Scrum" group containing Backlog + sprint links (collapsible)', async ({ page }) => {
    // Angular: <li class="menu-option scrum">Scrum</li> with a child <ul.child-menu>
    // containing "Backlog" + each sprint name. React: shows "Backlog" as a flat
    // top-level link with no Scrum group.
    const text = await sidebarText(page);
    expect(text).toMatch(/scrum/i);
    expect(text).toMatch(/backlog/i);
    expect(text).toMatch(/sprint/i);
    // The Scrum entry must be a *parent* of Backlog, not a sibling.
    expect(text.indexOf('Scrum')).toBeLessThan(text.indexOf('Backlog'));
  });

  test('exposes a "Settings" link (admin gate), not labelled "Admin"', async ({ page }) => {
    // Angular: "Settings". React renamed it "Admin".
    const text = await sidebarText(page);
    expect(text).toMatch(/\bsettings\b/i);
    expect(text).not.toMatch(/^\s*admin\s*$/im);
  });

  test('exposes a "collapse menu" toggle at the bottom', async ({ page }) => {
    // Angular: <button class="collapse"><span>collapse menu</span></button>.
    // React: no collapse mechanism.
    const text = await sidebarText(page);
    expect(text).toMatch(/collapse menu/i);
  });

  test('does NOT include a top-level "Timeline" link', async ({ page }) => {
    // Angular's per-project sidebar has no "Timeline" link — Timeline is the
    // landing route under tg-project-menu's project-link header. The React
    // port introduces a separate "Timeline" item in the rail.
    const text = await sidebarText(page);
    // Match a standalone "Timeline" word as a sidebar item.
    const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);
    const hasStandaloneTimeline = lines.some((l) => /^timeline$/i.test(l));
    expect(hasStandaloneTimeline).toBeFalsy();
  });

  test('top-of-sidebar project link uses the project logo image, not initials', async ({ page }) => {
    // Angular renders <a.project-link><img/><span.project-name>...</span>.
    // React renders only a text NavLink with the project name (no <img>).
    const hasImg = await page.evaluate(() => {
      const sh = document.querySelector('tg-legacy-loader')?.shadowRoot;
      if (sh) return !!sh.querySelector('a.project-link img, .project-link img, h1 a img');
      const aside = document.querySelector('aside');
      return !!aside?.querySelector('a img');
    });
    expect(hasImg).toBeTruthy();
  });
});
