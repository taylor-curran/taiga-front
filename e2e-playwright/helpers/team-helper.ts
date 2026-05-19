import { Page, Locator } from '@playwright/test';

export function team(page: Page) {
  const el = page.locator('.team');
  return {
    el,
    firstRole: () => el.locator('section[tg-team-members] .avatar span').first(),
    firstMember: () => el.locator('section[tg-team-members] a.name').first(),
    count: () => el.locator('section[tg-team-members] .row.member').count(),
    leave: () => el.locator('.hero .username a').click(),
  };
}

export function filters(page: Page) {
  const el = page.locator('.team-filters-inner');
  return {
    el,
    filterByRole: async (roleName: string) => {
      const roles = el.locator('ul li a');
      const count = await roles.count();
      for (let i = 0; i < count; i++) {
        const text = await roles.nth(i).textContent();
        if (text && text.toLowerCase() === roleName.toLowerCase()) {
          await roles.nth(i).click();
          break;
        }
      }
    },
    clearText: () => el.locator('input[ng-model="filtersQ"]').fill(''),
    searchText: (text: string) => el.locator('input[ng-model="filtersQ"]').fill(text),
  };
}

export function leavingProjectWarningLb(page: Page) {
  return page.locator('div[tg-lightbox-leave-project-warning]');
}

export async function isLeaveProjectWarningOpen(page: Page) {
  return page.locator('div[tg-lightbox-leave-project-warning]').isVisible();
}
