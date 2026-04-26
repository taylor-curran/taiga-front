import { expect, type Page } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import sharp from 'sharp';

export type ScreenshotPair = {
  referencePath: string;
  subjectPath: string;
  diffPath: string;
};

async function assertNonBlankPng(filePath: string): Promise<{ width: number; height: number }> {
  const buf = await fs.readFile(filePath);
  const png = PNG.sync.read(buf);
  const { width, height, data } = png;
  expect(width, `width for ${filePath}`).toBeGreaterThan(32);
  expect(height, `height for ${filePath}`).toBeGreaterThan(32);
  let nonWhite = 0;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    if (r < 250 || g < 250 || b < 250) nonWhite++;
  }
  expect(nonWhite, `non-white pixels in ${filePath}`).toBeGreaterThan(500);
  return { width, height };
}

export async function captureFullPage(
  page: Page,
  outPath: string,
  dataTestId: string,
): Promise<void> {
  const locator = page.getByTestId(dataTestId);
  await expect(locator).toBeVisible({ timeout: 30_000 });
  await locator.screenshot({ path: outPath, animations: 'disabled' });
  await assertNonBlankPng(outPath);
}

export async function compareScreenshots(pair: ScreenshotPair, threshold = 0.12): Promise<number> {
  const aMeta = await assertNonBlankPng(pair.referencePath);
  const bMeta = await assertNonBlankPng(pair.subjectPath);
  expect(aMeta.width).toBe(bMeta.width);
  expect(aMeta.height).toBe(bMeta.height);

  const aBuf = await fs.readFile(pair.referencePath);
  const bBuf = await fs.readFile(pair.subjectPath);
  const aPng = PNG.sync.read(aBuf);
  const bPng = PNG.sync.read(bBuf);
  const diff = new PNG({ width: aPng.width, height: aPng.height });

  const mismatched = pixelmatch(aPng.data, bPng.data, diff.data, aPng.width, aPng.height, {
    threshold,
  });
  await fs.mkdir(path.dirname(pair.diffPath), { recursive: true });
  await sharp(Buffer.from(PNG.sync.write(diff))).png().toFile(pair.diffPath);
  return mismatched;
}
