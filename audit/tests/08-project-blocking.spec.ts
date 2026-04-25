/**
 * PROJECT BLOCKING BEHAVIOR DIFFERENCE
 *
 * When a project has blocked_code="blocked-by-staff" in the API:
 *
 * AngularJS (:9000)                     React (:5173)
 * ┌────────────────────────┐            ┌────────────────────────┐
 * │  🖼 Project Example 7  │            │  Backlog               │
 * │                        │            │                        │
 * │  ⚠ Blocked project    │            │  ▼ Sprint 2026-3-1     │
 * │  In order to unblock   │            │  #1 Fixing templates   │
 * │  your projects,        │            │  #4 Added file copy    │
 * │  contact the           │            │  ...                   │
 * │  administrator.        │            │                        │
 * │                        │            │  (shows full content   │
 * │  🌲🌲🌲🌲🌲 (forest)    │            │   ignoring blocked     │
 * └────────────────────────┘            │   status)              │
 *  (respects blocked_code,              └────────────────────────┘
 *   prevents access)
 */
import { test, expect } from '@playwright/test';
import { ANGULAR_BASE, REACT_BASE, loginAngular, loginReact } from './helpers';

const BLOCKED_PROJECT = 'project-7'; // blocked_code = "blocked-by-staff"

test.describe('Project Blocking Behavior', () => {
  test('Angular shows "Blocked project" page for blocked project; React shows content normally', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${BLOCKED_PROJECT}/backlog`);

    // Angular shows the blocked project message
    await expect(page.locator('h1', { hasText: 'Blocked project' })).toBeVisible();
    await expect(page.locator('text=In order to unblock your projects, contact the administrator.')).toBeVisible();
    await page.screenshot({ path: 'screenshots/angular-blocked-project.png', fullPage: true });

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${BLOCKED_PROJECT}/backlog`);
    await page.waitForSelector('h1:has-text("Backlog")');

    // React ignores the blocked status and shows the backlog content
    await expect(page.locator('h1', { hasText: 'Backlog' })).toBeVisible();
    await expect(page.locator('h1', { hasText: 'Blocked project' })).toHaveCount(0);
    // The sprint content is visible
    await expect(page.locator('text=Sprint 2026-3-1')).toBeVisible();
    await page.screenshot({ path: 'screenshots/react-blocked-project-bypass.png', fullPage: true });
  });

  test('Verify API confirms project-7 is blocked by staff', async ({ request }) => {
    // First get auth token
    const authResponse = await request.post(`${ANGULAR_BASE}/api/v1/auth`, {
      data: { type: 'normal', username: 'admin', password: 'adminpass' },
    });
    const authData = await authResponse.json();
    const token = authData.auth_token;

    // Check project-7 blocked status
    const projectResponse = await request.get(
      `${ANGULAR_BASE}/api/v1/projects/by_slug?slug=${BLOCKED_PROJECT}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const project = await projectResponse.json();
    expect(project.blocked_code).toBe('blocked-by-staff');
  });
});
