import clsx from 'clsx';

export interface TabItem {
  key: string;
  label: string;
  disabled?: boolean;
}

interface TabProps {
  tabs: TabItem[];
  active: string;
  onChange: (key: string) => void;
}

export function Tab({ tabs, active, onChange }: TabProps) {
  return (
    <div className="flex border-b border-link-primary mb-4 bg-gray-100" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          disabled={tab.disabled}
          onClick={() => onChange(tab.key)}
          className={clsx(
            'px-4 py-2 text-sm font-semibold relative cursor-pointer transition-colors',
            active === tab.key
              ? 'bg-white border border-link-primary border-b-white rounded-t-taiga text-link-primary'
              : 'text-gray-700 hover:text-link-primary',
            tab.disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
