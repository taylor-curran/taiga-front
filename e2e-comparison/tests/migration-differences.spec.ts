import { expect, test, type Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/login", { waitUntil: "domcontentloaded" });

  const username = page
    .locator('input[name="username"]')
    .or(page.locator('input[type="text"]'))
    .first();
  const password = page
    .locator('input[name="password"]')
    .or(page.locator('input[type="password"]'))
    .first();

  await expect(username).toBeVisible({ timeout: 10_000 });
  await username.fill("admin");
  await password.fill("adminpass");

  const submit = page
    .locator('button[type="submit"]')
    .or(page.getByRole("button", { name: /login|log in|sign in/i }))
    .first();
  await submit.click();

  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(2000);
}

test.describe("Angular-to-React migration discrepancies", () => {
  test("home dashboard shows project timeline/activity cards", async ({ page }, testInfo) => {
    await login(page);

    await page.goto("/", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    await expect(page.getByRole("heading", { name: "Working on" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("heading", { name: "Watching" })).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: `artifacts/${testInfo.project.name}-home-dashboard.png`, fullPage: true });
  });

  test("projects listing contains seeded projects and create-project CTA", async ({ page }, testInfo) => {
    await login(page);

    await page.goto("/projects", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2000);

    await expect(page.getByRole("heading", { name: "My projects" })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: "Project Example 7" }).first()).toBeVisible({ timeout: 10_000 });
    await expect(page.getByRole("link", { name: /new project/i })).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: `artifacts/${testInfo.project.name}-projects.png`, fullPage: true });
  });

  test("project backlog page renders user stories table", async ({ page }, testInfo) => {
    await login(page);

    await page.goto("/project/project-1/backlog", { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);

    await expect(page.getByRole("heading", { name: "Backlog" })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator("text=User Stories").first()).toBeVisible({ timeout: 10_000 });

    await page.screenshot({ path: `artifacts/${testInfo.project.name}-backlog.png`, fullPage: true });
  });
});
