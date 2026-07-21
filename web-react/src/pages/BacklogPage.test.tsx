import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import BacklogPage from './BacklogPage';
import { useAuthStore } from '../stores/auth';

const mockProject = {
  id: 1,
  name: 'Project Example 1',
  slug: 'project-1',
  us_statuses: [
    { id: 1, name: 'New', color: '#999', is_closed: false, order: 1 },
    { id: 2, name: 'Ready', color: '#ff9900', is_closed: false, order: 2 },
    { id: 3, name: 'In progress', color: '#ffcc00', is_closed: false, order: 3 },
    { id: 4, name: 'Ready for test', color: '#ffcc00', is_closed: false, order: 4 },
    { id: 5, name: 'Done', color: '#669900', is_closed: true, order: 5 },
  ],
  points: [
    { id: 1, name: '?', value: null, order: 1 },
    { id: 2, name: '0', value: 0, order: 2 },
    { id: 3, name: '1/2', value: 0.5, order: 3 },
    { id: 4, name: '1', value: 1, order: 4 },
  ],
  total_milestones: 1,
  total_story_points: 392,
};

vi.mock('../api/resources', () => ({
  milestones: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Sprint 2026-3-11', slug: 'sprint-2026-3-11', estimated_start: '2026-03-11', estimated_finish: '2026-03-26', closed: false, user_stories: [
          { id: 1, ref: 1, subject: 'Exception is thrown if trying to add a folder', status_extra_info: { name: 'Ready', color: '#ff9900' }, total_points: 21, assigned_to_extra_info: null, milestone: 1 },
        ] },
      ],
    }),
    getStats: vi.fn().mockResolvedValue({
      data: { total_points: 392, completed_points: 21, days: [] },
    }),
  },
  userstories: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: 12, ref: 12, subject: 'Support for bulk actions', status: 1, status_extra_info: { name: 'New', color: '#999' }, total_points: 50, assigned_to_extra_info: { full_name_display: 'Vanesa Garcia' }, milestone: null, tags: [['vel', '#aaa']] },
        { id: 13, ref: 13, subject: 'Feature/improved image admin', status: 1, status_extra_info: { name: 'New', color: '#999' }, total_points: 19, assigned_to_extra_info: { full_name_display: 'Francisco Gil' }, milestone: null, tags: [] },
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
      <MemoryRouter initialEntries={['/project/project-1/backlog']}>
        <BacklogPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('BacklogPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'test-token', refresh: 'test-refresh', user: null });
  });

  it('renders Scrum heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Scrum')).toBeInTheDocument();
    });
  });

  it('renders sprint section', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText(/Sprint 2026-3-11/)).toBeInTheDocument();
    });
  });

  it('renders backlog user stories', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Support for bulk actions')).toBeInTheDocument();
      expect(screen.getByText('Feature/improved image admin')).toBeInTheDocument();
    });
  });

  it('renders burndown chart toggle', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByTitle('Show/Hide burndown graph')).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('subject or reference')).toBeInTheDocument();
    });
  });

  it('renders Add user stories button', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('+ Add user stories')).toBeInTheDocument();
    });
  });
});
