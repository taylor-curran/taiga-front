import { Page, Locator, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

export async function waitLoader(page: Page) {
  await expect(page.locator('.loader')).not.toHaveClass(/active/, { timeout: 10000 });
}

export async function hasClass(locator: Locator, cls: string): Promise<boolean> {
  const classes = await locator.getAttribute('class');
  return classes ? classes.split(' ').includes(cls) : false;
}

export async function login(page: Page, username: string, password: string) {
  await page.goto('/login');
  await page.locator('input[name="username"]').fill(username);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await waitLoader(page);
  await closeJoyride(page);
}

export async function logout(page: Page) {
  const dropdown = page.locator('div[tg-dropdown-user]');
  await dropdown.hover();
  await page.waitForTimeout(300);
  await page.locator('.navbar-dropdown li a').last().click();
  await page.waitForURL(/\/discover/, { timeout: 10000 });
}

export async function closeCookies(page: Page) {
  await page.evaluate(() => { document.cookie = 'cookieConsent=1'; });
}

export async function closeJoyride(page: Page) {
  await page.waitForTimeout(1000);
  const skipButton = page.locator('.introjs-skipbutton');
  if (await skipButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await skipButton.click();
    await page.waitForTimeout(600);
  }
}

export async function link(page: Page, locator: Locator) {
  const oldUrl = page.url();
  await locator.hover();
  // Workaround for tg-nav calculation
  await page.mouse.move(-10, -10, { steps: 1 }).catch(() => {});
  await page.mouse.move(10, 10, { steps: 1 }).catch(() => {});
  await locator.hover();
  await locator.click();
  await page.waitForFunction(
    (old) => window.location.href !== old,
    oldUrl,
    { timeout: 5000 }
  );
}

export async function drag(page: Page, source: Locator, target: Locator, extraX = 0, extraY = 0) {
  const srcBox = await source.boundingBox();
  const tgtBox = await target.boundingBox();
  if (!srcBox || !tgtBox) throw new Error('Cannot get bounding boxes for drag');

  const srcX = srcBox.x + srcBox.width / 2;
  const srcY = srcBox.y + srcBox.height / 2;
  const tgtX = tgtBox.x + tgtBox.width / 2 + extraX;
  const tgtY = tgtBox.y + tgtBox.height / 2 + extraY;

  // Use page.evaluate to dispatch mouse events (same approach as Protractor version for dragula)
  await page.evaluate(({ sx, sy, tx, ty }) => {
    function triggerMouseEvent(node: EventTarget, eventType: string, opts?: { x: number; y: number }) {
      const event = new MouseEvent(eventType, {
        bubbles: true,
        cancelable: true,
        clientX: opts?.x,
        clientY: opts?.y,
        button: 0,
        which: 1,
      });
      node.dispatchEvent(event);
    }

    const srcEl = document.elementFromPoint(sx, sy);
    if (!srcEl) return;
    srcEl.scrollIntoView({ block: 'center' });

    triggerMouseEvent(srcEl, 'mousedown', { x: sx, y: sy });

    // Two moves to trigger dragula
    triggerMouseEvent(document.documentElement, 'mousemove', { x: tx, y: ty });
    triggerMouseEvent(document.documentElement, 'mousemove', { x: tx, y: ty });
    triggerMouseEvent(document.documentElement, 'mouseup', { x: tx, y: ty });
  }, { sx: srcX, sy: srcY, tx: tgtX, ty: tgtY });

  // Wait for drag to end
  await page.waitForFunction(() => document.querySelectorAll('.gu-mirror').length === 0, null, { timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(500);
}

export async function waitTransitionTime(page: Page, locator: Locator) {
  await page.waitForTimeout(400);
}

export async function takeScreenshot(page: Page, section: string, filename: string) {
  const dir = path.resolve(__dirname, '..', 'screenshots', section);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  await page.screenshot({ path: path.join(dir, `${filename}.png`) });
}

export async function goHome(page: Page) {
  await page.goto('/');
  await waitLoader(page);
}

export async function goToFirstProject(page: Page) {
  await page.locator('div[tg-dropdown-project-list]').hover();
  const project = page.locator('div[tg-dropdown-project-list] li a').first();
  await link(page, project);
  await waitLoader(page);
}

export async function goToIssues(page: Page) {
  await link(page, page.locator('#nav-issues a'));
  await waitLoader(page);
}

export async function goToBacklog(page: Page) {
  await link(page, page.locator('#nav-backlog a').first());
  await waitLoader(page);
}

export async function goToFirstUserStory(page: Page) {
  await link(page, page.locator('.user-story-name>a').first());
  await waitLoader(page);
}

export async function goToFirstSprint(page: Page) {
  await link(page, page.locator('div[tg-backlog-sprint] a.button-gray').first());
  await waitLoader(page);
}

export async function goToFirstTask(page: Page) {
  await link(page, page.locator('div[tg-taskboard-task] a.task-name').first());
  await waitLoader(page);
}

export function uploadFilePath(): string {
  return path.resolve(__dirname, '..', 'fixtures', 'upload-file-test.txt');
}

export function uploadImagePath(): string {
  return path.resolve(__dirname, '..', 'fixtures', 'upload-image-test.png');
}

export async function uploadFile(page: Page, inputLocator: Locator, filePath: string) {
  // Make the input visible and remove hidden class
  await page.evaluate((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = 'block';
    htmlEl.classList.remove('hidden');
  }, await inputLocator.elementHandle());

  await inputLocator.setInputFiles(filePath);

  // Hide it again
  await page.evaluate((el) => {
    const htmlEl = el as HTMLElement;
    htmlEl.style.display = 'none';
  }, await inputLocator.elementHandle());
}

export async function clear(locator: Locator) {
  await locator.fill('');
}

export async function outerHtmlChanges(page: Page, selector: string): Promise<() => Promise<void>> {
  const html = await page.locator(selector).evaluate(el => el.outerHTML);
  return async () => {
    await page.waitForFunction(
      ({ sel, oldHtml }) => {
        const el = document.querySelector(sel);
        return el ? el.outerHTML !== oldHtml : true;
      },
      { sel: selector, oldHtml: html },
      { timeout: 5000 }
    );
    await page.waitForTimeout(100);
  };
}

export async function createProject(page: Page, members: string[] = []): Promise<string> {
  await page.goto('/project/new');
  await waitLoader(page);
  await link(page, page.locator('.e2e-create-project-scrum'));
  const projectName = 'name ' + Date.now();
  const projectDescription = 'description ' + Date.now();
  await page.locator('.e2e-create-project-title').fill(projectName);
  await page.locator('.e2e-create-project-description').fill(projectDescription);
  await page.locator('.e2e-create-project-action-submit').click();
  await page.waitForTimeout(2000);
  const url = page.url();
  const projectSlug = url.split('/')[4];
  return projectSlug;
}
