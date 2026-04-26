import { describe, expect, it, vi, beforeEach } from 'vitest';
import { dutyTypeLabel, loadWorkInProgress } from './homeDashboard';
import { taigaGet } from './taigaClient';

vi.mock('./taigaClient', () => ({
  taigaGet: vi.fn(),
}));

const mockGet = vi.mocked(taigaGet);

describe('homeDashboard', () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  it('dutyTypeLabel returns English labels for duty _name (parity with $translate keys)', () => {
    expect(dutyTypeLabel('epics')).toBe('Epic');
    expect(dutyTypeLabel('userstories')).toBe('User story');
    expect(dutyTypeLabel('tasks')).toBe('Task');
    expect(dutyTypeLabel('issues')).toBe('Issue');
  });

  it('loadWorkInProgress filters by project membership, attaches projectInfo, and sorts by modified_date', async () => {
    mockGet.mockImplementation((path: string, params?: Record<string, string | number | boolean>) => {
      if (path === '/api/v1/projects') {
        return Promise.resolve([{ id: 1, name: 'Sample', slug: 'scrum' }]);
      }
      if (path === '/api/v1/userstories' && params?.assigned_users != null) {
        return Promise.resolve([
          { id: 1, ref: 5, project: 1, subject: 'Old', modified_date: '2019-01-01T00:00:00Z' },
          { id: 2, ref: 6, project: 1, subject: 'New', modified_date: '2020-01-01T00:00:00Z' },
        ]);
      }
      if (path === '/api/v1/userstories' && params?.watchers != null) {
        return Promise.resolve([{ id: 3, ref: 7, project: 1, subject: 'W', modified_date: '2019-06-01T00:00:00Z' }]);
      }
      if (path === '/api/v1/userstories' && (params as { dashboard?: string })?.dashboard) {
        // should not match above because assigned uses assigned_users; keep empty for stray calls
        return Promise.resolve([]);
      }
      if (path === '/api/v1/userstories') {
        return Promise.resolve([]);
      }
      if (path === '/api/v1/epics' || path === '/api/v1/tasks' || path === '/api/v1/issues') {
        return Promise.resolve([]);
      }
      return Promise.reject(new Error(`unexpected ${path} ${JSON.stringify(params)}`));
    });

    const w = await loadWorkInProgress(1);
    expect(w.assignedTo.map((d) => d.id)).toEqual([2, 1]);
    expect(w.assignedTo[0]!.ref).toBe(6);
    expect(w.assignedTo[0]!._name).toBe('userstories');
    expect(w.assignedTo[0]!.projectInfo.slug).toBe('scrum');
    expect(w.watching[0]!.id).toBe(3);
  });
});
