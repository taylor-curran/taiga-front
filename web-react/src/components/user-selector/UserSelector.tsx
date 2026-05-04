import { useState, useEffect, useCallback } from 'react';
import { Avatar } from '@/components/common/Avatar';

interface Member {
  id: number;
  full_name?: string;
  photo?: string | null;
  username?: string;
  role_name?: string;
}

interface UserSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: number) => void;
  members: Member[];
  title?: string;
}

export function UserSelector({
  open,
  onClose,
  onSelect,
  members,
  title = 'Select a user',
}: UserSelectorProps) {
  const [search, setSearch] = useState('');

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const filtered = members.filter((m) => {
    const q = search.toLowerCase();
    return (
      (m.full_name?.toLowerCase().includes(q) ?? false) ||
      (m.username?.toLowerCase().includes(q) ?? false)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-taiga-grey-lighter">
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-taiga-grey hover:text-taiga-text text-lg leading-none"
          >
            {'\u00D7'}
          </button>
        </div>

        <div className="p-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members..."
            className="input"
            autoFocus
          />
        </div>

        <ul className="max-h-64 overflow-y-auto px-2 pb-3">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => {
                  onSelect(m.id);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 rounded text-sm flex items-center gap-3 hover:bg-taiga-bg"
              >
                <Avatar name={m.full_name} src={m.photo} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {m.full_name ?? m.username}
                  </p>
                  {m.role_name && (
                    <p className="text-xs text-taiga-grey-light">{m.role_name}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-3 py-4 text-center text-sm text-taiga-grey-light">
              No members found
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
