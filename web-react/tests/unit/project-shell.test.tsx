import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectShell } from '@/components/ProjectShell';

function project(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: 1,
    name: 'Project Example 1',
    slug: 'project-1',
    is_private: false,
    is_epics_activated: true,
    is_backlog_activated: true,
    is_kanban_activated: true,
    is_issues_activated: true,
    is_wiki_activated: true,
    ...overrides,
  };
}

function setup(initial: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/project/:pslug" element={<ProjectShell />}>
            <Route path="*" element={<div data-testid="child-outlet" />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('ProjectShell', () => {
  beforeEach(() => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      new Response(JSON.stringify(project()), { status: 200, headers: { 'Content-Type': 'application/json' } }),
    );
  });

  afterEach(() => vi.restoreAllMocks());

  it('shows the sidebar with all enabled modules', async () => {
    setup('/project/project-1/backlog');
    expect(await screen.findByTestId('project-sidebar')).toBeInTheDocument();
    for (const label of ['Timeline', 'Epics', 'Backlog', 'Kanban', 'Issues', 'Wiki', 'Team', 'Admin']) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it('hides the modules disabled in the project settings', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify(project({ is_kanban_activated: false, is_wiki_activated: false })),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );
    setup('/project/project-1/backlog');
    await waitFor(() => screen.getByTestId('project-sidebar'));
    expect(screen.queryByText('Kanban')).not.toBeInTheDocument();
    expect(screen.queryByText('Wiki')).not.toBeInTheDocument();
  });

  it('shows an error banner when the project fails to load', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 404 }));
    setup('/project/project-1/backlog');
    expect(await screen.findByTestId('project-error')).toBeInTheDocument();
  });
});
