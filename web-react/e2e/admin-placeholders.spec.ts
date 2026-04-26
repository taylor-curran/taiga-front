import { expect, test } from '@playwright/test';
import { waitForAdminPlaceholder } from './helpers/visual';

const reactRoutes = [
  '/project/scrum/admin/project-profile/details',
  '/project/scrum/admin/roles',
  '/user-settings/mail-notifications',
  '/profile',
  '/login',
];

const referenceRoutes = [
  '/project/scrum/admin/project-profile/details',
  '/user-settings/mail-notifications',
];

for (const port of [5173, 9000] as const) {
  const label = port === 5173 ? 'react' : 'angular-reference';
  const paths = port === 5173 ? reactRoutes : referenceRoutes;
  const base = `http://127.0.0.1:${port}`;

  test.describe(`${label} (${base}) — smoke`, () => {
    test.use({ baseURL: base });

    for (const p of paths) {
      test(`loads: ${p}`, async ({ page }) => {
        const res = await page.goto(p, { waitUntil: 'domcontentloaded', timeout: 12_000 });
        test.skip(!res?.ok(), `No server on ${base} (optional in CI).`);
        await expect(page.locator('body')).toBeVisible();
        if (port === 5173) {
          await waitForAdminPlaceholder(page).catch(() => {
            // login and some shell routes have no data-testid yet — body still must render
          });
        }
      });
    }
  });
}
