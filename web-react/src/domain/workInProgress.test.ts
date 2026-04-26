import { describe, expect, it } from 'vitest';
import { buildWorkInProgress } from './workInProgress';

describe('buildWorkInProgress', () => {
  it('merges and sorts duties like Angular HomeService + WorkingOnController', () => {
    const projects = [{ id: 10, slug: 'alpha', name: 'Alpha' }];
    const assigned = {
      epics: [],
      userStories: [
        { id: 1, ref: 10, subject: 'US', modified_date: '2024-01-01T00:00:00Z', project: 10 },
      ],
      tasks: [{ id: 2, ref: 11, subject: 'Task', modified_date: '2024-01-03T00:00:00Z', project: 10 }],
      issues: [{ id: 3, ref: 12, subject: 'Issue', modified_date: '2024-01-02T00:00:00Z', project: 10 }],
    };
    const watching = {
      epics: [],
      userStories: [],
      tasks: [],
      issues: [],
    };
    const wip = buildWorkInProgress(projects, assigned, watching);
    expect(wip.assignedTo.map((d) => d.subject)).toEqual(['Task', 'Issue', 'US']);
    expect(wip.assignedTo[0].url).toBe('/project/alpha/task/11');
  });
});
