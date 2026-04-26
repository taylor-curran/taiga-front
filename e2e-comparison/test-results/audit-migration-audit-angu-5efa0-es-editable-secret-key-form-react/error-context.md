# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: audit.spec.ts >> migration audit: angular behavior assertions >> admin github integration page includes editable secret key form
- Location: tests/audit.spec.ts:54:3

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('input#secret-key')
Expected: 1
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" with timeout 5000ms
  - waiting for locator('input#secret-key')
    9 × locator resolved to 0 elements
      - unexpected value "0"

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - link "TAIGA" [ref=e5] [cursor=pointer]:
      - /url: /
    - link "Projects" [ref=e6] [cursor=pointer]:
      - /url: /projects/
    - link "Discover" [ref=e7] [cursor=pointer]:
      - /url: /discover
    - link "Notifications" [ref=e8] [cursor=pointer]:
      - /url: /notifications
    - generic [ref=e9]:
      - link "admin" [ref=e10] [cursor=pointer]:
        - /url: /profile
        - generic "admin" [ref=e11]:
          - img "admin" [ref=e12]
      - link "admin" [ref=e13] [cursor=pointer]:
        - /url: /profile
      - button "Sign out" [ref=e14] [cursor=pointer]
  - main [ref=e15]:
    - complementary [ref=e16]:
      - generic [ref=e17]:
        - strong [ref=e18]:
          - link "Project Example 1" [ref=e19] [cursor=pointer]:
            - /url: /project/project-1/timeline
        - text: Public
      - navigation [ref=e20]:
        - link "Timeline" [ref=e21] [cursor=pointer]:
          - /url: /project/project-1/timeline
        - link "Epics" [ref=e22] [cursor=pointer]:
          - /url: /project/project-1/epics
        - link "Backlog" [ref=e23] [cursor=pointer]:
          - /url: /project/project-1/backlog
        - link "Kanban" [ref=e24] [cursor=pointer]:
          - /url: /project/project-1/kanban
        - link "Issues" [ref=e25] [cursor=pointer]:
          - /url: /project/project-1/issues
        - link "Wiki" [ref=e26] [cursor=pointer]:
          - /url: /project/project-1/wiki/home
        - link "Team" [ref=e27] [cursor=pointer]:
          - /url: /project/project-1/team
        - link "Admin" [ref=e28] [cursor=pointer]:
          - /url: /project/project-1/admin/project-profile/details
    - generic [ref=e30]:
      - heading "Admin" [level=1] [ref=e31]
      - generic [ref=e32]:
        - complementary [ref=e33]:
          - navigation [ref=e34]:
            - link "Project details" [ref=e35] [cursor=pointer]:
              - /url: /project/project-1/admin/project-profile/details
            - link "Default values" [ref=e36] [cursor=pointer]:
              - /url: /project/project-1/admin/project-profile/default-values
            - link "Modules" [ref=e37] [cursor=pointer]:
              - /url: /project/project-1/admin/project-profile/modules
            - link "Export" [ref=e38] [cursor=pointer]:
              - /url: /project/project-1/admin/project-profile/export
            - link "Reports" [ref=e39] [cursor=pointer]:
              - /url: /project/project-1/admin/project-profile/reports
            - link "US statuses" [ref=e40] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/status
            - link "Points" [ref=e41] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/points
            - link "Priorities" [ref=e42] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/priorities
            - link "Severities" [ref=e43] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/severities
            - link "Types" [ref=e44] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/types
            - link "Custom fields" [ref=e45] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/custom-fields
            - link "Tags" [ref=e46] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/tags
            - link "Due dates" [ref=e47] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/due-dates
            - link "Kanban power-ups" [ref=e48] [cursor=pointer]:
              - /url: /project/project-1/admin/project-values/kanban-power-ups
            - link "Memberships" [ref=e49] [cursor=pointer]:
              - /url: /project/project-1/admin/memberships
            - link "Roles" [ref=e50] [cursor=pointer]:
              - /url: /project/project-1/admin/roles
            - link "Webhooks" [ref=e51] [cursor=pointer]:
              - /url: /project/project-1/admin/third-parties/webhooks
            - link "GitHub" [ref=e52] [cursor=pointer]:
              - /url: /project/project-1/admin/third-parties/github
            - link "GitLab" [ref=e53] [cursor=pointer]:
              - /url: /project/project-1/admin/third-parties/gitlab
            - link "Bitbucket" [ref=e54] [cursor=pointer]:
              - /url: /project/project-1/admin/third-parties/bitbucket
            - link "Gogs" [ref=e55] [cursor=pointer]:
              - /url: /project/project-1/admin/third-parties/gogs
        - generic [ref=e57]:
          - heading "GitHub integration" [level=2] [ref=e58]
          - paragraph [ref=e59]: Read-only view of the project setting.
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | 
  3  | type AppKind = 'angular' | 'react';
  4  | 
  5  | const API_BASE = process.env.API_BASE_URL ?? 'http://localhost:9000';
  6  | 
  7  | async function loginViaApi(page: import('@playwright/test').Page, request: import('@playwright/test').APIRequestContext, app: AppKind) {
  8  |   const response = await request.post(`${API_BASE}/api/v1/auth`, {
  9  |     data: { type: 'normal', username: 'admin', password: 'adminpass' },
  10 |     headers: { 'Content-Type': 'application/json' },
  11 |   });
  12 |   expect(response.ok()).toBeTruthy();
  13 |   const user = await response.json();
  14 | 
  15 |   if (app === 'react') {
  16 |     await page.goto('/login');
  17 |     await page.evaluate(
  18 |       ([u, t, r]) => {
  19 |         localStorage.setItem('taiga.userInfo', JSON.stringify(u));
  20 |         localStorage.setItem('taiga.token', JSON.stringify(t));
  21 |         localStorage.setItem('taiga.refresh', JSON.stringify(r));
  22 |       },
  23 |       [user, user.auth_token, user.refresh],
  24 |     );
  25 |   } else {
  26 |     await page.goto('/');
  27 |     await page.evaluate(
  28 |       ([u, t, r]) => {
  29 |         localStorage.setItem('userInfo', JSON.stringify(u));
  30 |         localStorage.setItem('token', JSON.stringify(t));
  31 |         localStorage.setItem('refresh', JSON.stringify(r));
  32 |       },
  33 |       [user, user.auth_token, user.refresh],
  34 |     );
  35 |   }
  36 | }
  37 | 
  38 | async function openProjectAdmin(page: import('@playwright/test').Page) {
  39 |   await page.goto('/project/project-1/admin/third-parties/webhooks');
  40 |   await page.waitForLoadState('networkidle');
  41 | }
  42 | 
  43 | test.describe('migration audit: angular behavior assertions', () => {
  44 |   test('admin webhooks page offers a way to add a webhook', async ({ page, request }, testInfo) => {
  45 |     const app = testInfo.project.name as AppKind;
  46 |     await loginViaApi(page, request, app);
  47 |     await openProjectAdmin(page);
  48 |     await page.screenshot({ path: `artifacts/${app}-webhooks-page.png`, fullPage: true });
  49 |     const addButton = page.locator('button.add-webhook');
  50 |     await expect(addButton).toHaveCount(1);
  51 |     await expect(addButton).toContainText(/add .* webhook/i);
  52 |   });
  53 | 
  54 |   test('admin github integration page includes editable secret key form', async ({ page, request }, testInfo) => {
  55 |     const app = testInfo.project.name as AppKind;
  56 |     await loginViaApi(page, request, app);
  57 |     await page.goto('/project/project-1/admin/third-parties/github');
  58 |     await page.waitForLoadState('networkidle');
  59 |     await page.screenshot({ path: `artifacts/${app}-github-admin-page.png`, fullPage: true });
  60 |     const secretInput = page.locator('input#secret-key');
> 61 |     await expect(secretInput).toHaveCount(1);
     |                               ^ Error: expect(locator).toHaveCount(expected) failed
  62 |     await expect(secretInput).toBeEditable();
  63 |     await expect(page.locator('button[type="submit"]')).toHaveCount(1);
  64 |   });
  65 | });
  66 | 
```