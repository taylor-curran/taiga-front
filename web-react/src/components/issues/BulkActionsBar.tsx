import { useState, useEffect } from 'react';
import type { ProjectDetail } from '@/types/api';

interface BulkActionsBarProps {
  count: number;
  project: ProjectDetail;
  onChangeStatus: (statusId: number) => void;
  onAssign: (userId: number | null) => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionsBar({
  count,
  project,
  onChangeStatus,
  onAssign,
  onDelete,
  onClear,
}: BulkActionsBarProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setConfirmDelete(false);
  }, [count]);

  const statuses = project.issue_statuses ?? [];
  const members = project.members ?? [];

  return (
    <div className="card px-4 py-2 flex items-center gap-3 text-sm bg-taiga-green/10 border border-taiga-green-dark/30">
      <span className="font-medium">{count} selected</span>

      <select
        className="input text-sm py-1"
        value=""
        onChange={(e) => {
          if (e.target.value) onChangeStatus(Number(e.target.value));
        }}
      >
        <option value="">Change status...</option>
        {statuses.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <select
        className="input text-sm py-1"
        value=""
        onChange={(e) => {
          const val = e.target.value;
          if (val === 'unassign') onAssign(null);
          else if (val) onAssign(Number(val));
        }}
      >
        <option value="">Assign to...</option>
        <option value="unassign">Unassign</option>
        {members.map((m) => (
          <option key={m.id} value={m.user ?? m.id}>
            {m.full_name || m.username || `Member #${m.id}`}
          </option>
        ))}
      </select>

      {confirmDelete ? (
        <span className="flex items-center gap-1">
          <span className="text-taiga-red font-medium">Confirm delete?</span>
          <button className="btn btn-sm bg-taiga-red text-white hover:bg-taiga-red/80" onClick={onDelete}>
            Yes
          </button>
          <button className="btn btn-sm" onClick={() => setConfirmDelete(false)}>
            No
          </button>
        </span>
      ) : (
        <button
          className="btn btn-sm text-taiga-red hover:bg-taiga-red/10"
          onClick={() => setConfirmDelete(true)}
        >
          Delete
        </button>
      )}

      <button className="btn btn-sm ml-auto" onClick={onClear}>
        Clear selection
      </button>
    </div>
  );
}
