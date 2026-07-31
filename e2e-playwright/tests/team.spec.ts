import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';
import * as teamHelper from '../helpers/team-helper';
import * as nav from '../utils/nav';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('leaving project', () => {
  test('leave project', async ({ page }) => {
    await page.goto('/project/project-3/team');
    await common.waitLoader(page);
    await teamHelper.team(page).leave();
    await lightbox.confirm.ok(page);
  });
});

test.describe('leaving project owner', () => {
  test('leave project', async ({ page }) => {
    await common.createProject(page);
    await nav.init().team().go(page);

    await teamHelper.team(page).leave();
    const isWarningOpen = await teamHelper.isLeaveProjectWarningOpen(page);
    expect(isWarningOpen).toBe(true);

    const lb = teamHelper.leavingProjectWarningLb(page);
    await lightbox.open(page, lb);
    await lightbox.exit(page, lb);

    const isPresent = await lb.isVisible();
    expect(isPresent).toBe(false);
  });
});

test.describe('team', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/project/project-5/team');
    await common.waitLoader(page);
  });

  test('team filled', async ({ page }) => {
    const total = await teamHelper.team(page).count();
    expect(total).toBe(9);
  });

  test('search username', async ({ page }) => {
    const firstMemberName = await teamHelper.team(page).firstMember().textContent();
    await teamHelper.filters(page).searchText(firstMemberName || '');
    await page.waitForTimeout(500);
    const total = await teamHelper.team(page).count();
    expect(total).toBe(1);
  });

  test('filter role', async ({ page }) => {
    const total = await teamHelper.team(page).count();
    const firstRole = teamHelper.team(page).firstRole();
    const roleName = await firstRole.textContent();
    await teamHelper.filters(page).clearText();
    await teamHelper.filters(page).filterByRole(roleName || '');
    await page.waitForTimeout(500);
    const newTotal = await teamHelper.team(page).count();
    expect(newTotal).toBeLessThan(total);
    expect(newTotal).toBeGreaterThanOrEqual(1);
  });
});
