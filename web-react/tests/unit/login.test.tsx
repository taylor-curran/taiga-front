import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Login from '@/pages/auth/Login';
import { useAuth } from '@/auth/store';

function renderLogin(initialEntries: string[] = ['/login']) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<div data-testid="home-fake">home</div>} />
          <Route path="/dest" element={<div data-testid="dest-fake">dest</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('Login page', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ user: null, hydrated: true });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('disables submit until username and password are filled', async () => {
    renderLogin();
    const submit = screen.getByTestId('login-submit') as HTMLButtonElement;
    expect(submit).toBeDisabled();
    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'adminpass');
    expect(submit).not.toBeDisabled();
  });

  it('issues POST /api/v1/auth with normal type and stores credentials', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          id: 5,
          username: 'admin',
          auth_token: 'AUTH',
          refresh: 'REFRESH',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'adminpass');
    await userEvent.click(screen.getByTestId('login-submit'));

    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const [url, opts] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain('/api/v1/auth');
    expect(opts?.method).toBe('POST');
    const body = JSON.parse(opts!.body as string);
    expect(body).toEqual({ type: 'normal', username: 'admin', password: 'adminpass' });

    await waitFor(() => expect(localStorage.getItem('taiga.token')).toBe('"AUTH"'));
    await waitFor(() => screen.getByTestId('home-fake'));
  });

  it('shows an error banner on 401', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ _error_message: 'nope' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    renderLogin();
    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong');
    await userEvent.click(screen.getByTestId('login-submit'));

    expect(await screen.findByTestId('login-error')).toBeInTheDocument();
  });

  it('redirects to next param on successful login', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ id: 1, username: 'admin', auth_token: 't', refresh: 'r' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    renderLogin(['/login?next=' + encodeURIComponent('/dest')]);
    await userEvent.type(screen.getByLabelText(/username/i), 'admin');
    await userEvent.type(screen.getByLabelText(/password/i), 'adminpass');
    await userEvent.click(screen.getByTestId('login-submit'));
    await waitFor(() => screen.getByTestId('dest-fake'));
  });
});
