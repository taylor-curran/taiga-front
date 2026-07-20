import { expect, test } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { captureFullPage, compareScreenshots } from './helpers/screenshots';

const projectSlug = 'sample-scrum';
const adminPaths = [
  `/project/${projectSlug}/admin/project-profile/details`,
  `/project/${projectSlug}/admin/project-profile/default-values`,
  `/project/${projectSlug}/admin/memberships`,
];

test.describe.configure({ mode: 'serial' });

test('React admin placeholders render a stable shell', async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== 'react-chromium', 'React-only smoke');

  const page = await browser.newPage();
  const outDir = path.join(testInfo.project.outputDir, 'admin-smoke');
  await fs.mkdir(outDir, { recursive: true });

  for (const p of adminPaths) {
    await page.goto(p);
    const out = path.join(outDir, `react-${p.replaceAll(/[^\w]+/g, '_')}.png`);
    await captureFullPage(page, out, 'admin-shell-root');
    await expect(page.getByTestId('admin-placeholder-message')).toBeVisible();
  }

  await page.close();
});

test('Screenshot diff helper runs on synthetic pair', async ({ page }, testInfo) => {
  void page;
  const dir = path.join(testInfo.outputDir, 'pixel-smoke');
  await fs.mkdir(dir, { recursive: true });
  const w = 120;
  const h = 80;
  const sharp = (await import('sharp')).default;

  const ref = sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: 200, g: 40, b: 40 },
    },
  }).png();
  const subj = sharp({
    create: {
      width: w,
      height: h,
      channels: 3,
      background: { r: 40, g: 80, b: 200 },
    },
  }).png();

  const referencePath = path.join(dir, 'ref.png');
  const subjectPath = path.join(dir, 'subj.png');
  const diffPath = path.join(dir, 'diff.png');
  await ref.toFile(referencePath);
  await subj.toFile(subjectPath);

  const mismatched = await compareScreenshots({ referencePath, subjectPath, diffPath }, 0.05);
  expect(mismatched).toBeGreaterThan(0);
});
