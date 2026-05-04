import { forwardRef } from 'react';
import { Link } from 'react-router-dom';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Tags } from '@/components/common/Tags';
import { Avatar } from '@/components/common/Avatar';
import type { UserStory } from '@/types/api';

interface BacklogStoryRowProps {
  story: UserStory;
  projectSlug: string;
  selected: boolean;
  onSelect: (id: number, checked: boolean) => void;
  showTags: boolean;
  isDoomlineBelow?: boolean;
}

export function BacklogStoryRow({
  story,
  projectSlug,
  selected,
  onSelect,
  showTags,
  isDoomlineBelow,
}: BacklogStoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `us-${story.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <>
      <li
        ref={setNodeRef}
        style={style}
        className={`backlog-story-row px-4 py-3 flex items-center gap-3 hover:bg-taiga-bg/60 border-l-4 ${
          selected ? 'border-l-taiga-primary bg-taiga-primary/5' : 'border-l-transparent'
        } ${isDragging ? 'z-10 shadow-lg' : ''}`}
        {...attributes}
        {...listeners}
      >
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(story.id, e.target.checked)}
          className="shrink-0 accent-taiga-primary"
          onClick={(e) => e.stopPropagation()}
        />
        <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0 cursor-grab">
          #{story.ref}
        </span>
        <Link
          to={`/project/${projectSlug}/us/${story.ref}`}
          className="flex-1 truncate font-medium text-taiga-text hover:text-taiga-primary"
        >
          {story.subject}
        </Link>
        {showTags && <Tags tags={story.tags} />}
        {story.status_extra_info?.name && (
          <span
            className="badge text-xs"
            style={
              story.status_extra_info.color
                ? { backgroundColor: story.status_extra_info.color, color: '#fff' }
                : undefined
            }
          >
            {story.status_extra_info.name}
          </span>
        )}
        {story.assigned_to_extra_info?.full_name_display && (
          <Avatar
            name={story.assigned_to_extra_info.full_name_display}
            src={story.assigned_to_extra_info.photo}
            size={24}
          />
        )}
        <span className="text-xs text-taiga-grey-light w-14 text-right font-mono">
          {story.total_points ?? '\u2014'} pts
        </span>
      </li>
      {isDoomlineBelow && (
        <li className="doomline flex items-center gap-2 px-4 py-1">
          <div className="flex-1 h-0.5 bg-red-400" />
          <span className="text-xs text-red-500 font-semibold uppercase tracking-wide">
            Forecasted capacity
          </span>
          <div className="flex-1 h-0.5 bg-red-400" />
        </li>
      )}
    </>
  );
}

export const DragOverlayStoryRow = forwardRef<HTMLLIElement, { story: UserStory }>(
  ({ story }, ref) => (
    <li
      ref={ref}
      className="backlog-story-row px-4 py-3 flex items-center gap-3 bg-white shadow-xl border border-taiga-primary/30 rounded"
    >
      <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0">
        #{story.ref}
      </span>
      <span className="flex-1 truncate font-medium text-taiga-text">
        {story.subject}
      </span>
      <span className="text-xs text-taiga-grey-light w-14 text-right font-mono">
        {story.total_points ?? '\u2014'} pts
      </span>
    </li>
  ),
);
DragOverlayStoryRow.displayName = 'DragOverlayStoryRow';
