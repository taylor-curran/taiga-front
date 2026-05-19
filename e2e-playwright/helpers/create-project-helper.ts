import { Page } from '@playwright/test';
import * as common from '../utils/common';
import * as lightbox from '../utils/lightbox';

export function openCreateProjectPage(page: Page) {
  return page.locator('.create-project-btn').nth(1).click();
}

export function newProjectScreen(page: Page) {
  return {
    selectDuplicateOption: () => common.link(page, page.locator('.e2e-duplicate-project')),
    selectScrumOption: () => common.link(page, page.locator('.e2e-create-project-scrum')),
    selectKanbanOption: () => common.link(page, page.locator('.e2e-create-project-kanban')),
    selectProjectToDuplicate: () => page.locator('.e2e-duplicate-project-reference option').nth(1).click(),
    fillNameAndDescription: async (name: string, title: string) => {
      await page.locator('.e2e-create-project-title').fill(name);
      await page.locator('.e2e-create-project-description').fill(title);
    },
    createProject: () => page.locator('.e2e-create-project-action-submit').click(),
  };
}

export async function deleteProject(page: Page) {
  await page.locator('.delete-project').click();
  const lb = page.locator('div[tg-lb-delete-project]');
  await lightbox.open(page, lb);
  await lb.locator('.button-green').click();
}
