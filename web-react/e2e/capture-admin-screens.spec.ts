import { test } from '@playwright/test';
import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertMeaningfulImage, compareScreenshotsPng } from './helpers/visual';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const artifactDir = path.join(__dirname, '..', 'e2e-artifacts');

const pairPath = '/project/scrum/admin/project-profile/details';

test.describe('Reference vs React screenshots (optional when both servers run)', () => {
  test('build composite diff for a shared admin path', async ({ browser }) => {
    await mkdir(artifactDir, { recursive: true });
    const refPng = path.join(artifactDir, 'ref.png');
    const reactPng = path.join(artifactDir, 'react.png');

    const ctxRef = await browser.newContext({ baseURL: 'http://127.0.0.1:9000' });
    const ctxReact = await browser.newContext({ baseURL: 'http://127.0.0.1:5173' });
    const pRef = await ctxRef.newPage();
    const pReact = await ctxReact.newPage();

    const [refRes, reactRes] = await Promise.all([
      pRef.goto(pairPath, { waitUntil: 'domcontentloaded', timeout: 10_000 }),
      pReact.goto(pairPath, { waitUntil: 'domcontentloaded', timeout: 10_000 }),
    ]);

    test.skip(
      !refRes?.ok() || !reactRes?.ok(),
      'Start Angular :9000 and Vite :5173 to generate comparison art.',
    );

    await pRef.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await pReact.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => undefined);
    await pRef.screenshot({ path: refPng, fullPage: true });
    await pReact.screenshot({ path: reactPng, fullPage: true });
    await ctxRef.close();
    await ctxReact.close();

    await assertMeaningfulImage(refPng);
    await assertMeaningfulImage(reactPng);
    const out = await compareScreenshotsPng(refPng, reactPng, path.join(artifactDir, 'compare'));
    await copyFile(out.compositePath, path.join(artifactDir, 'admin-side-by-side.png'));
  });
});
