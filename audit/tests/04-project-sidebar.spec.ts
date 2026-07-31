/**
 * PROJECT SIDEBAR DIFFERENCES
 *
 * AngularJS (:9000)                   React (:5173)
 * ┌─────────────────────┐             ┌─────────────────────┐
 * │ 🖼 Project Example 4│             │ P  Project Example 4│
 * │                     │             │                     │
 * │ 🎯 Epics            │             │  Timeline           │
 * │ 📋 Scrum ▼          │             │  Epics              │
 * │ 📌 Kanban           │             │  Backlog            │
 * │ 🐛 Issues           │             │  Kanban             │
 * │ ─────────────        │             │  Issues             │
 * │ 🔍 Search            │             │  Wiki               │
 * │ 📖 Wiki              │             │  Team               │
 * │ 👥 Team              │             │  Search             │
 * │ ⚙ Settings          │             │                     │
 * │ ─────────────        │             │  Admin              │
 * │ [collapse menu]     │             └─────────────────────┘
 * └─────────────────────┘             (text-only, no icons,
 *  (SVG icons, collapsible,            "Admin" instead of
 *   "Scrum" dropdown,                  "Settings", no collapse,
 *   "Settings" label)                  no Scrum dropdown)
 */
import { test, expect } from '@playwright/test';
import {
  ANGULAR_BASE, REACT_BASE,
  PROJECT_SLUG, loginAngular, loginReact,
} from './helpers';

test.describe('Project Sidebar Differences', () => {
  test('Angular sidebar has SVG icons for each nav item; React has text-only links', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('tg-project-navigation');

    // Angular nav items have SVG icons inside them
    const angularNavSvgs = page.locator('tg-project-navigation svg');
    const svgCount = await angularNavSvgs.count();
    expect(svgCount).toBeGreaterThan(5);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('nav');

    // React sidebar has no SVG icons in the nav items
    const reactNavSvgs = page.locator('main > nav svg');
    const reactSvgCount = await reactNavSvgs.count();
    expect(reactSvgCount).toBe(0);
  });

  test('Angular shows "Settings" link; React shows "Admin" link', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('tg-project-navigation');

    await expect(page.locator('a[title="Settings"]')).toBeVisible();
    await expect(page.locator('tg-project-navigation a', { hasText: 'Admin' })).toHaveCount(0);

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('nav');

    await expect(page.locator('nav a', { hasText: 'Admin' })).toBeVisible();
    await expect(page.locator('nav a', { hasText: 'Settings' })).toHaveCount(0);
  });

  test('Angular sidebar has "Scrum" dropdown menu; React has flat "Backlog" link', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('tg-project-navigation');

    // Angular has a "Scrum" button (dropdown) instead of direct "Backlog" link
    await expect(page.locator('button[title="Scrum"]')).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('nav');

    // React has a direct "Backlog" link, no "Scrum" grouping
    await expect(page.locator('nav a', { hasText: 'Backlog' })).toBeVisible();
    await expect(page.locator('nav button', { hasText: 'Scrum' })).toHaveCount(0);
  });

  test('Angular sidebar has collapse button; React does not', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('tg-project-navigation');

    await expect(page.locator('button', { hasText: 'collapse menu' })).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('nav');

    await expect(page.locator('button', { hasText: /collapse/i })).toHaveCount(0);
  });

  test('Angular sidebar shows project logo image; React shows letter avatar', async ({ page }) => {
    await loginAngular(page);
    await page.goto(`${ANGULAR_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('tg-project-navigation');

    const projectLogo = page.locator('tg-project-navigation img[src*="project-logo"]');
    await expect(projectLogo).toBeVisible();

    await loginReact(page);
    await page.goto(`${REACT_BASE}/project/${PROJECT_SLUG}/backlog`);
    await page.waitForSelector('nav');

    // React sidebar doesn't have a project logo image
    const reactLogo = page.locator('main > nav img[src*="project-logo"]');
    await expect(reactLogo).toHaveCount(0);
  });
});
