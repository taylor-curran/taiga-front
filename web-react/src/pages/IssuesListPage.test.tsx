import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import IssuesListPage from './IssuesListPage';
import { useAuthStore } from '../stores/auth';

const mockProject = {
  id: 1,
  name: 'Project Example 1',
  slug: 'project-1',
  issue_statuses: [
    { id: 1, name: 'New', color: '#999', order: 1 },
    { id: 2, name: 'In progress', color: '#ff9900', order: 2 },
    { id: 3, name: 'Ready for test', color: '#ffcc00', order: 3 },
    { id: 4, name: 'Closed', color: '#669900', order: 4 },
  ],
  issue_types: [
    { id: 1, name: 'Bug', color: '#cc0000' },
    { id: 2, name: 'Question', color: '#006699' },
    { id: 3, name: 'Enhancement', color: '#009900' },
  ],
  priorities: [{ id: 1, name: 'Normal' }],
  severities: [{ id: 1, name: 'Normal' }],
};

vi.mock('../api/resources', () => ({
  issues: {
    list: vi.fn().mockResolvedValue({
      data: [
        { id: 1, ref: 38, subject: 'Create the user model', status: 4, type: 1, severity: 1, priority: 1, status_extra_info: { name: 'Closed' }, type_extra_info: { name: 'Bug' }, assigned_to_extra_info: { full_name_display: 'Virginia Castro', gravatar_id: 'abc' }, modified_date: '2024-01-01T00:00:00Z', tags: [['test', '#ff0000']] },
        { id: 2, ref: 37, subject: 'Support for bulk actions', status: 2, type: 2, severity: 1, priority: 1, status_extra_info: { name: 'In progress' }, type_extra_info: { name: 'Question' }, assigned_to_extra_info: { full_name_display: 'admin', gravatar_id: 'def' }, modified_date: '2024-01-02T00:00:00Z', tags: [] },
        { id: 3, ref: 36, subject: 'Support for bulk actions', status: 1, type: 3, severity: 1, priority: 1, status_extra_info: { name: 'New' }, type_extra_info: { name: 'Enhancement' }, assigned_to_extra_info: null, modified_date: '2024-01-03T00:00:00Z', tags: [] },
      ],
    }),
  },
}));

function ProjectOutlet({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

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
      <MemoryRouter initialEntries={['/project/project-1/issues']}>
        <IssuesListPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('IssuesListPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: 'test-token', refresh: 'test-refresh', user: null });
  });

  it('renders Issues heading', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Issues')).toBeInTheDocument();
    });
  });

  it('renders issue rows with subject', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('Create the user model')).toBeInTheDocument();
    });
  });

  it('renders status filter dropdown', async () => {
    renderPage();
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('renders issue reference numbers', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByText('#38')).toBeInTheDocument();
      expect(screen.getByText('#37')).toBeInTheDocument();
    });
  });

  it('renders search input', async () => {
    renderPage();
    await waitFor(() => {
      expect(screen.getByPlaceholderText('subject or reference')).toBeInTheDocument();
    });
  });
});
