import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ProjectsListing from '@/pages/projects/ProjectsListing';
import { useAuth } from '@/auth/store';

function mockProjects() {
  return [
    {
      id: 1,
      name: 'Project Example 1',
      slug: 'project-1',
      description: 'a description here',
      is_private: false,
      i_am_owner: true,
      blocked_code: null,
      total_milestones: 2,
    },
    {
      id: 2,
      name: 'Secret',
      slug: 'project-2',
      description: '',
      is_private: true,
      i_am_owner: false,
      blocked_code: 'blocked',
      total_milestones: 0,
    },
  ];
}

describe('ProjectsListing', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuth.setState({
      user: { id: 5, username: 'admin', auth_token: 'tok', refresh: 'r' } as never,
      hydrated: true,
    });
  });
  afterEach(() => vi.restoreAllMocks());

  it('issues GET /projects with member, order_by, slight', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockProjects()), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <ProjectsListing />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await waitFor(() => expect(fetchSpy).toHaveBeenCalled());
    const url = String(fetchSpy.mock.calls[0][0]);
    expect(url).toContain('/api/v1/projects');
    expect(url).toContain('member=5');
    expect(url).toContain('order_by=user_order');
    expect(url).toContain('slight=true');
    const init = fetchSpy.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)['x-disable-pagination']).toBe('1');
  });

  it('renders project rows with private/owner/blocked badges', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(mockProjects()), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={qc}>
        <MemoryRouter>
          <ProjectsListing />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId('project-row-project-1')).toBeInTheDocument();
    expect(screen.getByTestId('project-row-project-2')).toBeInTheDocument();
    expect(screen.getByTestId('project-link-project-1')).toHaveAttribute(
      'href',
      '/project/project-1/timeline',
    );
    expect(screen.getByText(/owner/i)).toBeInTheDocument();
    expect(screen.getByText(/private/i)).toBeInTheDocument();
    expect(screen.getByText(/blocked/i)).toBeInTheDocument();
  });
});
