import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/auth/store';

function setup(initial: string[]) {
  return render(
    <MemoryRouter initialEntries={initial}>
      <Routes>
        <Route
          path="/secret"
          element={
            <RequireAuth>
              <div data-testid="secret-page">secret</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div data-testid="login-page">login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuth.setState({ user: null, hydrated: true });
  });

  it('redirects unauthenticated users to /login with next param', () => {
    setup(['/secret']);
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    useAuth.setState({
      user: { id: 1, username: 'admin', auth_token: 't', refresh: 'r' } as never,
      hydrated: true,
    });
    setup(['/secret']);
    expect(screen.getByTestId('secret-page')).toBeInTheDocument();
  });

  it('renders nothing until hydrated', () => {
    useAuth.setState({ user: null, hydrated: false });
    const { container } = setup(['/secret']);
    expect(container.textContent).toBe('');
  });
});
