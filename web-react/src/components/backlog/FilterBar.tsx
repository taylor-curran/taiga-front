import { useState } from 'react';
import type { ProjectDetail } from '@/types/api';

export interface BacklogFilters {
  status?: number;
  assigned_to?: number;
  tags?: string;
  q?: string;
}

interface FilterBarProps {
  project: ProjectDetail;
  filters: BacklogFilters;
  onFiltersChange: (filters: BacklogFilters) => void;
  totalCount: number;
  filteredCount: number;
}

export function FilterBar({
  project,
  filters,
  onFiltersChange,
  totalCount,
  filteredCount,
}: FilterBarProps) {
  const [expanded, setExpanded] = useState(false);

  const hasFilters = !!(filters.status || filters.assigned_to || filters.tags);

  return (
    <div className="backlog-filter-bar">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className={`btn-filter flex items-center gap-1.5 px-3 py-1.5 rounded text-sm border transition ${
            hasFilters
              ? 'border-taiga-primary text-taiga-primary bg-taiga-primary/5'
              : 'border-taiga-grey-lighter text-taiga-grey-light hover:border-taiga-primary'
          }`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
          </svg>
          <span>{expanded ? 'Hide Filters' : 'Filters'}</span>
          {hasFilters && (
            <span className="ml-1 w-5 h-5 rounded-full bg-taiga-primary text-white text-xs flex items-center justify-center">
              {[filters.status, filters.assigned_to, filters.tags].filter(Boolean).length}
            </span>
          )}
        </button>

        <div className="relative">
          <input
            type="text"
            placeholder="Search stories..."
            value={filters.q ?? ''}
            onChange={(e) => onFiltersChange({ ...filters, q: e.target.value || undefined })}
            className="text-sm border border-taiga-grey-lighter rounded px-3 py-1.5 w-56 focus:outline-none focus:border-taiga-primary"
          />
        </div>

        {hasFilters && (
          <span className="text-xs text-taiga-grey-light">
            Showing {filteredCount} of {totalCount} stories
          </span>
        )}

        {hasFilters && (
          <button
            onClick={() => onFiltersChange({})}
            className="text-xs text-red-500 hover:text-red-700"
          >
            Clear all
          </button>
        )}
      </div>

      {expanded && (
        <div className="mt-3 flex flex-wrap gap-4 p-3 bg-taiga-bg/60 rounded border border-taiga-grey-lighter/40">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-taiga-grey-light uppercase">Status</label>
            <select
              value={filters.status ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="text-sm border border-taiga-grey-lighter rounded px-2 py-1"
            >
              <option value="">All statuses</option>
              {project.us_statuses?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-taiga-grey-light uppercase">Assigned to</label>
            <select
              value={filters.assigned_to ?? ''}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  assigned_to: e.target.value ? Number(e.target.value) : undefined,
                })
              }
              className="text-sm border border-taiga-grey-lighter rounded px-2 py-1"
            >
              <option value="">Anyone</option>
              {project.members
                ?.filter((m) => m.is_active)
                .map((m) => (
                  <option key={m.id} value={m.user}>
                    {m.full_name || m.username || m.user_email}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-taiga-grey-light uppercase">Tags</label>
            <input
              type="text"
              placeholder="tag1, tag2"
              value={filters.tags ?? ''}
              onChange={(e) =>
                onFiltersChange({ ...filters, tags: e.target.value || undefined })
              }
              className="text-sm border border-taiga-grey-lighter rounded px-2 py-1 w-40"
            />
          </div>
        </div>
      )}
    </div>
  );
}
