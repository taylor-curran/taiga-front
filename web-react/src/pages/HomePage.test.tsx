import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import HomePage from './HomePage';
import { useAuthStore } from '../stores/auth';

vi.mock('../api/resources', () => ({
  projects: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Project Example 1', slug: 'project-1', description: 'Project example 1 description', total_fans: 11, total_watchers: 15, is_private: false, logo_small_url: null, members: [] },
        { id: 2, name: 'Project Example 2', slug: 'project-2', description: 'Project example 2 description', total_fans: 5, total_watchers: 15, is_private: false, logo_small_url: null, members: [] },
      ],
    }),
  },
  timeline: {
    getUserTimeline: vi.fn().mockResolvedValue({
      data: [
        { id: 1, event_type: 'projects.project.create', created: '2024-01-01T00:00:00Z', data: { project: { name: 'Project Example 1' } } },
        { id: 2, event_type: 'userstories.userstory.change', created: '2024-01-02T00:00:00Z', data: { project: { name: 'Project Example 1' } } },
      ],
    }),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

describe('HomePage', () => {
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

  it('renders project cards from API', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Project Example 1')).toBeInTheDocument();
      expect(screen.getByText('Project Example 2')).toBeInTheDocument();
    });
  });

  it('renders project descriptions', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Project example 1 description')).toBeInTheDocument();
    });
  });

  it('renders Working on section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Working on')).toBeInTheDocument();
    });
  });

  it('links to project pages', async () => {
    renderPage();
    await waitFor(() => {
      const links = screen.getAllByRole('link');
      const projectLink = links.find(l => l.getAttribute('href') === '/project/project-1/');
      expect(projectLink).toBeDefined();
    });
  });
});
