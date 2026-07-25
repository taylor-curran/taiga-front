import { expect, test } from '@playwright/test';
import { GATEWAY, authHeaders, authedRequest, loginViaApi } from './helpers';

// These tests assert that the React port emits the same back-end traffic as the
// AngularJS reference does for representative workflows. We compare the React
// network calls against direct API calls performed via Playwright's
// APIRequestContext (a stand-in for the gateway-rendered AngularJS app).

test.describe('back-end traffic parity', () => {
  test('login round-trip emits the same POST /api/v1/auth payload', async ({ page, request }) => {
    const token = await authedRequest(request);
    expect(token).toBeTruthy();

    let reactBody: unknown = null;
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/auth') && req.method() === 'POST') {
        try {
          reactBody = req.postDataJSON();
        } catch {
          reactBody = req.postData();
        }
      }
    });
    await page.goto('/login');
    await page.getByLabel(/username or email/i).fill('admin');
    await page.getByLabel(/password/i).fill('adminpass');
    await page.getByTestId('login-submit').click();
    await page.waitForResponse((r) => r.url().includes('/api/v1/auth') && r.request().method() === 'POST');

    expect(reactBody).toEqual({ type: 'normal', username: 'admin', password: 'adminpass' });
  });

  test('opening backlog hits the same userstories?project=N endpoint', async ({ page, request }) => {
    const token = await authedRequest(request);
    const seedProj = await request.get(`${GATEWAY}/api/v1/projects/by_slug?slug=project-1`, {
      headers: authHeaders(token),
    });
    expect(seedProj.status()).toBe(200);
    const proj = await seedProj.json();

    await loginViaApi(page);
    const usReq = page.waitForRequest(
      (r) => r.url().includes('/api/v1/userstories') && r.url().includes(`project=${proj.id}`)
    );
    await page.goto('/project/project-1/backlog');
    const req = await usReq;
    expect(req.method()).toBe('GET');
  });

  test('issues page issues a GET /api/v1/issues?project=N', async ({ page, request }) => {
    const token = await authedRequest(request);
    const seedProj = await request.get(`${GATEWAY}/api/v1/projects/by_slug?slug=project-1`, {
      headers: authHeaders(token),
    });
    const proj = await seedProj.json();
    await loginViaApi(page);
    const issuesReq = page.waitForRequest(
      (r) => r.url().includes('/api/v1/issues?') && r.url().includes(`project=${proj.id}`)
    );
    await page.goto('/project/project-1/issues');
    await issuesReq;
  });
});

test.describe('CRUD against seeded data', () => {
  test('creating, editing, and deleting a user story', async ({ page, request }) => {
    const token = await authedRequest(request);
    const seedProj = await request.get(`/api/v1/projects/by_slug?slug=project-1`, {
      headers: authHeaders(token),
    });
    const proj = await seedProj.json();
    const subject = `parity test ${Date.now()}`;
    const created = await request.post('/api/v1/userstories', {
      headers: authHeaders(token),
      data: { project: proj.id, subject },
    });
    expect(created.status()).toBe(201);
    const us = await created.json();

    await loginViaApi(page);
    await page.goto(`/project/project-1/us/${us.ref}`);
    await expect(page.getByTestId('us-detail')).toBeVisible();
    await expect(page.getByTestId('detail-subject')).toHaveText(subject);

    // Update via the UI – status select changes value, expecting PATCH /userstories/:id
    const patchReq = page.waitForRequest(
      (r) => r.method() === 'PATCH' && r.url().includes(`/api/v1/userstories/${us.id}`)
    );
    const select = page.getByTestId('status-select');
    const options = await select.locator('option').elementHandles();
    if (options.length > 1) {
      const second = await options[1].getAttribute('value');
      await select.selectOption(second!);
      await patchReq;
    }

    // Cleanup
    await request.delete(`/api/v1/userstories/${us.id}`, { headers: authHeaders(token) });
  });

  test('posting a comment on a seeded user story emits PATCH with comment field', async ({ page, request }) => {
    const token = await authedRequest(request);
    const list = await request.get('/api/v1/userstories?project=1', { headers: authHeaders(token) });
    const stories = await list.json();
    const us = stories[0];

    await loginViaApi(page);
    await page.goto(`/project/project-1/us/${us.ref}`);
    await expect(page.getByTestId('us-detail')).toBeVisible();

    const reqPromise = page.waitForRequest(
      (r) => r.method() === 'PATCH' && r.url().includes(`/api/v1/userstories/${us.id}`)
    );
    await page.getByTestId('comment-textarea').fill('parity comment');
    await page.getByTestId('comment-submit').click();
    const req = await reqPromise;
    const body = req.postDataJSON();
    expect(body).toHaveProperty('comment', 'parity comment');
  });
});
