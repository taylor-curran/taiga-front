import { describe, expect, it } from 'vitest';
import type { FixtureDb } from './mockDb';
import { tryMockResponse } from './mockResponses';

const miniDb: FixtureDb = {
  user: { id: 1 },
  projects: [{ id: 10, name: 'Alpha Project', slug: 'alpha' } as Record<string, unknown>],
  memberships: [],
  roles: [],
  userstory: {},
  task: {},
  issue: {},
  epic: {},
};

describe('tryMockResponse', () => {
  it('matches absolute browser URLs and returns fixture projects list', async () => {
    const url = 'http://127.0.0.1:5174/api/v1/projects?member=1&order_by=user_order&slight=true';
    const res = await tryMockResponse(url, miniDb);
    expect(res).not.toBeNull();
    const data = (await res!.json()) as { name: string }[];
    expect(data[0].name).toBe('Alpha Project');
  });
});
