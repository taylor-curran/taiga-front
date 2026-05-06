import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CancelAccountPage from './CancelAccountPage';

vi.mock('../api/resources', () => ({
  users: {
    cancelAccount: vi.fn().mockResolvedValue({}),
  },
}));

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/cancel-account/test-token']}>
        <Routes>
          <Route path="/cancel-account/:cancel_token" element={<CancelAccountPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CancelAccountPage', () => {
  it('renders confirmation prompt', () => {
    renderPage();
    expect(screen.getByText('Cancel Account')).toBeInTheDocument();
    expect(screen.getByText(/permanently delete your account/)).toBeInTheDocument();
  });

  it('shows confirm and cancel buttons', () => {
    renderPage();
    expect(screen.getByText('Yes, delete my account')).toBeInTheDocument();
    expect(screen.getByText('No, go back')).toBeInTheDocument();
  });
});
