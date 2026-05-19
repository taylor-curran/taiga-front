import { Page, Locator } from '@playwright/test';
import * as lightbox from '../utils/lightbox';
import * as popover from '../utils/popover';
import * as common from '../utils/common';

export function getCreateEditUsLightbox(page: Page) {
  const el = page.locator('div[tg-lb-create-edit-userstory]');

  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
    roles: () => el.locator('.points-per-role li'),
    subject: () => el.locator('input[name="subject"]'),
    async tags() {
      await page.locator('.e2e-show-tag-input').click();
      await page.locator('.e2e-open-color-selector').click();
      await page.locator('.e2e-color-dropdown li').nth(1).click();
      const tagInput = page.locator('.e2e-add-tag-input');
      await tagInput.fill('xxxyy');
      await tagInput.press('Enter');
      await page.locator('.e2e-delete-tag').last().click();
      await tagInput.fill('a');
      await tagInput.press('ArrowDown');
      await tagInput.press('Enter');
    },
    description: () => el.locator('textarea[name="description"]'),
    status: (item: number) => el.locator(`select option:nth-child(${item})`),
    settings: (item: number) => el.locator('.settings label').nth(item),
    submit: () => el.locator('button[type="submit"]').click(),
    async setRole(roleItem: number, value: number) {
      const role = el.locator('.points-per-role li').nth(roleItem);
      await popover.open(page, role, value);
    },
    getRolePoints: () => el.locator('.ticket-role-points').last().locator('.points').textContent(),
  };
}

export function getBulkCreateLightbox(page: Page) {
  const el = page.locator('div[tg-lb-create-bulk-userstories]');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    textarea: () => el.locator('textarea'),
    submit: () => el.locator('button[type="submit"]').click(),
    waitClose: () => lightbox.close(page, el),
  };
}

export function getCreateEditMilestone(page: Page) {
  const el = page.locator('div[tg-lb-create-edit-sprint]');
  return {
    el,
    waitOpen: () => lightbox.open(page, el),
    waitClose: () => lightbox.close(page, el),
    name: () => el.locator('[ng-model="sprint.name"]'),
    submit: () => el.locator('button[type="submit"]').click(),
    delete: () => el.locator('.delete-sprint').click(),
  };
}

export function userStories(page: Page) {
  return page.locator('.backlog-table-body > div[ng-repeat]');
}

export function selectedUserStories(page: Page) {
  return page.locator('.backlog-table-body input[type="checkbox"]:checked');
}

export function sprints(page: Page) {
  return page.locator('div[tg-backlog-sprint="sprint"]');
}

export function sprintsOpen(page: Page) {
  return page.locator('div[tg-backlog-sprint="sprint"].sprint-open');
}

export function openBulk(page: Page) {
  return page.locator('.new-us a').nth(1).click();
}

export function openNewUs(page: Page) {
  return page.locator('.new-us a').nth(0).click();
}

export function velocityForecasting(page: Page) {
  return page.locator('.e2e-velocity-forecasting');
}

export async function openVelocityForecasting(page: Page) {
  await page.locator('.e2e-velocity-forecasting').click();
}

export async function createSprintFromForecasting(page: Page) {
  await page.locator('.e2e-velocity-forecasting-add').click();
  const sprintName = 'sprintName' + Date.now();
  const nameInput = page.locator('.e2e-sprint-name');
  await nameInput.fill(sprintName);
  await nameInput.press('Enter');
}

export function openUsBacklogEdit(page: Page, item: number) {
  return page.locator('.backlog-table-body .e2e-edit').nth(item).click();
}

export function openMilestoneEdit(page: Page, item: number) {
  return page.locator('div[tg-backlog-sprint="sprint"] .edit-sprint').nth(item).click();
}

export function openNewMilestone(page: Page) {
  return page.locator('.add-sprint').click();
}

export function getClosedSprintTable(page: Page) {
  return page.locator('.sprint-empty').last();
}

export function toggleClosedSprints(page: Page) {
  return page.locator('.filter-closed-sprints').click();
}

export async function toggleSprint(page: Page, el: Locator) {
  await el.locator('.compact-sprint').click();
  await page.waitForTimeout(400);
}

export function closedSprints(page: Page) {
  return page.locator('.sprint-closed');
}

export async function setUsStatus(page: Page, item: number, value: number) {
  const status = page.locator('.backlog-table-body > div .us-status').nth(item);
  await popover.open(page, status, value);
  return status.locator('span').first().textContent();
}

export async function setUsPoints(page: Page, item: number, value1: number, value2: number) {
  const points = page.locator('.backlog-table-body > div .us-points').nth(item).locator('span').nth(0);
  await popover.open(page, points, value1, value2);
}

export async function getUsPoints(page: Page, item: number) {
  return page.locator('.backlog-table-body > div .us-points').nth(item).locator('span').nth(0).textContent();
}

export function deleteUs(page: Page, item: number) {
  return page.locator('.backlog-table-body > div .e2e-delete').nth(item).click();
}

export function getUsRef(el: Locator) {
  return el.locator('span[tg-bo-ref]').textContent();
}

export async function loadFullBacklog(page: Page) {
  let count = 0;
  let newcount = 0;
  do {
    const uss = userStories(page);
    count = await uss.count();
    const last = uss.last();
    await last.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    newcount = await uss.count();
  } while (count < newcount);
}

export async function getTestingFilterRef(page: Page) {
  const uss = userStories(page);
  const count = await uss.count();
  let ref = '';
  for (let i = 0; i < count; i++) {
    const us = uss.nth(i);
    const newRef = await getUsRef(us);
    if (newRef && newRef.length > ref.length) {
      ref = newRef;
    }
  }
  return ref;
}

export function getSprintUserstories(sprint: Locator) {
  return sprint.locator('.milestone-us-item-row');
}

export function getSprintsRefs(sprint: Locator) {
  return sprint.locator('span[tg-bo-ref]').allTextContents();
}

export async function getSprintsTitles(page: Page) {
  return page.locator('div[tg-backlog-sprint="sprint"] .sprint-name span').allTextContents();
}

export function goBackFilters(page: Page) {
  return page.locator('.filters-step-cat .breadcrumb a').first().click();
}

export async function filterRole(page: Page, value: number) {
  const rolePointsSelector = page.locator('div[tg-us-role-points-selector]');
  await popover.open(page, rolePointsSelector, value);
}
