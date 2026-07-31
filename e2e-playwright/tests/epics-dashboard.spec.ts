import { test, expect } from '@playwright/test';
import * as common from '../utils/common';
import * as nav from '../utils/nav';
import * as epicsDashboardHelper from '../helpers/epics-dashboard-helper';

test.use({ storageState: 'e2e-playwright/.auth/state.json' });

test.describe('Epics Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await nav.init().project('Project Example 0').epics().go(page);
  });

  test('display child stories', async ({ page }) => {
    const epicHelper = epicsDashboardHelper.epic(page);
    const childStoriesNum = await epicHelper.displayUserStoriesInEpic();
    expect(childStoriesNum).toBeGreaterThan(0);
  });

  test('create epic', async ({ page }) => {
    const epicHelper = epicsDashboardHelper.epic(page);
    const currentEpicsNum = await epicHelper.getEpics();
    const date = String(Date.now());
    const description = Math.random().toString(36).substring(7);
    await epicHelper.createEpic(date, description);
    const newEpicsNum = await epicHelper.getEpics();
    expect(newEpicsNum).toBeGreaterThan(currentEpicsNum);
  });

  test('change epic assigned from dashboard', async ({ page }) => {
    const epicHelper = epicsDashboardHelper.epic(page);
    await epicHelper.resetAssignedTo();
    const currentAssigned = await epicHelper.getAssignedTo();
    await epicHelper.editAssignedTo();
    const newAssigned = await epicHelper.getAssignedTo();
    expect(currentAssigned).not.toBe(newAssigned);
  });

  test('remove assigned from dashboard', async ({ page }) => {
    const epicHelper = epicsDashboardHelper.epic(page);
    await epicHelper.resetAssignedTo();
    const unAssigned = await epicHelper.removeAssignedTo();
    expect(unAssigned).toBe('Unassigned');
  });

  test('change status from dashboard', async ({ page }) => {
    const epicHelper = epicsDashboardHelper.epic(page);
    await epicHelper.resetStatus();
    const currentStatus = await epicHelper.getStatus();
    await epicHelper.editStatus();
    const newStatus = await epicHelper.getStatus();
    expect(currentStatus).not.toBe(newStatus);
  });

  test('remove columns from dashboard', async ({ page }) => {
    const epicHelper = epicsDashboardHelper.epic(page);
    const currentColumns = await epicHelper.getColumns();
    await epicHelper.removeColumns();
    const newColumns = await epicHelper.getColumns();
    expect(currentColumns).toBeGreaterThan(newColumns);
  });
});
