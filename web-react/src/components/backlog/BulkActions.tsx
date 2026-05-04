import { useState } from 'react';
import type { ProjectDetail, Milestone } from '@/types/api';

interface BulkActionsProps {
  selectedCount: number;
  project: ProjectDetail;
  milestones: Milestone[];
  onChangeStatus: (statusId: number) => void;
  onMoveToSprint: (milestoneId: number | null) => void;
  onAssign: (userId: number | null) => void;
  onClearSelection: () => void;
}

export function BulkActions({
  selectedCount,
  project,
  milestones,
  onChangeStatus,
  onMoveToSprint,
  onAssign,
  onClearSelection,
}: BulkActionsProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);

  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions sticky top-0 z-20 flex items-center gap-3 px-4 py-2 bg-taiga-primary text-white rounded-lg shadow-lg animate-slide-down">
      <span className="font-semibold text-sm">
        {selectedCount} {selectedCount === 1 ? 'story' : 'stories'} selected
      </span>

      <div className="flex items-center gap-2 ml-auto">
        {/* Status change */}
        <select
          defaultValue=""
          onChange={(e) => {
            if (e.target.value) onChangeStatus(Number(e.target.value));
            e.target.value = '';
          }}
          className="text-sm bg-white/20 border border-white/30 rounded px-2 py-1 text-white"
        >
          <option value="" disabled>
            Change status...
          </option>
          {project.us_statuses?.map((s) => (
            <option key={s.id} value={s.id} className="text-taiga-text">
              {s.name}
            </option>
          ))}
        </select>

        {/* Move to sprint */}
        <div className="relative">
          <button
            onClick={() => setShowMoveMenu(!showMoveMenu)}
            className="text-sm px-3 py-1 rounded bg-white/20 border border-white/30 hover:bg-white/30"
          >
            Move to sprint
          </button>
          {showMoveMenu && (
            <div className="absolute top-full mt-1 right-0 bg-white text-taiga-text border border-taiga-grey-lighter rounded shadow-lg z-30 min-w-48">
              <button
                onClick={() => { onMoveToSprint(null); setShowMoveMenu(false); }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-taiga-bg/60"
              >
                Backlog (unassigned)
              </button>
              {milestones.filter((m) => !m.closed).map((m) => (
                <button
                  key={m.id}
                  onClick={() => { onMoveToSprint(m.id); setShowMoveMenu(false); }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-taiga-bg/60"
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Assign */}
        <select
          defaultValue=""
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'unassign') onAssign(null);
            else if (val) onAssign(Number(val));
            e.target.value = '';
          }}
          className="text-sm bg-white/20 border border-white/30 rounded px-2 py-1 text-white"
        >
          <option value="" disabled>
            Assign to...
          </option>
          <option value="unassign" className="text-taiga-text">
            Unassign
          </option>
          {project.members
            ?.filter((m) => m.is_active)
            .map((m) => (
              <option key={m.id} value={m.user} className="text-taiga-text">
                {m.full_name || m.username || m.user_email}
              </option>
            ))}
        </select>

        <button
          onClick={onClearSelection}
          className="text-sm px-2 py-1 rounded hover:bg-white/20"
          title="Clear selection"
        >
          \u2715
        </button>
      </div>
    </div>
  );
}
