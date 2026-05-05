import { useState } from 'react';
import type { ValueItem } from '@/types/admin';

interface ValuesListProps {
  title: string;
  description?: string;
  values: ValueItem[];
  isLoading: boolean;
  showColor?: boolean;
  showClosed?: boolean;
  showWipLimit?: boolean;
  showValue?: boolean;
  onCreate: (data: Partial<ValueItem>) => void;
  onUpdate: (data: Partial<ValueItem> & { id: number }) => void;
  onDelete: (id: number) => void;
  isCreating?: boolean;
}

const DEFAULT_COLORS = [
  '#A9AABC', '#70B7BA', '#A01919', '#D35E0F', '#E47C40',
  '#E4CE40', '#A8E440', '#5DC753', '#40A8E4', '#4054E4',
  '#A040E4', '#E44092',
];

export function ValuesList({
  title,
  description,
  values,
  isLoading,
  showColor = true,
  showClosed = false,
  showWipLimit = false,
  showValue = false,
  onCreate,
  onUpdate,
  onDelete,
  isCreating,
}: ValuesListProps) {
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(DEFAULT_COLORS[0]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const sorted = [...values].sort((a, b) => a.order - b.order);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const maxOrder = values.length > 0 ? Math.max(...values.map((v) => v.order)) + 1 : 1;
    onCreate({ name: newName.trim(), color: showColor ? newColor : undefined, order: maxOrder });
    setNewName('');
  };

  const startEdit = (item: ValueItem) => {
    setEditingId(item.id);
    setEditName(item.name);
    setEditColor(item.color ?? DEFAULT_COLORS[0]);
  };

  const saveEdit = () => {
    if (editingId === null) return;
    onUpdate({
      id: editingId,
      name: editName,
      ...(showColor ? { color: editColor } : {}),
    });
    setEditingId(null);
  };

  if (isLoading) {
    return <div className="text-taiga-grey-light p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-taiga-grey-light mt-1">{description}</p>}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-taiga-bg bg-taiga-bg/50 text-left">
              {showColor && <th className="px-4 py-2 w-8" />}
              <th className="px-4 py-2">Name</th>
              {showValue && <th className="px-4 py-2 w-24">Value</th>}
              {showClosed && <th className="px-4 py-2 w-20">Closed</th>}
              {showWipLimit && <th className="px-4 py-2 w-28">WIP Limit</th>}
              <th className="px-4 py-2 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id} className="border-b border-taiga-bg last:border-0 hover:bg-taiga-bg/30">
                {showColor && (
                  <td className="px-4 py-2">
                    {editingId === item.id ? (
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-6 h-6 p-0 border-0 cursor-pointer"
                      />
                    ) : (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: item.color ?? '#A9AABC' }}
                      />
                    )}
                  </td>
                )}
                <td className="px-4 py-2">
                  {editingId === item.id ? (
                    <input
                      type="text"
                      className="input w-full"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                      autoFocus
                    />
                  ) : (
                    <span>{item.name}</span>
                  )}
                </td>
                {showValue && (
                  <td className="px-4 py-2 text-taiga-grey-light">
                    {item.value ?? '-'}
                  </td>
                )}
                {showClosed && (
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      checked={item.is_closed ?? false}
                      onChange={(e) => onUpdate({ id: item.id, is_closed: e.target.checked })}
                    />
                  </td>
                )}
                {showWipLimit && (
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      className="input w-20 text-xs"
                      defaultValue={item.wip_limit ?? ''}
                      placeholder="None"
                      onBlur={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null;
                        onUpdate({ id: item.id, wip_limit: val });
                      }}
                    />
                  </td>
                )}
                <td className="px-4 py-2 text-right">
                  {editingId === item.id ? (
                    <div className="flex justify-end gap-1">
                      <button type="button" className="text-taiga-green-dark text-xs" onClick={saveEdit}>
                        Save
                      </button>
                      <button
                        type="button"
                        className="text-taiga-grey text-xs"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : confirmDeleteId === item.id ? (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="text-taiga-red text-xs"
                        onClick={() => {
                          onDelete(item.id);
                          setConfirmDeleteId(null);
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        className="text-taiga-grey text-xs"
                        onClick={() => setConfirmDeleteId(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        className="text-taiga-link text-xs"
                        onClick={() => startEdit(item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-taiga-red text-xs"
                        onClick={() => setConfirmDeleteId(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-taiga-grey-light">
                  No items yet. Add one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-2">Add New</h3>
        <form onSubmit={handleAdd} className="flex items-end gap-3">
          {showColor && (
            <div>
              <label className="block text-xs font-medium mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-8 h-8 p-0 border-0 cursor-pointer"
                />
                <div className="flex gap-1 flex-wrap">
                  {DEFAULT_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className="w-4 h-4 rounded-full border border-transparent hover:border-taiga-grey"
                      style={{ backgroundColor: c }}
                      onClick={() => setNewColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Name</label>
            <input
              type="text"
              className="input w-full"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter name..."
            />
          </div>
          <button type="submit" className="btn-primary shrink-0" disabled={isCreating}>
            {isCreating ? 'Adding...' : 'Add'}
          </button>
        </form>
      </div>
    </div>
  );
}
