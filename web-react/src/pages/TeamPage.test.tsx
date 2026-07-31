import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import TeamPage from './TeamPage';

const mockProject = {
  id: 1,
  name: 'Project Example 1',
  slug: 'project-1',
};

vi.mock('../api/resources', () => ({
  memberships: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: 1, user: 1, full_name: 'admin', email: 'admin@example.com', role_name: 'Product Owner', is_admin: true, photo: null, gravatar_id: 'abc' },
        { id: 2, user: 2, full_name: 'Virginia Castro', email: 'virginia@example.com', role_name: 'UX', is_admin: false, photo: null, gravatar_id: 'def' },
        { id: 3, user: 3, full_name: 'Francisco Gil', email: 'francisco@example.com', role_name: 'Front', is_admin: false, photo: null, gravatar_id: 'ghi' },
      ],
    }),
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({ project: mockProject }),
  };
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <TeamPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('TeamPage', () => {
  it('renders Team heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Team')).toBeInTheDocument();
    });
  });

  it('renders team members', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('Virginia Castro')).toBeInTheDocument();
      expect(screen.getByText('Francisco Gil')).toBeInTheDocument();
    });
  });

  it('renders member roles', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Product Owner')).toBeInTheDocument();
      expect(screen.getByText('UX')).toBeInTheDocument();
      expect(screen.getByText('Front')).toBeInTheDocument();
    });
  });

  it('shows admin badge for admin members', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Admin')).toBeInTheDocument();
    });
  });
});
