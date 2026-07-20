import { test } from '@playwright/test';

const slug = 'sample-scrum';
const paths = [
  `/project/${slug}/admin/project-profile/details`,
  `/project/${slug}/admin/project-profile/default-values`,
  `/project/${slug}/admin/project-profile/modules`,
  `/project/${slug}/admin/project-profile/export`,
  `/project/${slug}/admin/project-profile/reports`,
  `/project/${slug}/admin/project-values/status`,
  `/project/${slug}/admin/project-values/points`,
  `/project/${slug}/admin/project-values/priorities`,
  `/project/${slug}/admin/project-values/severities`,
  `/project/${slug}/admin/project-values/types`,
  `/project/${slug}/admin/project-values/custom-fields`,
  `/project/${slug}/admin/project-values/tags`,
  `/project/${slug}/admin/project-values/due-dates`,
  `/project/${slug}/admin/project-values/kanban-power-ups`,
  `/project/${slug}/admin/memberships`,
  `/project/${slug}/admin/roles`,
  `/project/${slug}/admin/third-parties/webhooks`,
  `/project/${slug}/admin/third-parties/github`,
  `/project/${slug}/admin/third-parties/gitlab`,
  `/project/${slug}/admin/third-parties/bitbucket`,
  `/project/${slug}/admin/third-parties/gogs`,
  `/project/${slug}/admin/contrib/demo-plugin`,
];

test.describe.configure({ mode: 'serial' });

test('record admin placeholder walkthrough', async ({ page, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'react-chromium', 'React port only');
  test.skip(process.env.RECORD_ADMIN_VIDEO !== '1', 'Set RECORD_ADMIN_VIDEO=1 to record');

  for (const p of paths) {
    await page.goto(`${baseURL}${p}`);
    await page.getByTestId('admin-shell-root').waitFor({ state: 'visible', timeout: 30_000 });
    await page.waitForTimeout(400);
  }
});
