import { expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export function assertPngBufferIntegrity(buf: Buffer): void {
  expect(buf.length).toBeGreaterThan(24);
  expect(buf.subarray(0, 8).equals(PNG_SIG)).toBe(true);
}

export async function captureListingPng(page: Page, name: string): Promise<string> {
  const dir = path.join(process.cwd(), 'test-results', 'screenshots');
  fs.mkdirSync(dir, { recursive: true });
  const out = path.join(dir, `${name}.png`);
  await page.screenshot({ path: out, fullPage: true });
  const buf = fs.readFileSync(out);
  assertPngBufferIntegrity(buf);
  return out;
}
