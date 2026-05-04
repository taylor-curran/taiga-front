import { useState } from 'react';
import type { ProjectDetail, RolePointsEntry } from '@/types/api';

interface PointsEditorProps {
  points: RolePointsEntry | undefined;
  project: ProjectDetail;
  onSave: (points: RolePointsEntry) => void;
}

export function PointsEditor({ points, project, onSave }: PointsEditorProps) {
  const [editing, setEditing] = useState(false);
  const [localPoints, setLocalPoints] = useState<RolePointsEntry>(points ?? {});

  const roles = project.members
    ?.map((m) => ({ id: m.role, name: m.role_name }))
    .filter(
      (r, idx, arr) => r.id != null && arr.findIndex((x) => x.id === r.id) === idx,
    ) ?? [];

  const pointChoices = project.points ?? [];

  const handleSave = () => {
    onSave(localPoints);
    setEditing(false);
  };

  if (!editing) {
    return (
      <button
        onClick={() => { setLocalPoints(points ?? {}); setEditing(true); }}
        className="text-sm text-taiga-primary hover:underline"
        title="Edit points"
      >
        Edit points
      </button>
    );
  }

  return (
    <div className="space-y-2 p-3 bg-taiga-bg/60 rounded border border-taiga-grey-lighter/40">
      <h3 className="text-xs font-medium text-taiga-grey-light uppercase">Points per Role</h3>
      {roles.map((role) => (
        <div key={role.id} className="flex items-center gap-2">
          <span className="text-sm text-taiga-text w-28 truncate">{role.name}</span>
          <select
            value={localPoints[String(role.id)] ?? ''}
            onChange={(e) =>
              setLocalPoints({
                ...localPoints,
                [String(role.id)]: Number(e.target.value),
              })
            }
            className="text-sm border border-taiga-grey-lighter rounded px-2 py-1"
          >
            <option value="">-</option>
            {pointChoices.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.value != null ? `(${p.value})` : ''}
              </option>
            ))}
          </select>
        </div>
      ))}
      <div className="flex gap-2 pt-1">
        <button
          onClick={handleSave}
          className="text-xs px-2 py-1 rounded bg-taiga-primary text-white hover:bg-taiga-primary/90"
        >
          Save
        </button>
        <button
          onClick={() => setEditing(false)}
          className="text-xs px-2 py-1 rounded text-taiga-grey-light hover:text-taiga-text"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
