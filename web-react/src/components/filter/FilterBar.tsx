import { useState, useCallback } from 'react';
import clsx from 'clsx';

export interface FilterOption {
  id: number | string;
  name: string;
  color?: string;
  count?: number;
}

export interface FilterCategory {
  key: string;
  label: string;
  options: FilterOption[];
}

export interface ActiveFilter {
  category: string;
  id: number | string;
  name: string;
  color?: string;
  mode: 'include' | 'exclude';
}

export interface SavedFilter {
  name: string;
  filters: ActiveFilter[];
}

interface FilterBarProps {
  categories: FilterCategory[];
  activeFilters: ActiveFilter[];
  savedFilters?: SavedFilter[];
  onAddFilter: (filter: ActiveFilter) => void;
  onRemoveFilter: (filter: ActiveFilter) => void;
  onClearAll: () => void;
  onSaveFilter?: (name: string) => void;
  onLoadFilter?: (saved: SavedFilter) => void;
  onDeleteSavedFilter?: (name: string) => void;
  className?: string;
}

export function FilterBar({
  categories,
  activeFilters,
  savedFilters,
  onAddFilter,
  onRemoveFilter,
  onClearAll,
  onSaveFilter,
  onLoadFilter,
  onDeleteSavedFilter,
  className,
}: FilterBarProps) {
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'include' | 'exclude'>('include');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveName, setSaveName] = useState('');

  const toggleCategory = useCallback(
    (key: string) => {
      setOpenCategory(openCategory === key ? null : key);
    },
    [openCategory],
  );

  const isSelected = (categoryKey: string, optionId: number | string) =>
    activeFilters.some((f) => f.category === categoryKey && f.id === optionId);

  const handleSelectOption = (category: FilterCategory, option: FilterOption) => {
    if (isSelected(category.key, option.id)) {
      const existing = activeFilters.find(
        (f) => f.category === category.key && f.id === option.id,
      )!;
      onRemoveFilter(existing);
    } else {
      onAddFilter({
        category: category.key,
        id: option.id,
        name: option.name,
        color: option.color,
        mode: filterMode,
      });
    }
  };

  const handleSave = () => {
    if (saveName.trim() && onSaveFilter) {
      onSaveFilter(saveName.trim());
      setSaveName('');
      setShowSaveForm(false);
    }
  };

  return (
    <div className={clsx('space-y-2', className)}>
      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {activeFilters.map((f) => (
            <span
              key={`${f.category}-${f.id}`}
              className={clsx(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium',
                f.mode === 'exclude'
                  ? 'bg-taiga-red/10 text-taiga-red'
                  : 'bg-taiga-green-dark/10 text-taiga-green-darker',
              )}
              style={f.color ? { borderLeft: `3px solid ${f.color}` } : undefined}
            >
              <span className="text-[10px] uppercase text-taiga-grey-light">
                {f.category}:
              </span>
              {f.name}
              <button
                type="button"
                onClick={() => onRemoveFilter(f)}
                className="ml-0.5 hover:text-taiga-red"
              >
                {'\u00D7'}
              </button>
            </span>
          ))}
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs text-taiga-grey hover:text-taiga-red"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Category dropdowns + mode toggle */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filter mode toggle */}
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setFilterMode('include')}
            className={clsx(
              'px-2 py-0.5 rounded',
              filterMode === 'include'
                ? 'bg-taiga-green-dark text-white'
                : 'text-taiga-grey hover:bg-taiga-bg',
            )}
          >
            Include
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('exclude')}
            className={clsx(
              'px-2 py-0.5 rounded',
              filterMode === 'exclude'
                ? 'bg-taiga-red text-white'
                : 'text-taiga-grey hover:bg-taiga-bg',
            )}
          >
            Exclude
          </button>
        </div>

        {categories.map((cat) => (
          <div key={cat.key} className="relative">
            <button
              type="button"
              onClick={() => toggleCategory(cat.key)}
              className={clsx(
                'btn-ghost text-xs',
                openCategory === cat.key && 'bg-taiga-grey-lighter/40',
              )}
            >
              {cat.label}
              {activeFilters.filter((f) => f.category === cat.key).length > 0 && (
                <span className="ml-1 bg-taiga-green-dark text-white rounded-full px-1.5 text-[10px]">
                  {activeFilters.filter((f) => f.category === cat.key).length}
                </span>
              )}
            </button>
            {openCategory === cat.key && (
              <ul className="absolute z-20 left-0 mt-1 bg-white border border-taiga-grey-lighter rounded shadow-lg max-h-60 overflow-y-auto w-52">
                {cat.options.map((opt) => (
                  <li key={opt.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectOption(cat, opt)}
                      className={clsx(
                        'w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-taiga-bg',
                        isSelected(cat.key, opt.id) && 'bg-taiga-green-dark/5',
                      )}
                    >
                      {opt.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: opt.color }}
                        />
                      )}
                      <span className="flex-1 truncate">{opt.name}</span>
                      {opt.count !== undefined && (
                        <span className="text-xs text-taiga-grey-light">{opt.count}</span>
                      )}
                      {isSelected(cat.key, opt.id) && (
                        <span className="text-taiga-green-dark text-xs">{'\u2713'}</span>
                      )}
                    </button>
                  </li>
                ))}
                {cat.options.length === 0 && (
                  <li className="px-3 py-2 text-xs text-taiga-grey-light">
                    No options available
                  </li>
                )}
              </ul>
            )}
          </div>
        ))}

        {/* Saved filters */}
        {savedFilters && savedFilters.length > 0 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleCategory('__saved')}
              className="btn-ghost text-xs"
            >
              Saved filters
            </button>
            {openCategory === '__saved' && (
              <ul className="absolute z-20 left-0 mt-1 bg-white border border-taiga-grey-lighter rounded shadow-lg max-h-60 overflow-y-auto w-52">
                {savedFilters.map((sf) => (
                  <li key={sf.name} className="flex items-center">
                    <button
                      type="button"
                      onClick={() => onLoadFilter?.(sf)}
                      className="flex-1 text-left px-3 py-1.5 text-sm hover:bg-taiga-bg truncate"
                    >
                      {sf.name}
                    </button>
                    {onDeleteSavedFilter && (
                      <button
                        type="button"
                        onClick={() => onDeleteSavedFilter(sf.name)}
                        className="text-xs text-taiga-red px-2"
                      >
                        {'\u00D7'}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Save current filter */}
        {onSaveFilter && activeFilters.length > 0 && (
          <>
            {showSaveForm ? (
              <div className="flex items-center gap-1">
                <input
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  placeholder="Filter name"
                  className="input w-32 text-xs"
                  autoFocus
                />
                <button type="button" onClick={handleSave} className="text-xs text-taiga-green-dark">
                  Save
                </button>
                <button type="button" onClick={() => setShowSaveForm(false)} className="text-xs text-taiga-grey">
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowSaveForm(true)}
                className="text-xs text-taiga-link hover:underline"
              >
                Save filter
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
