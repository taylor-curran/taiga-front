import { test, expect } from '@playwright/test';
import { captureListingPng } from './helpers/screenshots';

async function loadFixtureSession(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('token', JSON.stringify('fixture-token'));
    localStorage.setItem('userInfo', JSON.stringify({ id: 1, username: 'admin' }));
  });
  await page.reload();
}

test.describe('listing pages (fixture db)', () => {
  test('home shows project cards and duty rows from db.json', async ({ page }) => {
    await loadFixtureSession(page);
    await expect(page.getByRole('link', { name: 'Alpha Project', exact: true })).toBeVisible();
    await expect(page.getByText('Fixture Task').first()).toBeVisible();
    await captureListingPng(page, 'home-dashboard');
  });

  test('projects listing shows both fixture projects', async ({ page }) => {
    await loadFixtureSession(page);
    await page.goto('/projects');
    await expect(page.getByText('Alpha Project')).toBeVisible();
    await expect(page.getByText('Beta Private')).toBeVisible();
    await captureListingPng(page, 'projects-listing');
  });

  test('admin memberships table columns', async ({ page }) => {
    await loadFixtureSession(page);
    await page.goto('/project/alpha/admin/memberships');
    await expect(page.getByText('Alice Example')).toBeVisible();
    await expect(page.getByText('pending@example.com')).toBeVisible();
    await captureListingPng(page, 'admin-memberships');
  });

  test('admin roles overview', async ({ page }) => {
    await loadFixtureSession(page);
    await page.goto('/project/alpha/admin/roles');
    await expect(page.locator('span.role-name').filter({ hasText: 'Developer' })).toBeVisible();
    await captureListingPng(page, 'admin-roles');
  });
});
