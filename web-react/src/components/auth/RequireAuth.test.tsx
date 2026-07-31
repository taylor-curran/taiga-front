import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import RequireAuth from './RequireAuth';
import { useAuthStore } from '../../stores/auth';

describe('RequireAuth', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, refresh: null, user: null });
  });

  it('redirects to login when not authenticated', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </MemoryRouter>
    );
    expect(container.textContent).not.toContain('Protected Content');
  });

  it('renders children when authenticated', () => {
    useAuthStore.setState({ token: 'valid-token' });
    render(
      <MemoryRouter>
        <RequireAuth>
          <div>Protected Content</div>
        </RequireAuth>
      </MemoryRouter>
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });
});
