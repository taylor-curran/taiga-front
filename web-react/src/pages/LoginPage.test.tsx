import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { useAuthStore } from '../stores/auth';

vi.mock('../api/resources', () => ({
  auth: {
    login: vi.fn(),
  },
}));

function renderLogin() {
  return render(
    <BrowserRouter>
      <LoginPage />
    </BrowserRouter>
  );
}

describe('LoginPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, refresh: null, user: null });
    vi.clearAllMocks();
  });

  it('renders login form with username and password fields', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('renders forgot password link', () => {
    renderLogin();
    expect(screen.getByText(/forgot your password/i)).toBeInTheDocument();
  });

  it('renders Taiga branding', () => {
    renderLogin();
    expect(screen.getByText('Taiga')).toBeInTheDocument();
  });

  it('renders Love your project tagline', () => {
    renderLogin();
    expect(screen.getByText(/love your project/i)).toBeInTheDocument();
  });

  it('has required attribute on inputs', () => {
    renderLogin();
    expect(screen.getByLabelText(/username/i)).toBeRequired();
    expect(screen.getByLabelText(/password/i)).toBeRequired();
  });
});
