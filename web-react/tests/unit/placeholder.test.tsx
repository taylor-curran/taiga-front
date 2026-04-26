import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { AdminPlaceholderPage } from '../../src/pages/AdminPlaceholderPage';
import { AdminShellLayout } from '../../src/layout/AdminShellLayout';

describe('AdminPlaceholderPage', () => {
  it('shows port pending copy', () => {
    render(
      <MemoryRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        initialEntries={['/project/p/admin/project-profile/details']}
      >
        <Routes>
          <Route path="/project/:projectSlug/admin/*" element={<AdminShellLayout />}>
            <Route
              path="project-profile/details"
              element={<AdminPlaceholderPage title="Admin — Project profile — Details" />}
            />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('admin-placeholder-message')).toHaveTextContent('Port pending');
  });
});
