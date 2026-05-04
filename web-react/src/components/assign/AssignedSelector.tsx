import { useState } from 'react';
import clsx from 'clsx';
import { Avatar } from '@/components/common/Avatar';

interface Member {
  id: number;
  full_name?: string;
  photo?: string | null;
  username?: string;
}

interface AssignedSelectorProps {
  assigned?: Member | null;
  members: Member[];
  onAssign: (userId: number | null) => void;
  className?: string;
}

export function AssignedSelector({
  assigned,
  members,
  onAssign,
  className,
}: AssignedSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.full_name?.toLowerCase().includes(q) ?? false) ||
      (m.username?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div className={clsx('relative', className)}>
      <button
        type="button"
        onClick={() => {
          setOpen(!open);
          setSearch('');
        }}
        className="flex items-center gap-2 text-sm hover:bg-taiga-bg/60 rounded px-2 py-1 w-full text-left"
      >
        {assigned ? (
          <>
            <Avatar name={assigned.full_name} src={assigned.photo} size={24} />
            <span className="truncate">{assigned.full_name ?? assigned.username}</span>
          </>
        ) : (
          <span className="text-taiga-grey-light italic">Unassigned</span>
        )}
      </button>

      {open && (
        <div className="absolute z-20 left-0 mt-1 w-56 bg-white border border-taiga-grey-lighter rounded shadow-lg">
          <div className="p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="input text-xs"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            {/* Unassign option */}
            <li>
              <button
                type="button"
                onClick={() => {
                  onAssign(null);
                  setOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 text-sm hover:bg-taiga-bg flex items-center gap-2 text-taiga-grey-light italic"
              >
                Unassigned
              </button>
            </li>
            {filtered.map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => {
                    onAssign(m.id);
                    setOpen(false);
                  }}
                  className={clsx(
                    'w-full text-left px-3 py-1.5 text-sm hover:bg-taiga-bg flex items-center gap-2',
                    assigned?.id === m.id && 'bg-taiga-green-dark/5',
                  )}
                >
                  <Avatar name={m.full_name} src={m.photo} size={20} />
                  <span className="truncate">{m.full_name ?? m.username}</span>
                  {assigned?.id === m.id && (
                    <span className="text-taiga-green-dark text-xs ml-auto">{'\u2713'}</span>
                  )}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-xs text-taiga-grey-light">
                No members found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
