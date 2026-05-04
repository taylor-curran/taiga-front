import { useState, useCallback } from 'react';
import type { IssueFiltersData } from '@/types/api';

export interface ActiveFilter {
  category: string;
  id: string;
  name: string;
  color?: string | null;
  mode?: 'include' | 'exclude';
}

interface SavedFilter {
  name: string;
  filter: Record<string, string>;
}

interface IssueFilterBarProps {
  filtersData: IssueFiltersData | undefined;
  activeFilters: ActiveFilter[];
  filterQ: string;
  savedFilters: SavedFilter[];
  onAddFilter: (category: string, id: string, mode?: 'include' | 'exclude') => void;
  onRemoveFilter: (filter: ActiveFilter) => void;
  onChangeQ: (q: string) => void;
  onSelectSavedFilter: (filter: SavedFilter) => void;
  onSaveFilter: (name: string) => void;
  onDeleteSavedFilter: (filter: SavedFilter) => void;
}

const FILTER_CATEGORIES = [
  { key: 'type', label: 'Type', dataKey: 'types' as const },
  { key: 'severity', label: 'Severity', dataKey: 'severities' as const },
  { key: 'priority', label: 'Priority', dataKey: 'priorities' as const },
  { key: 'status', label: 'Status', dataKey: 'statuses' as const },
  { key: 'tags', label: 'Tags', dataKey: 'tags' as const },
  { key: 'assigned_to', label: 'Assigned to', dataKey: 'assigned_to' as const },
  { key: 'owner', label: 'Created by', dataKey: 'owners' as const },
  { key: 'role', label: 'Role', dataKey: 'roles' as const },
];

export function IssueFilterBar({
  filtersData,
  activeFilters,
  filterQ,
  savedFilters,
  onAddFilter,
  onRemoveFilter,
  onChangeQ,
  onSelectSavedFilter,
  onSaveFilter,
  onDeleteSavedFilter,
}: IssueFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);

  const handleSave = useCallback(() => {
    if (saveName.trim()) {
      onSaveFilter(saveName.trim());
      setSaveName('');
      setShowSave(false);
    }
  }, [saveName, onSaveFilter]);

  const getFilterItems = (cat: (typeof FILTER_CATEGORIES)[number]) => {
    if (!filtersData) return [];
    const raw = filtersData[cat.dataKey];
    if (!raw) return [];
    return (raw as Array<Record<string, unknown>>).map((item) => ({
      id: String(
        cat.dataKey === 'tags'
          ? (item as { name: string }).name
          : (item as { id: unknown }).id ?? 'null',
      ),
      name: String(
        (item as { name?: string; full_name?: string }).full_name ??
          (item as { name?: string }).name ??
          'Unassigned',
      ),
      color: (item as { color?: string | null }).color ?? null,
      count: (item as { count: number }).count,
    }));
  };

  const isActive = (category: string, id: string) =>
    activeFilters.some((f) => f.category === category && f.id === id);

  return (
    <div className="space-y-2">
      {/* Search + toggle */}
      <div className="flex items-center gap-2">
        <input
          className="input flex-1 max-w-xs"
          placeholder="Search issues..."
          value={filterQ}
          onChange={(e) => onChangeQ(e.target.value)}
        />
        <button
          className="btn btn-sm"
          onClick={() => setIsOpen(!isOpen)}
          title="Toggle filters"
        >
          Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>
        {savedFilters.length > 0 && (
          <select
            className="input max-w-[200px] text-sm"
            value=""
            onChange={(e) => {
              const sf = savedFilters.find((f) => f.name === e.target.value);
              if (sf) onSelectSavedFilter(sf);
            }}
          >
            <option value="">Saved filters...</option>
            {savedFilters.map((sf) => (
              <option key={sf.name} value={sf.name}>
                {sf.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Active filter pills */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {activeFilters.map((f, i) => (
            <span
              key={`${f.category}-${f.id}-${i}`}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: f.color ? `${f.color}22` : '#e5e7eb',
                color: f.color || '#374151',
                border: f.mode === 'exclude' ? '1px dashed #e44057' : undefined,
              }}
            >
              {f.mode === 'exclude' && <span className="text-taiga-red">NOT</span>}
              {f.name}
              <button
                className="ml-0.5 hover:text-taiga-red"
                onClick={() => onRemoveFilter(f)}
                title="Remove filter"
              >
                x
              </button>
            </span>
          ))}
          {activeFilters.length > 0 && (
            <button
              className="text-xs text-taiga-grey-light hover:text-taiga-red ml-1"
              onClick={() => activeFilters.forEach((f) => onRemoveFilter(f))}
            >
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Filter panel */}
      {isOpen && (
        <div className="card p-4">
          <div className="flex gap-4 flex-wrap">
            {FILTER_CATEGORIES.map((cat) => {
              const items = getFilterItems(cat);
              if (items.length === 0) return null;
              return (
                <div key={cat.key} className="min-w-[160px]">
                  <button
                    className="text-sm font-semibold text-taiga-text mb-1 hover:text-taiga-link flex items-center gap-1"
                    onClick={() =>
                      setOpenCategory(openCategory === cat.key ? null : cat.key)
                    }
                  >
                    {cat.label}
                    <span className="text-xs text-taiga-grey-light">
                      {openCategory === cat.key ? '\u25B2' : '\u25BC'}
                    </span>
                  </button>
                  {openCategory === cat.key && (
                    <ul className="space-y-0.5 max-h-48 overflow-y-auto">
                      {items.map((item) => (
                        <li key={item.id} className="flex items-center gap-1.5 text-xs">
                          {item.color && (
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ backgroundColor: item.color }}
                            />
                          )}
                          <button
                            className={`truncate hover:text-taiga-link ${
                              isActive(cat.key, item.id)
                                ? 'font-bold text-taiga-green-dark'
                                : 'text-taiga-text'
                            }`}
                            onClick={() => onAddFilter(cat.key, item.id)}
                          >
                            {item.name}
                          </button>
                          <span className="text-taiga-grey-lighter ml-auto">{item.count}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>

          {/* Save filter */}
          <div className="mt-3 pt-3 border-t border-taiga-grey-lighter/40 flex items-center gap-2">
            {showSave ? (
              <>
                <input
                  className="input text-sm max-w-[200px]"
                  placeholder="Filter name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                />
                <button className="btn btn-sm btn-primary" onClick={handleSave}>
                  Save
                </button>
                <button
                  className="btn btn-sm"
                  onClick={() => {
                    setShowSave(false);
                    setSaveName('');
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="text-xs text-taiga-link hover:underline"
                onClick={() => setShowSave(true)}
              >
                Save current filters
              </button>
            )}
            {savedFilters.map((sf) => (
              <span
                key={sf.name}
                className="inline-flex items-center gap-1 text-xs bg-taiga-bg px-2 py-0.5 rounded"
              >
                {sf.name}
                <button
                  className="text-taiga-red hover:text-taiga-red/80"
                  onClick={() => onDeleteSavedFilter(sf)}
                  title="Delete saved filter"
                >
                  x
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
