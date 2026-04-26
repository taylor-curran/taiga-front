import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { settleAfterNav, isAngular } from './helpers';

/* ——— Login (/login) ——— */

test('login: document title is route-specific (Login - Taiga)', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 1500);
  await expect(page).toHaveTitle(/Login.*Taiga/i);
});

test('login: tagline under logo is LOVE YOUR PROJECT', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('h2.tagline').first()).toHaveText('LOVE YOUR PROJECT');
});

test('login: username field placeholder mentions case sensitive', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  const ph = page.locator('input[name="username"]').first();
  await expect(ph).toHaveAttribute('placeholder', /case sensitive/i);
});

test('login: password placeholder mentions case sensitive', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  const ph = page.locator('input[name="password"]').first();
  await expect(ph).toHaveAttribute('placeholder', /case sensitive/i);
});

test('login: forgot-password link text is Forgot it?', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('a.forgot-pass').first()).toHaveText('Forgot it?');
});

test('login: submit button label is Login', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('form.login-form button[type="submit"]').first()).toHaveText('Login');
});

test('login: register CTA starts with Not registered yet?', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('.register-text, p.register-text').first()).toContainText(
    'Not registered yet?',
  );
});

test('login: register link anchor is create your free account here', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('.register-text a, p.register-text a').first()).toHaveText(
    'create your free account here',
  );
});

test('login: username field has autocapitalize none', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('input[name="username"]').first()).toHaveAttribute('autocapitalize', 'none');
});

test('login: username field has autofocus', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('input[name="username"]').first()).toHaveAttribute('autofocus');
});

test('login: incorrect password shows Taiga reference error copy', async ({ page }, testInfo) => {
  await page.goto('/login');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await page.locator('input[name="username"]').first().fill('admin');
  await page.locator('input[name="password"]').first().fill('wrong-password-xyz');
  await page.locator('form.login-form button[type="submit"]').first().click();
  await page.waitForTimeout(isAngular(testInfo.project.name) ? 2500 : 1500);
  const msg = page.getByText(/According to the Taiga, your username\/email or password are incorrect/i);
  await expect(msg.first()).toBeVisible();
});

/* ——— Register (/register) ——— */

test('register: form is present with username field', async ({ page }, testInfo) => {
  await page.goto('/register');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3500 : 800);
  await expect(page.locator('form.register-form input[name="username"]').first()).toBeVisible();
});

test('register: username placeholder Pick a username', async ({ page }, testInfo) => {
  await page.goto('/register');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3500 : 800);
  await expect(page.locator('input[name="username"]').first()).toHaveAttribute(
    'placeholder',
    'Pick a username',
  );
});

test('register: full name placeholder Pick your full name', async ({ page }, testInfo) => {
  await page.goto('/register');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3500 : 800);
  await expect(page.locator('input[name="full_name"]').first()).toHaveAttribute(
    'placeholder',
    'Pick your full name',
  );
});

test('register: email placeholder Your email', async ({ page }, testInfo) => {
  await page.goto('/register');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3500 : 800);
  await expect(page.locator('input[name="email"]').first()).toHaveAttribute('placeholder', 'Your email');
});

test('register: password placeholder mentions case sensitive', async ({ page }, testInfo) => {
  await page.goto('/register');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3500 : 800);
  await expect(page.locator('input[name="password"]').first()).toHaveAttribute(
    'placeholder',
    /case sensitive/i,
  );
});

test('register: submit button label is Sign up', async ({ page }, testInfo) => {
  await page.goto('/register');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3500 : 800);
  await expect(page.getByRole('button', { name: 'Sign up' }).first()).toHaveText('Sign up');
});

test('register: bottom link mentions already registered', async ({ page }, testInfo) => {
  await page.goto('/register');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3500 : 800);
  await expect(page.locator('a.register-text-top').first()).toContainText('Are you already registered?');
});

/* ——— Forgot password ——— */

test('forgot-password: heading Oops, did you forget your password?', async ({ page }, testInfo) => {
  await page.goto('/forgot-password');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.getByText('Oops, did you forget your password?').first()).toBeVisible();
});

test('forgot-password: subtitle asks for username or email', async ({ page }, testInfo) => {
  await page.goto('/forgot-password');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(
    page.getByText('Enter your username or email to get a new one').first(),
  ).toBeVisible();
});

test('forgot-password: field placeholder Username or email', async ({ page }, testInfo) => {
  await page.goto('/forgot-password');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('input[name="username"]').first()).toHaveAttribute(
    'placeholder',
    'Username or email',
  );
});

test('forgot-password: submit button Reset Password', async ({ page }, testInfo) => {
  await page.goto('/forgot-password');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.getByRole('button', { name: 'Reset Password' }).first()).toHaveText('Reset Password');
});

test('forgot-password: cancel link Nah, take me back', async ({ page }, testInfo) => {
  await page.goto('/forgot-password');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.getByText(/Nah, take me back/i).first()).toBeVisible();
});

/* ——— Change password from recovery ——— */

test('change-password recovery: shows iron-rich food subtitle', async ({ page }, testInfo) => {
  await page.goto('/change-password/testtoken');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.getByText(/iron-rich food/i).first()).toBeVisible();
});

test('change-password recovery: has confirm password field', async ({ page }, testInfo) => {
  await page.goto('/change-password/testtoken');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('input[name="password2"]').first()).toBeVisible();
});

test('change-password recovery: second placeholder Re-type new password', async ({ page }, testInfo) => {
  await page.goto('/change-password/testtoken');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 3000 : 800);
  await expect(page.locator('input[name="password2"]').first()).toHaveAttribute(
    'placeholder',
    'Re-type new password',
  );
});

/* ——— Invitation ——— */

async function mockInvitationApi(page: Page, testInfo: TestInfo) {
  if (isAngular(testInfo.project.name)) return;
  await page.route('**/api/v1/invitations/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        project_name: 'Mock Project',
        project_slug: 'scrum',
        invited_by: { full_name_display: 'Inviter' },
      }),
    });
  });
}

test('invitation: login form header is I already have a Taiga login', async ({ page }, testInfo) => {
  await mockInvitationApi(page, testInfo);
  await page.goto('/invitation/mock-invite-token');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 1500);
  await expect(page.locator('.invitation-form .form-header').first()).toHaveText('I already have a Taiga login');
});

test('invitation: invited-you phrase from locale', async ({ page }, testInfo) => {
  await mockInvitationApi(page, testInfo);
  await page.goto('/invitation/mock-invite-token');
  await settleAfterNav(page, isAngular(testInfo.project.name) ? 4000 : 1500);
  await expect(page.locator('.invitation-text').first()).toContainText('has invited you to join the project');
});
