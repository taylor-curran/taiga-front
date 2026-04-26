import { test, expect } from '@playwright/test';
import { settleAfterNav, seedAuthenticatedSession, isAngular } from './helpers';

test.beforeEach(async ({ page }, testInfo) => {
  if (isAngular(testInfo.project.name)) {
    await page.goto('/login');
    await settleAfterNav(page, 3500);
    await page.locator('input[name="username"]').first().fill('admin');
    await page.locator('input[name="password"]').first().fill('adminpass');
    await page.locator('form.login-form button[type="submit"]').first().click();
    await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });
    await settleAfterNav(page, 2000);
  } else {
    await seedAuthenticatedSession(page, 'react');
  }
});

function userSettingsFirstNav(page: import('@playwright/test').Page) {
  return page
    .locator('#usersettingsmenu-user-profile .title')
    .or(page.getByTestId('user-settings-nav-user-profile'));
}

function userSettingsMailNav(page: import('@playwright/test').Page) {
  return page
    .locator('#usersettingsmenu-mail-notifications .title')
    .or(page.getByTestId('user-settings-nav-mail-notifications'));
}

function userSettingsLiveNav(page: import('@playwright/test').Page) {
  return page
    .locator('#usersettingsmenu-live-notifications .title')
    .or(page.getByTestId('user-settings-nav-live-notifications'));
}

function userSettingsWebNav(page: import('@playwright/test').Page) {
  return page
    .locator('#usersettingsmenu-web-notifications .title')
    .or(page.getByTestId('user-settings-nav-web-notifications'));
}

function adminMenuProject(page: import('@playwright/test').Page) {
  return page
    .locator('#adminmenu-project-profile .title')
    .or(page.getByTestId('admin-nav-admin-project-profile-details'));
}

function adminMenuAttributes(page: import('@playwright/test').Page) {
  return page
    .locator('#adminmenu-project-values .title')
    .or(page.getByTestId('admin-nav-admin-project-values-status'));
}

function adminMenuIntegrations(page: import('@playwright/test').Page) {
  return page
    .locator('#adminmenu-third-parties .title')
    .or(page.getByTestId('admin-nav-admin-third-parties-webhooks'));
}

/* ——— User settings shell ——— */

test('user-settings: sidebar first entry title is User Settings', async ({ page }, testInfo) => {
  await page.goto('/user-settings/user-profile');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 1500);
  await expect(userSettingsFirstNav(page).first()).toHaveText('User Settings');
});

test('user-settings: mail notifications menu label Email notifications', async ({ page }, testInfo) => {
  await page.goto('/user-settings/user-profile');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 1500);
  await expect(userSettingsMailNav(page).first()).toHaveText('Email notifications');
});

test('user-settings: live notifications menu Desktop notifications', async ({ page }, testInfo) => {
  await page.goto('/user-settings/user-profile');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 1500);
  await expect(userSettingsLiveNav(page).first()).toHaveText('Desktop notifications');
});

test('user-settings: web notifications menu Events', async ({ page }, testInfo) => {
  await page.goto('/user-settings/user-profile');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 1500);
  await expect(userSettingsWebNav(page).first()).toHaveText('Events');
});

test('user-settings: profile page has avatar change UI', async ({ page }, testInfo) => {
  await page.goto('/user-settings/user-profile');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 2000);
  await expect(page.getByText(/Change photo/i).first()).toBeVisible();
});

test('user-settings: profile shows Username field label', async ({ page }, testInfo) => {
  await page.goto('/user-settings/user-profile');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 2000);
  await expect(page.getByText(/^Username$/).first()).toBeVisible();
});

/* ——— Project admin ——— */

test('project admin: first primary menu title is Project', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/details');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2000);
  await expect(adminMenuProject(page).first()).toHaveText('Project');
});

test('project admin: second menu title is Attributes', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/details');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2000);
  await expect(adminMenuAttributes(page).first()).toHaveText('Attributes');
});

test('project admin: integrations menu title Integrations', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/details');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2000);
  await expect(adminMenuIntegrations(page).first()).toHaveText('Integrations');
});

test('project admin details: shows project name field label', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/details');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Project name$/).first()).toBeVisible();
});

test('project admin details: shows Tags section label', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/details');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Tags$/).first()).toBeVisible();
});

test('project admin details: shows Description label', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/details');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Description$/).first()).toBeVisible();
});

test('project admin modules: shows Epics module title', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/modules');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Epics$/).first()).toBeVisible();
});

test('project admin modules: shows Scrum backlog description snippet', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/modules');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(
    page.getByText(/Manage your user stories to maintain an organized view/i).first(),
  ).toBeVisible();
});

test('project admin memberships: page title contains Manage members', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/memberships');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText('Manage members').first()).toBeVisible();
});

test('project admin memberships: new member button', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/memberships');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText('+ New member').first()).toBeVisible();
});

test('project admin roles: roles admin main section loads', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/roles');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.locator('section.main.admin-roles').first()).toBeVisible();
});

test('project admin webhooks: webhooks admin section loads', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/third-parties/webhooks');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.locator('section.main.admin-webhooks').first()).toBeVisible();
});

test('project admin GitHub: shows GitHub integration title', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/third-parties/github');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^GitHub$/).first()).toBeVisible();
});

test('project admin export: shows Export section title', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/export');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Export$/).first()).toBeVisible();
});

test('project admin reports: shows Reports title', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/reports');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Reports$/).first()).toBeVisible();
});

test('project admin default values: shows Default Values title', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-profile/default-values');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText('Default Values').first()).toBeVisible();
});

test('project admin values status: shows Statuses column or heading', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-values/status');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Statuses$/).first()).toBeVisible();
});

test('project admin values points: shows Points heading', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-values/points');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Points$/).first()).toBeVisible();
});

test('project admin values tags: shows Tags admin title', async ({ page }, testInfo) => {
  await page.goto('/project/scrum/admin/project-values/tags');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 5000 : 2500);
  await expect(page.getByText(/^Tags$/).first()).toBeVisible();
});

/* ——— Home ——— */

test('home: Angular dashboard shows Projects Dashboard', async ({ page }, testInfo) => {
  test.skip(!isAngular(testInfo.project.name), 'Full dashboard exists only in Angular reference');
  await page.goto('/');
  await settleAfterNav(page, 4000);
  await expect(page.getByText('Projects Dashboard').first()).toBeVisible();
});

test('home: React root redirects to project admin (not full dashboard)', async ({ page }, testInfo) => {
  test.skip(isAngular(testInfo.project.name));
  await page.goto('/');
  await settleAfterNav(page, 2000);
  await expect(page).toHaveURL(/\/project\/scrum\/admin\/project-profile\/details/);
});
