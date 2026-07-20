import { describe, expect, it } from 'vitest';
import { filterParamsForDiscover } from './discoverSearchParams';

describe('filterParamsForDiscover', () => {
  it('matches Angular getFilter branches', () => {
    expect(filterParamsForDiscover('all')).toEqual({});
    expect(filterParamsForDiscover('people')).toEqual({ is_looking_for_people: true });
    expect(filterParamsForDiscover('scrum')).toEqual({ is_backlog_activated: true });
    expect(filterParamsForDiscover('kanban')).toEqual({ is_kanban_activated: true });
  });
});
