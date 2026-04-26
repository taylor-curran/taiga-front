import { expect, test } from '@playwright/test';
import { loginReact, seedAngularSession } from './helpers';

const slug = process.env.AUDIT_PROJECT_SLUG ?? 'project-1';

test('project backlog renders scrum backlog shell', async ({ page, baseURL }, testInfo) => {
  if (testInfo.project.name === 'angular-baseline') {
    await seedAngularSession(page, baseURL!);
  } else {
    await loginReact(page, baseURL!);
  }
  await page.goto(`${baseURL}/project/${slug}/backlog`);
  const shot =
    testInfo.project.name === 'angular-baseline'
      ? 'screenshots/backlog-angular.png'
      : 'screenshots/backlog-react.png';
  await page.screenshot({ path: shot, fullPage: true });
  await expect(page.locator('section.backlog')).toBeVisible();
  await expect(page.locator('.tg-placeholder')).toHaveCount(0);
});
