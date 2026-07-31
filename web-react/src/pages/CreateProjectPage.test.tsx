import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CreateProjectPage from './CreateProjectPage';

vi.mock('../api/resources', () => ({
  projects: {
    create: vi.fn().mockResolvedValue({
      data: { id: 99, slug: 'test-project', name: 'Test Project' },
    }),
  },
}));

function renderPage(route = '/project/new') {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <CreateProjectPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CreateProjectPage', () => {
  it('renders type selection when no type in route', () => {
    renderPage();
    expect(screen.getByText('Create a project')).toBeInTheDocument();
    expect(screen.getByText('Scrum')).toBeInTheDocument();
    expect(screen.getByText('Kanban')).toBeInTheDocument();
  });

  it('shows form after selecting Scrum', () => {
    renderPage();
    fireEvent.click(screen.getByText('Scrum'));
    expect(screen.getByText('New Scrum project')).toBeInTheDocument();
    expect(screen.getByLabelText('Project name')).toBeInTheDocument();
  });

  it('shows form after selecting Kanban', () => {
    renderPage();
    fireEvent.click(screen.getByText('Kanban'));
    expect(screen.getByText('New Kanban project')).toBeInTheDocument();
  });

  it('has required attribute on project name', () => {
    renderPage();
    fireEvent.click(screen.getByText('Scrum'));
    expect(screen.getByLabelText('Project name')).toBeRequired();
  });
});
