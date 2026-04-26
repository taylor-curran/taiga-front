import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { HomeGate } from './HomeGate';

describe('HomeGate', () => {
  it('redirects anonymous users to discover (Angular Home controller parity)', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route path="/" element={<HomeGate user={null} />} />
          <Route path="/discover" element={<div data-testid="discover">discover</div>} />
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByTestId('discover')).toBeInTheDocument();
  });
});
