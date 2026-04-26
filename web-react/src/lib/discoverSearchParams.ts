/** Same mapping as `DiscoverSearchController#getFilter` in Angular. */
export function filterParamsForDiscover(filter: string): Record<string, boolean> {
  if (filter === 'people') return { is_looking_for_people: true };
  if (filter === 'scrum') return { is_backlog_activated: true };
  if (filter === 'kanban') return { is_kanban_activated: true };
  return {};
}
