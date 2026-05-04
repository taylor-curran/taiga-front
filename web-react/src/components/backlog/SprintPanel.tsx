import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { BacklogStoryRow } from './BacklogStoryRow';
import type { Milestone, UserStory } from '@/types/api';

interface SprintPanelProps {
  milestone: Milestone;
  stories: UserStory[];
  projectSlug: string;
  selectedIds: Set<number>;
  onSelect: (id: number, checked: boolean) => void;
  showTags: boolean;
  onEditSprint: (milestone: Milestone) => void;
  onDeleteSprint: (id: number) => void;
}

export function SprintPanel({
  milestone,
  stories,
  projectSlug,
  selectedIds,
  onSelect,
  showTags,
  onEditSprint,
  onDeleteSprint,
}: SprintPanelProps) {
  const [collapsed, setCollapsed] = useState(milestone.closed ?? false);
  const totalPoints = stories.reduce((acc, s) => acc + (s.total_points ?? 0), 0);
  const closedPoints = stories
    .filter((s) => s.is_closed)
    .reduce((acc, s) => acc + (s.total_points ?? 0), 0);

  const { setNodeRef } = useDroppable({ id: `sprint-${milestone.id}` });

  return (
    <section className="card overflow-hidden">
      <header className="sprint-header px-4 py-3 flex items-center justify-between bg-taiga-bg/80 border-b border-taiga-grey-lighter/40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-taiga-grey-light hover:text-taiga-text text-sm"
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            {collapsed ? '\u25B6' : '\u25BC'}
          </button>
          <Link
            to={`/project/${projectSlug}/taskboard/${milestone.slug ?? milestone.id}`}
            className="font-semibold text-taiga-text hover:text-taiga-primary"
          >
            {milestone.name}
          </Link>
          {milestone.closed && (
            <span className="badge bg-taiga-grey-light text-white text-xs">Closed</span>
          )}
          {milestone.estimated_start && milestone.estimated_finish && (
            <span className="text-xs text-taiga-grey-light">
              {milestone.estimated_start} \u2192 {milestone.estimated_finish}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-taiga-grey-light">
            <span className="font-mono">{closedPoints}/{totalPoints}</span> pts
            <span className="ml-2 text-xs">({stories.length} stories)</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => onEditSprint(milestone)}
              className="text-xs px-2 py-1 rounded hover:bg-taiga-primary/10 text-taiga-primary"
            >
              Edit
            </button>
            {!milestone.closed && (
              <button
                onClick={() => onDeleteSprint(milestone.id)}
                className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-500"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </header>

      {!collapsed && (
        <div ref={setNodeRef}>
          <SortableContext
            items={stories.map((s) => `us-${s.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {stories.length === 0 ? (
              <p className="text-sm text-taiga-grey-light text-center py-6 italic">
                Drop stories here
              </p>
            ) : (
              <ul className="divide-y divide-taiga-grey-lighter/40">
                {stories.map((s) => (
                  <BacklogStoryRow
                    key={s.id}
                    story={s}
                    projectSlug={projectSlug}
                    selected={selectedIds.has(s.id)}
                    onSelect={onSelect}
                    showTags={showTags}
                  />
                ))}
              </ul>
            )}
          </SortableContext>
        </div>
      )}

      {/* Progress bar */}
      {!collapsed && totalPoints > 0 && (
        <div className="px-4 py-2 bg-taiga-bg/40">
          <div className="h-1.5 bg-taiga-grey-lighter rounded-full overflow-hidden">
            <div
              className="h-full bg-taiga-primary rounded-full transition-all"
              style={{ width: `${Math.min(100, (closedPoints / totalPoints) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </section>
  );
}
