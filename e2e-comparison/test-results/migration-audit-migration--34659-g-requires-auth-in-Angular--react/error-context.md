# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: migration-audit.spec.ts >> migration audit — Angular is source of truth >> backlog: main section h1 is Backlog (requires auth in Angular)
- Location: specs/migration-audit.spec.ts:214:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('heading', { name: 'Backlog' }).first()
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByRole('heading', { name: 'Backlog' }).first()

```

# Page snapshot

```yaml
- heading "Taiga (React port) — scaffold" [level=1] [ref=e3]
```

# Test source

```ts
  120 |     expect(n).toBeGreaterThan(0);
  121 |   });
  122 | 
  123 |   test('project home: h1 project name is non-empty (requires auth in Angular)', async ({ page }, testInfo) => {
  124 |     if (testInfo.project.name === 'angular') {
  125 |       await loginAdminAngular(page);
  126 |     }
  127 |     await page.goto(PROJECT_DEMO, { waitUntil: 'load' });
  128 |     await page.waitForTimeout(4000);
  129 |     const t = (await page.locator('h1.project-name').textContent())?.trim() ?? '';
  130 |     expect(t.length).toBeGreaterThan(0);
  131 |   });
  132 | 
  133 |   test('project home: section Team heading (requires auth in Angular)', async ({ page }, testInfo) => {
  134 |     if (testInfo.project.name === 'angular') {
  135 |       await loginAdminAngular(page);
  136 |     }
  137 |     await page.goto(PROJECT_DEMO, { waitUntil: 'load' });
  138 |     await page.waitForTimeout(4000);
  139 |     const team = page.locator('h2.title').filter({ hasText: /^Team$/ });
  140 |     await expect(team.first()).toBeVisible();
  141 |   });
  142 | 
  143 |   test('project home: user timeline block visible (requires auth in Angular)', async ({ page }, testInfo) => {
  144 |     if (testInfo.project.name === 'angular') {
  145 |       await loginAdminAngular(page);
  146 |     }
  147 |     await page.goto(PROJECT_DEMO, { waitUntil: 'load' });
  148 |     await page.waitForTimeout(4000);
  149 |     await expect(page.locator('div[tg-user-timeline]')).toBeVisible();
  150 |   });
  151 | 
  152 |   test('forgot-password: document title is Forgot password - Taiga', async ({ page }) => {
  153 |     await page.goto('/forgot-password', { waitUntil: 'load' });
  154 |     await page.waitForTimeout(2000);
  155 |     await expect(page).toHaveTitle(/Forgot password - Taiga/);
  156 |   });
  157 | 
  158 |   test('forgot-password: intro line 1 is Oops, did you forget your password?', async ({ page }) => {
  159 |     await page.goto('/forgot-password', { waitUntil: 'load' });
  160 |     await page.waitForTimeout(2000);
  161 |     await expect(page.getByText('Oops, did you forget your password?')).toBeVisible();
  162 |   });
  163 | 
  164 |   test('forgot-password: single-line input placeholder is Username or email', async ({ page }) => {
  165 |     await page.goto('/forgot-password', { waitUntil: 'load' });
  166 |     await page.waitForTimeout(2000);
  167 |     const ph = await page.locator('form[ng-submit] input[name="username"], .forgot-form-container input[name="username"]').first().getAttribute('placeholder');
  168 |     expect(ph).toBe('Username or email');
  169 |   });
  170 | 
  171 |   test('forgot-password: primary button is Reset Password', async ({ page }) => {
  172 |     await page.goto('/forgot-password', { waitUntil: 'load' });
  173 |     await page.waitForTimeout(2000);
  174 |     await expect(page.locator('.forgot-form-container button.btn-small')).toHaveText('Reset Password');
  175 |   });
  176 | 
  177 |   test('register: document title is Register - Taiga', async ({ page }) => {
  178 |     await page.goto('/register', { waitUntil: 'load' });
  179 |     await page.waitForTimeout(2000);
  180 |     await expect(page).toHaveTitle(/Register - Taiga/);
  181 |   });
  182 | 
  183 |   test('register: username input placeholder is Pick a username', async ({ page }) => {
  184 |     await page.goto('/register', { waitUntil: 'load' });
  185 |     await page.waitForTimeout(2000);
  186 |     const ph = await page.locator('form.register-form input[name="username"]').getAttribute('placeholder');
  187 |     expect(ph).toBe('Pick a username');
  188 |   });
  189 | 
  190 |   test('register: sign-up button is Sign up', async ({ page }) => {
  191 |     await page.goto('/register', { waitUntil: 'load' });
  192 |     await page.waitForTimeout(2000);
  193 |     await expect(page.getByRole('button', { name: 'Sign up' })).toBeVisible();
  194 |   });
  195 | 
  196 |   test('not-found: error heading is Not found', async ({ page }) => {
  197 |     await page.goto('/this-route-does-not-exist-audit-xyz', { waitUntil: 'load' });
  198 |     await page.waitForTimeout(3000);
  199 |     await expect(page.getByRole('heading', { name: 'Not found' })).toBeVisible();
  200 |   });
  201 | 
  202 |   test('not-found: Go home link text is Take me home', async ({ page }) => {
  203 |     await page.goto('/this-route-does-not-exist-audit-xyz', { waitUntil: 'load' });
  204 |     await page.waitForTimeout(3000);
  205 |     await expect(page.getByRole('link', { name: 'Take me home' })).toBeVisible();
  206 |   });
  207 | 
  208 |   test('discover: document title is Discover projects - Taiga', async ({ page }) => {
  209 |     await page.goto('/discover', { waitUntil: 'load' });
  210 |     await page.waitForTimeout(3000);
  211 |     await expect(page).toHaveTitle(/Discover projects - Taiga/);
  212 |   });
  213 | 
  214 |   test('backlog: main section h1 is Backlog (requires auth in Angular)', async ({ page }, testInfo) => {
  215 |     if (testInfo.project.name === 'angular') {
  216 |       await loginAdminAngular(page);
  217 |     }
  218 |     await page.goto('/project/project-1/backlog', { waitUntil: 'load' });
  219 |     await page.waitForTimeout(4000);
> 220 |     await expect(page.getByRole('heading', { name: 'Backlog' }).first()).toBeVisible();
      |                                                                          ^ Error: expect(locator).toBeVisible() failed
  221 |   });
  222 | 
  223 |   test('kanban: main section h1 is Kanban (requires auth in Angular)', async ({ page }, testInfo) => {
  224 |     if (testInfo.project.name === 'angular') {
  225 |       await loginAdminAngular(page);
  226 |     }
  227 |     await page.goto('/project/project-1/kanban', { waitUntil: 'load' });
  228 |     await page.waitForTimeout(4000);
  229 |     await expect(page.getByRole('heading', { name: 'Kanban' }).first()).toBeVisible();
  230 |   });
  231 | 
  232 |   test('issues: main section h1 is Issues (requires auth in Angular)', async ({ page }, testInfo) => {
  233 |     if (testInfo.project.name === 'angular') {
  234 |       await loginAdminAngular(page);
  235 |     }
  236 |     await page.goto('/project/project-1/issues', { waitUntil: 'load' });
  237 |     await page.waitForTimeout(4000);
  238 |     await expect(page.getByRole('heading', { name: 'Issues' }).first()).toBeVisible();
  239 |   });
  240 | 
  241 |   test('wiki: main section h1 is Wiki (requires auth in Angular)', async ({ page }, testInfo) => {
  242 |     if (testInfo.project.name === 'angular') {
  243 |       await loginAdminAngular(page);
  244 |     }
  245 |     await page.goto('/project/project-1/wiki/home', { waitUntil: 'load' });
  246 |     await page.waitForTimeout(4000);
  247 |     await expect(page.getByRole('heading', { name: 'Wiki' }).first()).toBeVisible();
  248 |   });
  249 | });
  250 | 
```