import { describe, expect, it, vi } from 'vitest';
import { formatDate, formatDateTime, formatRelative } from '../dates';

describe('date helpers', () => {
  it('formats relative time', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-01T12:00:00Z'));
    expect(formatRelative(new Date('2026-01-01T11:59:00Z'))).toBe('1m ago');
    vi.useRealTimers();
  });
  it('formats absolute date', () => {
    expect(formatDate('2026-01-15T00:00:00Z')).not.toBe('');
    expect(formatDate(undefined)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
  });
});
