import { describe, it, expect } from 'vitest';
import { formatTaigaDateTime } from './taigaDate';

describe('formatTaigaDateTime', () => {
  it('formats like moment DD MMM YYYY HH:mm (en, local)', () => {
    const s = formatTaigaDateTime('2024-06-15T12:30:00');
    expect(s).toMatch(/Jun 2024/);
    expect(s).toMatch(/\d{2}:\d{2}$/);
  });
});
