import { Page } from '@playwright/test';
import * as common from './common';

type NavAction = (page: Page) => Promise<void>;

async function projectAction(page: Page, index: number | string) {
  await page.locator('div[tg-dropdown-project-list]').hover();

  let project;
  if (typeof index === 'string') {
    project = page.locator('div[tg-dropdown-project-list] li a').filter({ hasText: index });
  } else {
    project = page.locator('div[tg-dropdown-project-list] li a').nth(index);
  }

  await project.hover();
  const href = await project.getAttribute('href');
  if (href) {
    await page.goto(href);
  } else {
    await project.click();
  }
  await common.waitLoader(page);
}

async function issuesAction(page: Page) {
  await common.link(page, page.locator('#nav-issues a'));
  await common.waitLoader(page);
}

async function issueAction(page: Page, index: number) {
  const issue = page.locator('section.issues-table .row.table-main .subject a').nth(index);
  await common.link(page, issue);
  await common.waitLoader(page);
}

async function epicAction(page: Page, index: number) {
  const epic = page.locator('.e2e-epic-row .name a').nth(index);
  await common.link(page, epic);
  await common.waitLoader(page);
}

async function epicsAction(page: Page) {
  await common.link(page, page.locator('#nav-epics a'));
  await common.waitLoader(page);
}

async function backlogAction(page: Page) {
  await common.link(page, page.locator('#nav-backlog a').first());
  await common.waitLoader(page);
}

async function usAction(page: Page, index: number) {
  const us = page.locator('.user-story-name>a').nth(index);
  await common.link(page, us);
  await common.waitLoader(page);
}

async function homeAction(page: Page) {
  await page.goto('/');
  await common.waitLoader(page);
}

async function adminAction(page: Page) {
  await common.link(page, page.locator('#nav-admin a'));
  await common.waitLoader(page);
}

async function taskboardAction(page: Page, index: number) {
  const link = page.locator('.sprints .button-gray').nth(index);
  await common.link(page, link);
  await common.waitLoader(page);
}

async function taskAction(page: Page, index: number) {
  const task = page.locator('tg-card .card-title a').nth(index);
  await common.link(page, task);
  await common.waitLoader(page);
}

async function teamAction(page: Page) {
  await common.link(page, page.locator('#nav-team a'));
  await common.waitLoader(page);
}

interface NavBuilder {
  actions: NavAction[];
  project(index: number | string): NavBuilder;
  issues(): NavBuilder;
  issue(index: number): NavBuilder;
  epics(): NavBuilder;
  epic(index: number): NavBuilder;
  backlog(): NavBuilder;
  us(index: number): NavBuilder;
  home(): NavBuilder;
  admin(): NavBuilder;
  taskboard(index: number): NavBuilder;
  task(index: number): NavBuilder;
  team(): NavBuilder;
  go(page: Page): Promise<void>;
}

export function init(): NavBuilder {
  const builder: NavBuilder = {
    actions: [],
    project(index: number | string) {
      this.actions.push((page: Page) => projectAction(page, index));
      return this;
    },
    issues() {
      this.actions.push(issuesAction);
      return this;
    },
    issue(index: number) {
      this.actions.push((page: Page) => issueAction(page, index));
      return this;
    },
    epics() {
      this.actions.push(epicsAction);
      return this;
    },
    epic(index: number) {
      this.actions.push((page: Page) => epicAction(page, index));
      return this;
    },
    backlog() {
      this.actions.push(backlogAction);
      return this;
    },
    us(index: number) {
      this.actions.push((page: Page) => usAction(page, index));
      return this;
    },
    home() {
      this.actions.push(homeAction);
      return this;
    },
    admin() {
      this.actions.push(adminAction);
      return this;
    },
    taskboard(index: number) {
      this.actions.push((page: Page) => taskboardAction(page, index));
      return this;
    },
    task(index: number) {
      this.actions.push((page: Page) => taskAction(page, index));
      return this;
    },
    team() {
      this.actions.push(teamAction);
      return this;
    },
    async go(page: Page) {
      for (const action of this.actions) {
        await action(page);
      }
    },
  };
  return builder;
}
