import { memo, useMemo } from 'react';
import clsx from 'clsx';
import type { ProjectStatus, UserStory, Swimlane } from '@/types/api';
import { type ZoomLevel, useKanbanStore } from './useKanbanStore';
import { KanbanColumn } from './KanbanColumn';

interface KanbanSwimlaneProps {
  swimlane: Swimlane | null;
  label: string;
  statuses: ProjectStatus[];
  stories: UserStory[];
  projectSlug: string;
  zoomLevel: ZoomLevel;
  onQuickEdit?: (story: UserStory, field: string, value: unknown) => void;
}

export const KanbanSwimlane = memo(function KanbanSwimlane({
  swimlane,
  label,
  statuses,
  stories,
  projectSlug,
  zoomLevel,
  onQuickEdit,
}: KanbanSwimlaneProps) {
  const swimlaneId = swimlane?.id ?? null;
  const isFolded = useKanbanStore((s) =>
    swimlaneId != null ? s.foldedSwimlanes.has(swimlaneId) : false,
  );
  const toggleFold = useKanbanStore((s) => s.toggleSwimlaneFold);

  const storiesByStatus = useMemo(() => {
    const map: Record<number, UserStory[]> = {};
    for (const s of stories) {
      (map[s.status] ??= []).push(s);
    }
    for (const arr of Object.values(map)) {
      arr.sort((a, b) => (a.kanban_order ?? 0) - (b.kanban_order ?? 0));
    }
    return map;
  }, [stories]);

  const totalCount = stories.length;

  return (
    <div className="kanban-swimlane mb-4">
      {/* Swimlane header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-taiga-grey-lighter/30 rounded-t border-b border-taiga-grey-lighter">
        {swimlaneId != null && (
          <button
            className="text-taiga-grey-light hover:text-taiga-text text-sm"
            onClick={() => toggleFold(swimlaneId)}
          >
            {isFolded ? '\u25B6' : '\u25BC'}
          </button>
        )}
        <h4 className="font-semibold text-sm text-taiga-text">{label}</h4>
        <span className="text-xs text-taiga-grey-light">({totalCount})</span>
      </div>

      {/* Columns row */}
      {!isFolded && (
        <div className={clsx('flex gap-2 overflow-x-auto py-2 px-1')}>
          {statuses.map((status) => (
            <KanbanColumn
              key={`${status.id}-${swimlaneId ?? 'none'}`}
              status={status}
              stories={storiesByStatus[status.id] ?? []}
              projectSlug={projectSlug}
              zoomLevel={zoomLevel}
              swimlaneId={swimlaneId}
              onQuickEdit={onQuickEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
});
