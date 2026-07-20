import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Page } from '@playwright/test';
import sharp from 'sharp';

const MIN_LUMA = 0.01;

/**
 * Reject all-empty or all-white canvas screenshots (treats as invalid capture).
 */
export async function assertMeaningfulImage(filePath: string, minUniqueRatio = 0.0002): Promise<void> {
  const buf = await readFile(filePath);
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  if (info.width < 2 || info.height < 2) {
    throw new Error(`Image too small: ${info.width}x${info.height}`);
  }
  const channels = info.channels;
  if (channels !== 3 && channels !== 4) {
    throw new Error(`Unexpected channels: ${channels}`);
  }
  let sumLuma = 0;
  const pixelCount = info.width * info.height;
  const unique = new Set<string>();
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const l = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    sumLuma += l;
    unique.add(`${r},${g},${b}`);
  }
  const meanLuma = sumLuma / pixelCount;
  if (meanLuma < MIN_LUMA) {
    throw new Error('Screenshot is effectively blank (mean luminance too low).');
  }
  if (unique.size / pixelCount < minUniqueRatio) {
    throw new Error('Screenshot has almost no color variation (suspect blank page).');
  }
}

/**
 * Produces a wide composite PNG: reference | port | per-pixel diff.
 */
export async function compareScreenshotsPng(
  pathA: string,
  pathB: string,
  outDir: string,
): Promise<{ compositePath: string; mismatchRatio: number }> {
  await assertMeaningfulImage(pathA);
  await assertMeaningfulImage(pathB);

  const aMeta = await sharp(pathA).metadata();
  const aRaw = await sharp(pathA)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const bRaw = await sharp(pathB)
    .resize(aMeta.width, aMeta.height, { fit: 'fill' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const w = aRaw.info.width;
  const h = aRaw.info.height;
  const ch = aRaw.info.channels;
  const bufA = aRaw.data;
  const bufB = bRaw.data;
  const pixels = w * h;
  const diffRgba = Buffer.alloc(pixels * 4, 0);
  let diffCount = 0;
  for (let p = 0; p < pixels; p += 1) {
    const i = p * ch;
    const ra = bufA[i] ?? 0;
    const ga = bufA[i + 1] ?? 0;
    const ba = bufA[i + 2] ?? 0;
    const rb = bufB[i] ?? 0;
    const gb = bufB[i + 1] ?? 0;
    const bb = bufB[i + 2] ?? 0;
    if (ra !== rb || ga !== gb || ba !== bb) {
      diffCount += 1;
      const o = p * 4;
      diffRgba[o] = 255;
      diffRgba[o + 1] = 0;
      diffRgba[o + 2] = 128;
      diffRgba[o + 3] = 200;
    }
  }
  const mismatchRatio = diffCount / pixels;
  const diffPng = await sharp(diffRgba, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toBuffer();

  const leftPng = await readFile(pathA);
  const rightPng = await readFile(pathB);
  const leftMeta = await sharp(leftPng).metadata();
  const rightMeta = await sharp(rightPng).metadata();
  const leftW = leftMeta.width ?? w;
  const rightW = rightMeta.width ?? w;
  const totalW = leftW + rightW + w;
  const maxH = Math.max(leftMeta.height ?? 0, rightMeta.height ?? 0, h, h);
  const composite = await sharp({
    create: {
      width: totalW,
      height: maxH,
      channels: 4,
      background: { r: 240, g: 242, b: 245, alpha: 1 },
    },
  })
    .composite([
      { input: leftPng, left: 0, top: 0 },
      { input: rightPng, left: leftW, top: 0 },
      { input: diffPng, left: leftW + rightW, top: 0 },
    ])
    .png()
    .toBuffer();

  await mkdir(outDir, { recursive: true });
  const name = `compare-${createHash('sha1').update(composite).digest('hex').slice(0, 8)}.png`;
  const compositePath = path.join(outDir, name);
  await writeFile(compositePath, composite);
  return { compositePath, mismatchRatio };
}

/** Stable, framework-agnostic hook for a fully rendered placeholder (no data fetch in foundation). */
export function placeholderReadySelector() {
  return '[data-testid="port-pending-banner"]';
}

export async function waitForAdminPlaceholder(page: Page) {
  await page.locator(placeholderReadySelector()).waitFor({ state: 'visible', timeout: 15_000 });
}
