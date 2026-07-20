import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '../../auth/authStore';
import { setConfForTests } from '../../lib/conf';
import { LoginPage } from './LoginPage';

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.getState().clearSession();
    useAuthStore.getState().hydrateFromStorage();
    setConfForTests({
      api: 'http://localhost/api/v1/',
      defaultLanguage: 'en',
      loginFormType: 'normal',
    });
    vi.restoreAllMocks();
  });

  it('posts /auth with type normal and credentials on submit', async () => {
    const user = userEvent.setup();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 1,
        username: 'admin',
        auth_token: 't1',
        refresh: 'r1',
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<div data-testid="home">home</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText(/Username or email/i), 'admin');
    await user.type(screen.getByPlaceholderText(/^Password/i), 'adminpass');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    const call = fetchMock.mock.calls.find((c) => String(c[0]).includes('/auth'));
    expect(call).toBeDefined();
    const [url, init] = call!;
    expect(String(url)).toContain('/auth');
    expect(init?.method).toBe('POST');
    expect(JSON.parse(String(init?.body))).toEqual({
      username: 'admin',
      password: 'adminpass',
      type: 'normal',
    });

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeInTheDocument();
    });
  });

  it('shows incorrect-credentials message on failed login', async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({}),
      }),
    );

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.type(screen.getByPlaceholderText(/Username or email/i), 'x');
    await user.type(screen.getByPlaceholderText(/^Password/i), 'y');
    await user.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(screen.getByText(/According to the Taiga/i)).toBeInTheDocument();
    });
  });
});
