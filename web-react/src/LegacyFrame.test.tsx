import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import LegacyFrame from './LegacyFrame';
import { legacyFrameSrc } from './legacyUrls';

describe('LegacyFrame', () => {
  it('loads the Angular build under /legacy for the current path', () => {
    render(
      <MemoryRouter initialEntries={['/login?next=%2Fprojects%2F']}>
        <Routes>
          <Route path="/*" element={<LegacyFrame />} />
        </Routes>
      </MemoryRouter>,
    );
    const frame = screen.getByTitle('Taiga') as HTMLIFrameElement;
    expect(frame).toBeInTheDocument();
    expect(frame.getAttribute('src')).toBe(legacyFrameSrc('/login', '?next=%2Fprojects%2F'));
  });
});
