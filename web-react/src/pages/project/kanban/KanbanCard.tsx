import { memo, useState, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { Tags } from '@/components/common/Tags';
import type { UserStory } from '@/types/api';
import { type ZoomLevel, getVisibleFields, useKanbanStore } from './useKanbanStore';

interface KanbanCardProps {
  story: UserStory;
  projectSlug: string;
  zoomLevel: ZoomLevel;
  onQuickEdit?: (story: UserStory, field: string, value: unknown) => void;
}

export const KanbanCard = memo(function KanbanCard({
  story,
  projectSlug,
  zoomLevel,
  onQuickEdit,
}: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: `us-${story.id}`, data: { type: 'card', story } });

  const visible = getVisibleFields(zoomLevel);
  const toggleCardFold = useKanbanStore((s) => s.toggleCardFold);
  const isFolded = useKanbanStore((s) => s.foldedCards.has(story.id));
  const isSelected = useKanbanStore((s) => s.selectedCards.has(story.id));
  const toggleSelection = useKanbanStore((s) => s.toggleCardSelection);

  const [editingField, setEditingField] = useState<string | null>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasTasks = story.tasks && story.tasks.length > 0;
  const closedTasks = story.tasks?.filter((t) => t.is_closed) ?? [];
  const taskProgress = hasTasks
    ? Math.round((closedTasks.length / story.tasks!.length) * 100)
    : 0;

  const dueDateClass =
    story.due_date_status === 'past_due'
      ? 'text-taiga-red'
      : story.due_date_status === 'due_soon'
        ? 'text-taiga-yellow'
        : 'text-taiga-grey-light';

  const handleInlineEdit = useCallback(
    (field: string, value: unknown) => {
      setEditingField(null);
      onQuickEdit?.(story, field, value);
    },
    [story, onQuickEdit],
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'kanban-card card p-2 cursor-grab active:cursor-grabbing transition-shadow',
        `zoom-${zoomLevel}`,
        {
          'ring-2 ring-taiga-green-dark': isSelected,
          'opacity-50': isDragging,
          'border-l-4 border-l-taiga-red': story.is_blocked,
        },
      )}
      onClick={(e) => {
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          toggleSelection(story.id);
        }
      }}
    >
      {/* Tags row - visible at zoom >= 2 */}
      {visible.has('tags') && story.tags && story.tags.length > 0 && (
        <div className="mb-1">
          <Tags tags={story.tags} />
        </div>
      )}

      {/* Epic badges - visible at zoom >= 1 */}
      {visible.has('subject') && story.epics && story.epics.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-1">
          {story.epics.map((epic) => (
            <span
              key={epic.id}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
              style={{ backgroundColor: epic.color || '#25A28C' }}
              title={epic.subject}
            >
              #{epic.ref}
            </span>
          ))}
        </div>
      )}

      {/* Title row */}
      <div className="flex items-start gap-1">
        {visible.has('ref') && (
          <span className="text-xs text-taiga-grey-light font-mono shrink-0">
            #{story.ref}
          </span>
        )}
        {visible.has('subject') ? (
          <Link
            to={`/project/${projectSlug}/us/${story.ref}`}
            className="text-sm font-medium text-taiga-text hover:text-taiga-link leading-tight line-clamp-2"
            onClick={(e) => e.stopPropagation()}
          >
            {story.subject}
          </Link>
        ) : (
          <span
            className="text-xs text-taiga-text truncate"
            title={story.subject}
          >
            {story.subject}
          </span>
        )}
      </div>

      {/* Card data row - points, comments, due date */}
      {visible.has('card-data') && (
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-taiga-grey-light">
          {story.total_points != null && (
            <span className="font-semibold" title="Story points">
              {story.total_points} pts
            </span>
          )}
          {story.due_date && (
            <span className={dueDateClass} title={`Due: ${story.due_date}`}>
              {new Date(story.due_date).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {story.is_iocaine && (
            <span className="text-taiga-red" title="Iocaine (toxic workload)">
              &#x2620;
            </span>
          )}
          {story.is_blocked && (
            <span className="text-taiga-red font-semibold" title={story.blocked_note || 'Blocked'}>
              Blocked
            </span>
          )}
        </div>
      )}

      {/* Assigned users row */}
      <div className="flex items-center justify-between mt-1.5">
        {visible.has('assigned_to_extended') &&
        story.assigned_users_extra_info &&
        story.assigned_users_extra_info.length > 0 ? (
          <div
            className="flex -space-x-1"
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickEdit) setEditingField('assigned_to');
            }}
          >
            {story.assigned_users_extra_info.slice(0, 3).map((u, i) => (
              <Avatar
                key={u.id ?? i}
                name={u.full_name_display}
                src={u.photo}
                size={22}
                className="ring-1 ring-white"
              />
            ))}
            {story.assigned_users_extra_info.length > 3 && (
              <span className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-full bg-taiga-grey-lighter text-[10px] font-semibold ring-1 ring-white">
                +{story.assigned_users_extra_info.length - 3}
              </span>
            )}
          </div>
        ) : visible.has('assigned_to') && story.assigned_to_extra_info?.full_name_display ? (
          <div
            onClick={(e) => {
              e.stopPropagation();
              if (onQuickEdit) setEditingField('assigned_to');
            }}
          >
            <Avatar
              name={story.assigned_to_extra_info.full_name_display}
              src={story.assigned_to_extra_info.photo}
              size={22}
            />
          </div>
        ) : (
          <div />
        )}

        {/* Comments count */}
        {visible.has('extra_info') && (story.total_comments ?? 0) > 0 && (
          <span className="text-[10px] text-taiga-grey-light" title="Comments">
            {story.total_comments}
          </span>
        )}
      </div>

      {/* Tasks progress bar - zoom >= 3 */}
      {visible.has('related_tasks') && hasTasks && !isFolded && (
        <div className="mt-2">
          <div className="flex items-center justify-between text-[10px] text-taiga-grey-light mb-0.5">
            <span>
              Tasks: {closedTasks.length}/{story.tasks!.length}
            </span>
            <span>{taskProgress}%</span>
          </div>
          <div className="h-1 bg-taiga-grey-lighter rounded-full overflow-hidden">
            <div
              className="h-full bg-taiga-green-dark rounded-full transition-all"
              style={{ width: `${taskProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Fold toggle - zoom level 2 */}
      {visible.has('unfold') && hasTasks && (
        <button
          className="w-full mt-1 text-[10px] text-taiga-grey-light hover:text-taiga-text text-center"
          onClick={(e) => {
            e.stopPropagation();
            toggleCardFold(story.id);
          }}
        >
          {isFolded ? 'Show details' : 'Hide details'}
        </button>
      )}

      {/* Inline assignee edit overlay */}
      {editingField === 'assigned_to' && onQuickEdit && (
        <div
          className="absolute inset-0 bg-white/90 flex items-center justify-center z-10 rounded"
          onClick={(e) => {
            e.stopPropagation();
            setEditingField(null);
          }}
        >
          <button
            className="text-xs text-taiga-red hover:underline"
            onClick={(e) => {
              e.stopPropagation();
              handleInlineEdit('assigned_to', null);
            }}
          >
            Unassign
          </button>
        </div>
      )}
    </div>
  );
});
