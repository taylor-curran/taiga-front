import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { fetchComments, fetchActivityPage, postDeleteComment } from '../../api/historyApi';

describe('historyApi', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve(
          new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      ),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('fetchComments hits history/userstory with type=comment', async () => {
    await fetchComments('tok', 'us', 42);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/history\/userstory\/42\?type=comment$/),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer tok' }),
      }),
    );
  });

  it('fetchActivityPage requests activity type and page', async () => {
    await fetchActivityPage(null, 'issue', 7, 2);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/history\/issue\/7\?type=activity&page=2$/),
      expect.any(Object),
    );
  });

  it('postDeleteComment POSTs to delete_comment with id query', async () => {
    await postDeleteComment('t', 'task', 9, 100);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/v1\/history\/task\/9\/delete_comment\?id=100$/),
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
