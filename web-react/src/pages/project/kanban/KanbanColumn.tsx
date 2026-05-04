import { memo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import clsx from 'clsx';
import type { ProjectStatus, UserStory } from '@/types/api';
import { type ZoomLevel, useKanbanStore } from './useKanbanStore';
import { KanbanCard } from './KanbanCard';

interface KanbanColumnProps {
  status: ProjectStatus;
  stories: UserStory[];
  projectSlug: string;
  zoomLevel: ZoomLevel;
  swimlaneId?: number | null;
  onQuickEdit?: (story: UserStory, field: string, value: unknown) => void;
}

export const KanbanColumn = memo(function KanbanColumn({
  status,
  stories,
  projectSlug,
  zoomLevel,
  swimlaneId,
  onQuickEdit,
}: KanbanColumnProps) {
  const isFolded = useKanbanStore((s) => s.foldedColumns.has(status.id));
  const toggleFold = useKanbanStore((s) => s.toggleColumnFold);

  const droppableId = swimlaneId != null
    ? `col-${status.id}-swim-${swimlaneId}`
    : `col-${status.id}`;

  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: 'column', statusId: status.id, swimlaneId },
  });

  const wipLimit = status.wip_limit;
  const overWip = wipLimit != null && wipLimit > 0 && stories.length > wipLimit;
  const atWip = wipLimit != null && wipLimit > 0 && stories.length === wipLimit;

  const sortableItems = stories.map((s) => `us-${s.id}`);

  if (isFolded) {
    return (
      <div className="kanban-column-folded flex flex-col items-center min-w-[40px] max-w-[40px]">
        <button
          className="w-full py-2 flex flex-col items-center gap-1 hover:bg-taiga-grey-lighter/40 rounded transition-colors"
          onClick={() => toggleFold(status.id)}
          title={`Expand ${status.name}`}
        >
          {status.color && (
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: status.color }}
            />
          )}
          <span
            className="text-[10px] font-semibold text-taiga-grey writing-vertical"
            style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
          >
            {status.name}
          </span>
          <span className="text-[10px] text-taiga-grey-light">{stories.length}</span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'kanban-column flex flex-col min-w-[250px] max-w-[300px] flex-1',
        { 'flex-shrink-0': true },
      )}
    >
      {/* Column header */}
      <header
        className={clsx(
          'flex items-center justify-between px-3 py-2 rounded-t border-b-2',
          {
            'border-b-taiga-red bg-taiga-red/5': overWip,
            'border-b-taiga-yellow': atWip && !overWip,
          },
        )}
        style={
          !overWip && !atWip && status.color
            ? { borderBottomColor: status.color }
            : undefined
        }
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            className="text-taiga-grey-light hover:text-taiga-text shrink-0 text-xs"
            onClick={() => toggleFold(status.id)}
            title="Collapse column"
          >
            &#x25C0;
          </button>
          {status.color && (
            <span
              className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: status.color }}
            />
          )}
          <h3 className="font-semibold text-sm truncate">{status.name}</h3>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <span
            className={clsx('text-xs font-medium', {
              'text-taiga-red font-bold': overWip,
              'text-taiga-yellow': atWip && !overWip,
              'text-taiga-grey-light': !overWip && !atWip,
            })}
          >
            {stories.length}
            {wipLimit != null && wipLimit > 0 ? ` / ${wipLimit}` : ''}
          </span>
        </div>
      </header>

      {/* WIP warning banner */}
      {overWip && (
        <div className="bg-taiga-red/10 text-taiga-red text-[10px] px-3 py-1 text-center font-medium">
          WIP limit exceeded ({stories.length}/{wipLimit})
        </div>
      )}

      {/* Cards list */}
      <SortableContext items={sortableItems} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={clsx(
            'flex-1 overflow-y-auto p-2 space-y-2 min-h-[60px] rounded-b transition-colors',
            {
              'bg-taiga-green/10': isOver,
              'bg-taiga-bg': !isOver,
            },
          )}
        >
          {stories.length === 0 && (
            <div className="text-center text-xs text-taiga-grey-light py-4 italic">
              No stories
            </div>
          )}
          {stories.map((story) => (
            <KanbanCard
              key={story.id}
              story={story}
              projectSlug={projectSlug}
              zoomLevel={zoomLevel}
              onQuickEdit={onQuickEdit}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
});
