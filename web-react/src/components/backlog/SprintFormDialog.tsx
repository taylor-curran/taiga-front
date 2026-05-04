import { useState, useEffect } from 'react';
import type { Milestone } from '@/types/api';

interface SprintFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; estimated_start: string; estimated_finish: string }) => void;
  editing?: Milestone | null;
}

export function SprintFormDialog({ open, onClose, onSubmit, editing }: SprintFormDialogProps) {
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [finish, setFinish] = useState('');

  useEffect(() => {
    if (editing) {
      setName(editing.name);
      setStart(editing.estimated_start ?? '');
      setFinish(editing.estimated_finish ?? '');
    } else {
      setName('');
      const today = new Date().toISOString().split('T')[0];
      const twoWeeks = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      setStart(today);
      setFinish(twoWeeks);
    }
  }, [editing, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !start || !finish) return;
    onSubmit({ name: name.trim(), estimated_start: start, estimated_finish: finish });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {editing ? 'Edit Sprint' : 'New Sprint'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-taiga-text mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-taiga-grey-lighter rounded px-3 py-2 text-sm focus:outline-none focus:border-taiga-primary"
              placeholder="Sprint name"
              autoFocus
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-taiga-text mb-1">Start</label>
              <input
                type="date"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full border border-taiga-grey-lighter rounded px-3 py-2 text-sm focus:outline-none focus:border-taiga-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-taiga-text mb-1">End</label>
              <input
                type="date"
                value={finish}
                onChange={(e) => setFinish(e.target.value)}
                className="w-full border border-taiga-grey-lighter rounded px-3 py-2 text-sm focus:outline-none focus:border-taiga-primary"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border border-taiga-grey-lighter text-taiga-grey-light hover:bg-taiga-bg/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm rounded bg-taiga-primary text-white hover:bg-taiga-primary/90"
            >
              {editing ? 'Save' : 'Create Sprint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
