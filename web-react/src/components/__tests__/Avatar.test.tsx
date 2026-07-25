import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar } from '../Avatar';

describe('Avatar', () => {
  it('renders user initials when no photo is set', () => {
    render(<Avatar user={{ full_name: 'Ada Lovelace' }} />);
    expect(screen.getByText('AL')).toBeInTheDocument();
  });

  it('renders an image when photo is set', () => {
    render(<Avatar user={{ full_name: 'Ada', photo: '/img/a.png' }} />);
    expect(screen.getByRole('img')).toHaveAttribute('src', '/img/a.png');
  });

  it('falls back to a question mark when no name is provided', () => {
    render(<Avatar user={null} />);
    expect(screen.getByText('?')).toBeInTheDocument();
  });
});
