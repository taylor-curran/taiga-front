import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Loader from './Loader';

describe('Loader', () => {
  it('renders spinner', () => {
    const { container } = render(<Loader />);
    expect(container.querySelector('.loader-spinner')).toBeInTheDocument();
    expect(container.querySelector('.loader-container')).toBeInTheDocument();
  });
});
