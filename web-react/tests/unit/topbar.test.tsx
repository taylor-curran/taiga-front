import { beforeEach, describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Topbar } from '@/components/Topbar';
import { useAuth } from '@/auth/store';

describe('Topbar', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({ user: null, hydrated: true });
  });

  it('shows Sign in for anonymous users', () => {
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>,
    );
    expect(screen.getByText(/sign in/i)).toBeInTheDocument();
  });

  it('shows nav links and a logout button when authenticated', async () => {
    useAuth.setState({
      user: { id: 1, username: 'admin', full_name_display: 'Admin' } as never,
      hydrated: true,
    });
    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>,
    );
    expect(screen.getByText(/projects/i)).toBeInTheDocument();
    expect(screen.getByText(/discover/i)).toBeInTheDocument();
    expect(screen.getByText(/notifications/i)).toBeInTheDocument();
    const logout = screen.getByTestId('logout-button');
    expect(logout).toBeInTheDocument();
    await userEvent.click(logout);
    expect(useAuth.getState().user).toBeNull();
  });
});
