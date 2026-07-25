import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Markdown, renderMarkdown } from '../Markdown';

describe('Markdown', () => {
  it('prefers backend-rendered HTML when present', () => {
    render(<Markdown html="<p data-testid='from-html'>hi</p>" source="ignored" />);
    expect(screen.getByTestId('from-html')).toBeInTheDocument();
  });

  it('falls back to client-side markdown for raw text', () => {
    const html = renderMarkdown('# Hello\n\nThis is **bold**.');
    expect(html).toContain('<h1>Hello</h1>');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('escapes html in plain text', () => {
    const html = renderMarkdown('<script>alert(1)</script>');
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });
});
