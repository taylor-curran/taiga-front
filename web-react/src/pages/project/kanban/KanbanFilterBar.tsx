import { useMemo } from 'react';
import clsx from 'clsx';
import type { ProjectDetail, UserStory, Epic, Membership } from '@/types/api';
import { useKanbanStore } from './useKanbanStore';

interface KanbanFilterBarProps {
  project: ProjectDetail;
  stories: UserStory[];
  epics?: Epic[];
}

export function KanbanFilterBar({ project, stories, epics }: KanbanFilterBarProps) {
  const filters = useKanbanStore((s) => s.filters);
  const setFilter = useKanbanStore((s) => s.setFilter);
  const clearFilters = useKanbanStore((s) => s.clearFilters);

  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    for (const s of stories) {
      if (s.tags) {
        for (const tag of s.tags) {
          const name = Array.isArray(tag) ? tag[0] : tag;
          tags.add(name);
        }
      }
    }
    return Array.from(tags).sort();
  }, [stories]);

  const activeMembers = useMemo(() => {
    return (project.members ?? []).filter((m) => m.is_active);
  }, [project.members]);

  const activeFiltersCount =
    filters.assignedUsers.length +
    filters.tags.length +
    filters.epics.length +
    filters.owners.length +
    (filters.q ? 1 : 0);

  const toggleArrayFilter = <K extends 'assignedUsers' | 'tags' | 'epics' | 'owners' | 'roles'>(
    key: K,
    value: K extends 'tags' ? string : number,
  ) => {
    const arr = filters[key] as (string | number)[];
    const next = arr.includes(value)
      ? arr.filter((v) => v !== value)
      : [...arr, value];
    setFilter(key, next as typeof filters[K]);
  };

  return (
    <div className="bg-white border border-taiga-grey-lighter rounded p-4 mb-4 space-y-3">
      {/* Search input */}
      <div className="flex items-center gap-3">
        <input
          type="text"
          placeholder="Search stories..."
          className="input max-w-xs"
          value={filters.q}
          onChange={(e) => setFilter('q', e.target.value)}
        />
        {activeFiltersCount > 0 && (
          <button
            className="text-xs text-taiga-red hover:underline"
            onClick={clearFilters}
          >
            Clear all ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Assigned users filter */}
      {activeMembers.length > 0 && (
        <div>
          <h5 className="text-[11px] font-semibold text-taiga-grey mb-1 uppercase tracking-wide">
            Assigned to
          </h5>
          <div className="flex flex-wrap gap-1">
            {activeMembers.map((m: Membership) => (
              <button
                key={m.id}
                className={clsx(
                  'badge cursor-pointer transition-colors',
                  filters.assignedUsers.includes(m.user ?? m.id)
                    ? 'bg-taiga-green-dark text-white'
                    : 'hover:bg-taiga-grey-lighter',
                )}
                onClick={() => toggleArrayFilter('assignedUsers', m.user ?? m.id)}
              >
                {m.full_name || m.username || m.user_email || `User ${m.id}`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tags filter */}
      {availableTags.length > 0 && (
        <div>
          <h5 className="text-[11px] font-semibold text-taiga-grey mb-1 uppercase tracking-wide">
            Tags
          </h5>
          <div className="flex flex-wrap gap-1">
            {availableTags.map((tag) => (
              <button
                key={tag}
                className={clsx(
                  'badge cursor-pointer transition-colors',
                  filters.tags.includes(tag)
                    ? 'bg-taiga-green-dark text-white'
                    : 'hover:bg-taiga-grey-lighter',
                )}
                onClick={() => toggleArrayFilter('tags', tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Epics filter */}
      {epics && epics.length > 0 && (
        <div>
          <h5 className="text-[11px] font-semibold text-taiga-grey mb-1 uppercase tracking-wide">
            Epics
          </h5>
          <div className="flex flex-wrap gap-1">
            {epics.map((epic) => (
              <button
                key={epic.id}
                className={clsx(
                  'badge cursor-pointer transition-colors',
                  filters.epics.includes(epic.id)
                    ? 'text-white'
                    : 'hover:bg-taiga-grey-lighter',
                )}
                style={
                  filters.epics.includes(epic.id) && epic.color
                    ? { backgroundColor: epic.color }
                    : undefined
                }
                onClick={() => toggleArrayFilter('epics', epic.id)}
              >
                #{epic.ref} {epic.subject}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
