import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectsListPage from './ProjectsListPage';
import { useAuthStore } from '../stores/auth';

vi.mock('../api/resources', () => ({
  projects: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Project Example 1', slug: 'project-1', description: 'Project example 1 description', is_private: false, logo_small_url: null, members: [1, 2, 3], total_fans: 11, total_watchers: 15 },
        { id: 2, name: 'Project Example 2', slug: 'project-2', description: 'Project example 2 description', is_private: false, logo_small_url: null, members: [1, 2], total_fans: 5, total_watchers: 15 },
        { id: 3, name: 'Project Example 3', slug: 'project-3', description: 'Project example 3 description', is_private: true, logo_small_url: null, members: [1], total_fans: 9, total_watchers: 15 },
      ],
    }),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ProjectsListPage />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('ProjectsListPage', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: 'test-token',
      refresh: 'test-refresh',
      user: { id: 1, username: 'admin', full_name: 'admin', full_name_display: 'admin', color: '#f00', bio: '', lang: 'en', theme: 'taiga', timezone: 'UTC', is_active: true, photo: null, big_photo: null, gravatar_id: 'abc', roles: [], total_private_projects: 0, total_public_projects: 0, email: 'admin@example.com', uuid: 'u1', date_joined: '2024-01-01', read_new_terms: true, accepted_terms: true, max_private_projects: null, max_public_projects: null, max_memberships_private_projects: null, max_memberships_public_projects: null, auth_token: 'test-token', refresh: 'test-refresh' },
    });
  });

  it('renders My Projects heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('My Projects')).toBeInTheDocument();
    });
  });

  it('renders all projects', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Project Example 1')).toBeInTheDocument();
      expect(screen.getByText('Project Example 2')).toBeInTheDocument();
      expect(screen.getByText('Project Example 3')).toBeInTheDocument();
    });
  });

  it('renders project descriptions', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Project example 1 description')).toBeInTheDocument();
    });
  });

  it('shows Private badge for private projects', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Private')).toBeInTheDocument();
    });
  });

  it('renders New project button', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('New project')).toBeInTheDocument();
    });
  });

  it('links to individual projects', async () => {
    renderPage();
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const projectLink = links.find(l => l.getAttribute('href') === '/project/project-1/');
      expect(projectLink).toBeDefined();
    });
  });
});
