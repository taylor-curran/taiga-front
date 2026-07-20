import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { AdminHistoryPage } from '../AdminHistoryPage';
import { useHistoryStore } from '../historyStore';

describe('AdminHistoryPage', () => {
  beforeEach(() => {
    useHistoryStore.setState({
      token: null,
      contentType: 'us',
      objectId: 0,
      project: null,
      reverseOrder: false,
      viewComments: true,
      comments: [],
      commentsNum: 0,
      activities: [],
      activitiesNum: null,
      activityPage: 1,
      activityHasNext: false,
      loadingComments: false,
      loadingActivity: false,
      deleting: null,
      editing: null,
      editMode: {},
      postCommentError: null,
      postingComment: false,
    });
    vi.stubGlobal(
      'fetch',
      vi.fn((input: RequestInfo) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url.includes('/users/me')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ id: 99 }),
          } as Response);
        }
        if (url.includes('type=comment')) {
          return Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                {
                  id: 1,
                  comment: '<p>hello</p>',
                  created_at: '2024-06-01T12:00:00Z',
                  user: { pk: 1, name: 'Alice', photo: null },
                },
              ]),
          } as Response);
        }
        if (url.includes('type=activity')) {
          return Promise.resolve({
            ok: true,
            headers: { get: (h: string) => (h === 'x-pagination-count' ? '1' : null) },
            json: () =>
              Promise.resolve([
                {
                  id: 10,
                  created_at: '2024-06-02T12:00:00Z',
                  user: { pk: 2, name: 'Bob', photo: null },
                  values_diff: { subject: ['a', 'b'] },
                },
              ]),
          } as Response);
        }
        return Promise.resolve({ ok: false, status: 404 } as Response);
      }),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders comment list from API', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/history/us/5?token=fake&perms=comment_us,modify_project']}>
        <Routes>
          <Route path="/admin/history/:contentType/:objectId" element={<AdminHistoryPage />} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument();
    });
    expect(screen.getByText('hello')).toBeInTheDocument();
  });
});
