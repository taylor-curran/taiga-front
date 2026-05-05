import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import DiscoverPage from './DiscoverPage';

vi.mock('../api/resources', () => ({
  projects: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: 1, name: 'Project Example 1', slug: 'project-1', description: 'Project example 1 description', total_fans: 11, total_activity_last_month: 42, is_private: false, logo_small_url: null },
        { id: 2, name: 'Project Example 2', slug: 'project-2', description: 'Project example 2 description', total_fans: 5, total_activity_last_month: 30, is_private: false, logo_small_url: null },
      ],
    }),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/discover']}>
        <DiscoverPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('DiscoverPage', () => {
  it('renders Discover heading', () => {
    renderPage();
    expect(screen.getByText('Discover')).toBeInTheDocument();
  });

  it('renders search input', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Search projects...')).toBeInTheDocument();
  });

  it('renders featured projects', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Project Example 1')).toBeInTheDocument();
      expect(screen.getByText('Project Example 2')).toBeInTheDocument();
    });
  });

  it('renders search button', () => {
    renderPage();
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });
});
