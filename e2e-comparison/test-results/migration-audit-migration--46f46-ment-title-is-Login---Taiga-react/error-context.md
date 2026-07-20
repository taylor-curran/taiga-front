# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: migration-audit.spec.ts >> migration audit — Angular is source of truth >> login: document title is Login - Taiga
- Location: specs/migration-audit.spec.ts:18:3

# Error details

```
Error: expect(page).toHaveTitle(expected) failed

Expected pattern: /Login - Taiga/
Received string:  "Taiga (React port)"
Timeout: 5000ms

Call log:
  - Expect "toHaveTitle" with timeout 5000ms
    9 × unexpected value "Taiga (React port)"

```

# Page snapshot

```yaml
- heading "Taiga (React port) — scaffold" [level=1] [ref=e3]
```

# Test source

```ts
  1   | import { test, expect, type Page } from '@playwright/test';
  2   | 
  3   | const ADMIN = 'admin';
  4   | const PASS = 'adminpass';
  5   | const PROJECT_DEMO = '/project/project-1/';
  6   | 
  7   | async function loginAdminAngular(page: Page) {
  8   |   await page.goto('/login', { waitUntil: 'load' });
  9   |   await page.waitForTimeout(2000);
  10  |   await page.locator('input[name="username"]').fill(ADMIN);
  11  |   await page.locator('input[name="password"]').fill(PASS);
  12  |   await page.locator('button.btn-small[type="submit"], .submit-button').first().click();
  13  |   await page.waitForURL((u) => !u.pathname.includes('/login'), { timeout: 20000 });
  14  |   await page.waitForTimeout(2000);
  15  | }
  16  | 
  17  | test.describe('migration audit — Angular is source of truth', () => {
  18  |   test('login: document title is Login - Taiga', async ({ page }, testInfo) => {
  19  |     await page.goto('/login', { waitUntil: 'load' });
  20  |     await page.waitForTimeout(2000);
> 21  |     await expect(page).toHaveTitle(/Login - Taiga/);
      |                        ^ Error: expect(page).toHaveTitle(expected) failed
  22  |   });
  23  | 
  24  |   test('login: main brand h1 is exactly Taiga', async ({ page }, testInfo) => {
  25  |     await page.goto('/login', { waitUntil: 'load' });
  26  |     await page.waitForTimeout(2000);
  27  |     await expect(page.locator('h1.logo')).toHaveText('Taiga');
  28  |   });
  29  | 
  30  |   test('login: h2 tagline includes LOVE YOUR PROJECT', async ({ page }, testInfo) => {
  31  |     await page.goto('/login', { waitUntil: 'load' });
  32  |     await page.waitForTimeout(2000);
  33  |     await expect(page.locator('h2.tagline')).toContainText('LOVE YOUR PROJECT');
  34  |   });
  35  | 
  36  |   test('login: username field placeholder (discrimination string)', async ({ page }, testInfo) => {
  37  |     await page.goto('/login', { waitUntil: 'load' });
  38  |     await page.waitForTimeout(2000);
  39  |     const ph = await page.locator('input[name="username"]').getAttribute('placeholder');
  40  |     expect(ph).toBe('Username or email (case sensitive)');
  41  |   });
  42  | 
  43  |   test('login: password field placeholder (discrimination string)', async ({ page }, testInfo) => {
  44  |     await page.goto('/login', { waitUntil: 'load' });
  45  |     await page.waitForTimeout(2000);
  46  |     const ph = await page.locator('input[name="password"]').getAttribute('placeholder');
  47  |     expect(ph).toBe('Password (case sensitive)');
  48  |   });
  49  | 
  50  |   test('login: forgot link text is Forgot it?', async ({ page }, testInfo) => {
  51  |     await page.goto('/login', { waitUntil: 'load' });
  52  |     await page.waitForTimeout(2000);
  53  |     await expect(page.locator('a.forgot-pass')).toHaveText('Forgot it?');
  54  |   });
  55  | 
  56  |   test('login: primary submit button says Login', async ({ page }, testInfo) => {
  57  |     await page.goto('/login', { waitUntil: 'load' });
  58  |     await page.waitForTimeout(2000);
  59  |     await expect(page.locator('form.login-form button[type="submit"]')).toHaveText('Login');
  60  |   });
  61  | 
  62  |   test('discover: h1 page title is Discover projects', async ({ page }, testInfo) => {
  63  |     await page.goto('/discover', { waitUntil: 'load' });
  64  |     await page.waitForTimeout(3000);
  65  |     await expect(page.locator('.discover-header h1.title')).toHaveText('Discover projects');
  66  |   });
  67  | 
  68  |   test('discover: search placeholder is Type something...', async ({ page }, testInfo) => {
  69  |     await page.goto('/discover', { waitUntil: 'load' });
  70  |     await page.waitForTimeout(3000);
  71  |     const ph = await page.locator('.searchbox input[name="search"]').getAttribute('placeholder');
  72  |     expect(ph).toBe('Type something...');
  73  |   });
  74  | 
  75  |   test('discover: featured section title is Featured Projects', async ({ page }, testInfo) => {
  76  |     await page.goto('/discover', { waitUntil: 'load' });
  77  |     await page.waitForTimeout(3000);
  78  |     await expect(page.getByRole('heading', { name: 'Featured Projects' })).toBeVisible();
  79  |   });
  80  | 
  81  |   test('discover: most liked block title is Most liked', async ({ page }, testInfo) => {
  82  |     await page.goto('/discover', { waitUntil: 'load' });
  83  |     await page.waitForTimeout(3000);
  84  |     await expect(page.getByRole('heading', { name: 'Most liked' })).toBeVisible();
  85  |   });
  86  | 
  87  |   test('discover: most active block title is Most active', async ({ page }, testInfo) => {
  88  |     await page.goto('/discover', { waitUntil: 'load' });
  89  |     await page.waitForTimeout(3000);
  90  |     await expect(page.getByRole('heading', { name: 'Most active' })).toBeVisible();
  91  |   });
  92  | 
  93  |   test('home: main dashboard heading is Projects Dashboard (requires auth in Angular)', async ({ page }, testInfo) => {
  94  |     if (testInfo.project.name === 'angular') {
  95  |       await loginAdminAngular(page);
  96  |     }
  97  |     await page.goto('/', { waitUntil: 'load' });
  98  |     await page.waitForTimeout(3000);
  99  |     const dash = page.getByRole('heading', { name: 'Projects Dashboard', exact: true });
  100 |     await expect(dash.first()).toBeVisible();
  101 |   });
  102 | 
  103 |   test('home: working-on has duty items (requires auth in Angular)', async ({ page }, testInfo) => {
  104 |     if (testInfo.project.name === 'angular') {
  105 |       await loginAdminAngular(page);
  106 |     }
  107 |     await page.goto('/', { waitUntil: 'load' });
  108 |     await page.waitForTimeout(3000);
  109 |     const n = await page.locator('.working-on [tg-duty], .working-on div[tg-duty]').count();
  110 |     expect(n).toBeGreaterThan(0);
  111 |   });
  112 | 
  113 |   test('home: sidebar lists at least one home-project row (requires auth in Angular)', async ({ page }, testInfo) => {
  114 |     if (testInfo.project.name === 'angular') {
  115 |       await loginAdminAngular(page);
  116 |     }
  117 |     await page.goto('/', { waitUntil: 'load' });
  118 |     await page.waitForTimeout(3000);
  119 |     const n = await page.locator('.home-project').count();
  120 |     expect(n).toBeGreaterThan(0);
  121 |   });
```