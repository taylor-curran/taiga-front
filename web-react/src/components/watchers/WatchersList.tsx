import { useState } from 'react';
import clsx from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import type { Watcher } from '@/types/api';

interface WatchersListProps {
  watchers: Watcher[];
  onAdd?: (userId: number) => void;
  onRemove?: (userId: number) => void;
  /** Available project members to add as watchers */
  members?: { id: number; full_name?: string; photo?: string | null; username?: string }[];
  className?: string;
}

export function WatchersList({
  watchers,
  onAdd,
  onRemove,
  members = [],
  className,
}: WatchersListProps) {
  const [showPicker, setShowPicker] = useState(false);

  const nonWatcherMembers = members.filter(
    (m) => !watchers.some((w) => w.id === m.id),
  );

  return (
    <div className={clsx('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-taiga-text uppercase tracking-wide">
          Watchers ({watchers.length})
        </span>
        {onAdd && nonWatcherMembers.length > 0 && (
          <button
            type="button"
            onClick={() => setShowPicker(!showPicker)}
            className="text-xs text-taiga-link hover:underline"
          >
            {showPicker ? 'Close' : '+ Add'}
          </button>
        )}
      </div>

      {/* Watcher list */}
      <div className="flex flex-wrap gap-1.5">
        {watchers.map((w) => (
          <div
            key={w.id}
            className="group relative"
            title={w.full_name ?? w.username}
          >
            <Avatar name={w.full_name ?? w.username} src={w.photo} size={28} />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(w.id)}
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-taiga-red text-white text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                {'\u00D7'}
              </button>
            )}
          </div>
        ))}
        {watchers.length === 0 && (
          <span className="text-xs text-taiga-grey-light italic">No watchers</span>
        )}
      </div>

      {/* Member picker */}
      {showPicker && (
        <ul className="border border-taiga-grey-lighter rounded max-h-40 overflow-y-auto">
          {nonWatcherMembers.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  onAdd?.(m.id);
                  setShowPicker(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm flex items-center gap-2 hover:bg-taiga-bg"
              >
                <Avatar name={m.full_name} src={m.photo} size={20} />
                <span className="truncate">{m.full_name ?? m.username}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
