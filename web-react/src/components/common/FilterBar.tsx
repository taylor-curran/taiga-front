import { ReactNode } from 'react';

export interface FilterDef {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface FilterBarProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear?: () => void;
  children?: ReactNode;
}

export function FilterBar({ filters, values, onChange, onClear, children }: FilterBarProps) {
  const hasActive = Object.values(values).some((v) => v !== '');

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {filters.map((f) => (
        <select
          key={f.key}
          value={values[f.key] || ''}
          onChange={(e) => onChange(f.key, e.target.value)}
          className="input w-auto min-w-[140px]"
          aria-label={f.label}
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {hasActive && onClear && (
        <button className="btn-ghost text-xs" onClick={onClear}>
          Clear filters
        </button>
      )}
      {children}
    </div>
  );
}
