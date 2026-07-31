import { Page } from '@playwright/test';

export function epic(page: Page) {
  const el = page.locator('.e2e-epic');
  return {
    el,
    getEpics: () => el.count(),
    createEpic: async (date: string, description: string) => {
      await page.locator('.e2e-create-epic').click();
      await page.locator('.e2e-create-epic-subject').fill(date + description);
      await page.locator('.e2e-create-epic-status').click();
      await page.locator('.e2e-create-epic-status > option').nth(0).click();
      await page.locator('.e2e-create-epic-description').fill(date + description);
      await page.locator('.e2e-create-epic-client-requirement').click();
      await page.locator('.e2e-create-epic-team-requirement').click();
      await page.locator('.e2e-create-epic-blocked').click();
      await page.locator('.e2e-create-epic-blocked-note').fill(date + description);
      await page.locator('.e2e-create-epic-button').click();
      await page.waitForTimeout(1000);
    },
    displayUserStoriesInEpic: async () => {
      const storiesCount = await el.count();
      let epicChildren = 0;
      for (let i = 0; i < storiesCount; i++) {
        const story = el.nth(i);
        await story.click();
        epicChildren = await story.locator('.e2e-story').count();
        if (epicChildren > 0) break;
      }
      return epicChildren;
    },
    getAssignedTo: () => el.nth(0).locator('.e2e-assigned-to-image').getAttribute('title'),
    resetAssignedTo: async () => {
      await el.nth(0).locator('.e2e-assigned-to-image').click();
      await page.locator('.e2e-assigned-to-selector').nth(0).click();
      await page.waitForTimeout(1000);
    },
    editAssignedTo: async () => {
      await el.nth(0).locator('.e2e-assigned-to-image').click();
      await page.locator('.e2e-assigned-to-selector').last().click();
      await page.waitForTimeout(1000);
    },
    removeAssignedTo: async () => {
      await el.nth(0).locator('.e2e-assigned-to-image').click();
      await page.locator('.e2e-unassign').click();
      await page.waitForTimeout(1000);
      return el.nth(0).locator('.e2e-assigned-to-image').getAttribute('alt');
    },
    resetStatus: async () => {
      await el.nth(0).locator('.e2e-epic-status').click();
      await el.nth(0).locator('.e2e-edit-epic-status').nth(0).click();
      await page.waitForTimeout(1000);
    },
    getStatus: () => el.nth(0).locator('.e2e-epic-status').textContent(),
    editStatus: async () => {
      await el.nth(0).locator('.e2e-epic-status').click();
      await el.nth(0).locator('.e2e-edit-epic-status').last().click();
      await page.waitForTimeout(1000);
    },
    getColumns: () => page.locator('.e2e-epics-table-header > div').count(),
    removeColumns: async () => {
      await page.locator('.e2e-epics-column-button').click();
      await page.locator('.e2e-epics-column-dropdown .check').first().click();
      await page.waitForTimeout(1000);
    },
  };
}
