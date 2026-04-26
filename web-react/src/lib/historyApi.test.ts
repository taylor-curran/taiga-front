import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { listComments, listActivity, getProjectTimelinePage } from './historyApi';

describe('historyApi', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('listComments requests type=comment on history path', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => [{ id: 1, comment: 'a', user: { name: 'x' }, created_at: 't' }],
    });
    await listComments('us', 9, false);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('/api/v1/history/userstory/9');
    expect(url).toContain('type=comment');
  });

  it('listActivity requests type=activity with page', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-pagination-next': 'false' }),
      json: async () => [],
    });
    await listActivity('us', 9, 2);
    const [url] = fetchMock.mock.calls[0] as [string];
    expect(url).toContain('type=activity');
    expect(url).toContain('page=2');
  });

  it('getProjectTimelinePage adds x-lazy-pagination header', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    });
    await getProjectTimelinePage(3, 1);
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect((init.headers as Record<string, string>)['x-lazy-pagination']).toBe('true');
  });
});
