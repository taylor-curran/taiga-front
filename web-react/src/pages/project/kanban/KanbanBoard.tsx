import { useMemo, useCallback, type MutableRefObject } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core';
import { useState } from 'react';
import type { ProjectDetail, UserStory, Swimlane } from '@/types/api';
import { useKanbanStore } from './useKanbanStore';
import { KanbanColumn } from './KanbanColumn';
import { KanbanSwimlane } from './KanbanSwimlane';
import { KanbanCard } from './KanbanCard';
import { useBulkUpdateKanbanOrder } from '@/services/kanban';

interface KanbanBoardProps {
  project: ProjectDetail;
  stories: UserStory[];
  swimlanes: Swimlane[];
  onStoriesChange: (updater: (prev: UserStory[]) => UserStory[]) => void;
  onQuickEdit: (story: UserStory, field: string, value: unknown) => void;
  pendingMutations?: MutableRefObject<Set<number>>;
}

export function KanbanBoard({
  project,
  stories,
  swimlanes,
  onStoriesChange,
  onQuickEdit,
  pendingMutations,
}: KanbanBoardProps) {
  const zoom = useKanbanStore((s) => s.zoom);
  const filters = useKanbanStore((s) => s.filters);

  const [activeStory, setActiveStory] = useState<UserStory | null>(null);

  const bulkUpdate = useBulkUpdateKanbanOrder();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const statuses = useMemo(
    () =>
      (project.us_statuses ?? [])
        .filter((s) => !s.is_closed)
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [project.us_statuses],
  );

  // Apply client-side filters
  const filteredStories = useMemo(() => {
    let result = stories;

    if (filters.q) {
      const q = filters.q.toLowerCase();
      result = result.filter(
        (s) =>
          s.subject.toLowerCase().includes(q) ||
          String(s.ref).includes(q),
      );
    }

    if (filters.assignedUsers.length > 0) {
      result = result.filter((s) => {
        const users = s.assigned_users ?? (s.assigned_to != null ? [s.assigned_to] : []);
        return users.some((u) => filters.assignedUsers.includes(u));
      });
    }

    if (filters.tags.length > 0) {
      result = result.filter((s) => {
        if (!s.tags) return false;
        const storyTags = s.tags!.map((t) => (Array.isArray(t) ? t[0] : t));
        return filters.tags.some((ft) => storyTags.includes(ft));
      });
    }

    if (filters.epics.length > 0) {
      result = result.filter((s) => {
        if (!s.epics) return false;
        return s.epics.some((e) => filters.epics.includes(e.id));
      });
    }

    return result;
  }, [stories, filters]);

  const hasSwimlanes = swimlanes.length > 0;

  // Group stories by swimlane if swimlanes exist
  const storiesBySwimlane = useMemo(() => {
    if (!hasSwimlanes) return null;
    const map: Record<string, UserStory[]> = {};
    const unclassifiedKey = 'unclassified';
    map[unclassifiedKey] = [];

    for (const sl of swimlanes) {
      map[String(sl.id)] = [];
    }

    for (const s of filteredStories) {
      const key = s.swimlane != null ? String(s.swimlane) : unclassifiedKey;
      (map[key] ??= []).push(s);
    }
    return map;
  }, [filteredStories, hasSwimlanes, swimlanes]);

  // Group stories by status (flat mode, no swimlanes)
  const storiesByStatus = useMemo(() => {
    if (hasSwimlanes) return null;
    const map: Record<number, UserStory[]> = {};
    for (const s of filteredStories) {
      (map[s.status] ??= []).push(s);
    }
    for (const arr of Object.values(map)) {
      arr.sort((a, b) => (a.kanban_order ?? 0) - (b.kanban_order ?? 0));
    }
    return map;
  }, [filteredStories, hasSwimlanes]);

  const parseDroppableId = (id: string) => {
    const match = id.match(/^col-(\d+)(?:-swim-(\d+))?$/);
    if (!match) return null;
    return {
      statusId: Number(match[1]),
      swimlaneId: match[2] != null ? Number(match[2]) : null,
    };
  };

  const findContainerForStory = (storyId: number): string | null => {
    const story = stories.find((s) => s.id === storyId);
    if (!story) return null;
    return story.swimlane != null
      ? `col-${story.status}-swim-${story.swimlane}`
      : `col-${story.status}`;
  };

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { story } = event.active.data.current as { story: UserStory };
    setActiveStory(story);
  }, []);

  const handleDragOver = useCallback(
    (_event: DragOverEvent) => {
      // Visual feedback is handled by the droppable isOver state
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveStory(null);

      const { active, over } = event;
      if (!over) return;

      const activeData = active.data.current as { type: string; story: UserStory };
      const draggedStory = activeData.story;

      // Determine target container
      let targetContainerId: string | null = null;
      const overData = over.data.current;

      if (overData?.type === 'column') {
        targetContainerId = over.id as string;
      } else if (overData?.type === 'card') {
        const overStory = overData.story as UserStory;
        targetContainerId = findContainerForStory(overStory.id);
      } else {
        targetContainerId = over.id as string;
      }

      if (!targetContainerId) return;

      const target = parseDroppableId(targetContainerId);
      if (!target) return;

      const newStatusId = target.statusId;
      const newSwimlaneId = target.swimlaneId;

      // Collect stories in the target column (scoped to swimlane correctly)
      const targetStories = stories
        .filter(
          (s) =>
            s.status === newStatusId &&
            (newSwimlaneId != null ? s.swimlane === newSwimlaneId : s.swimlane == null) &&
            s.id !== draggedStory.id,
        )
        .sort((a, b) => (a.kanban_order ?? 0) - (b.kanban_order ?? 0));

      // Determine insertion position and neighboring story IDs
      let insertIndex = targetStories.length; // default: append to end
      if (overData?.type === 'card') {
        const overStory = overData.story as UserStory;
        const overIndex = targetStories.findIndex((s) => s.id === overStory.id);
        if (overIndex >= 0) {
          insertIndex = overIndex;
        }
      }

      const afterUserstoryId = insertIndex > 0
        ? targetStories[insertIndex - 1].id
        : null;
      const beforeUserstoryId = insertIndex < targetStories.length
        ? targetStories[insertIndex].id
        : null;

      // Compute a unique order value between neighbors to avoid collisions
      const newOrder = insertIndex < targetStories.length
        ? (insertIndex > 0
          ? ((targetStories[insertIndex - 1].kanban_order ?? 0) + (targetStories[insertIndex].kanban_order ?? 0)) / 2
          : (targetStories[insertIndex].kanban_order ?? 0) - 1)
        : targetStories.length > 0
          ? (targetStories[targetStories.length - 1].kanban_order ?? 0) + 1
          : 0;

      // Optimistic update
      onStoriesChange((prev) =>
        prev.map((s) =>
          s.id === draggedStory.id
            ? {
                ...s,
                status: newStatusId,
                swimlane: newSwimlaneId,
                kanban_order: newOrder,
              }
            : s,
        ),
      );

      // Track in-flight mutation so Kanban.tsx preserves its override on refetch
      const storyId = draggedStory.id;
      pendingMutations?.current.add(storyId);

      // Persist via bulk endpoint matching the AngularJS API contract
      bulkUpdate.mutate(
        {
          projectId: project.id,
          statusId: newStatusId,
          swimlaneId: newSwimlaneId,
          afterUserstoryId,
          beforeUserstoryId,
          bulkUserstories: [{ us_id: storyId, order: newOrder }],
        },
        {
          onSettled: () => {
            pendingMutations?.current.delete(storyId);
          },
        },
      );
    },
    [stories, onStoriesChange, bulkUpdate, project.id, findContainerForStory, pendingMutations],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {hasSwimlanes && storiesBySwimlane ? (
        <div className="space-y-2">
          {/* Unclassified swimlane */}
          {(storiesBySwimlane['unclassified']?.length ?? 0) > 0 && (
            <KanbanSwimlane
              swimlane={null}
              label="Unclassified user stories"
              statuses={statuses}
              stories={storiesBySwimlane['unclassified']}
              projectSlug={project.slug}
              zoomLevel={zoom}
              onQuickEdit={onQuickEdit}
            />
          )}
          {swimlanes.map((sl) => (
            <KanbanSwimlane
              key={sl.id}
              swimlane={sl}
              label={sl.name}
              statuses={statuses}
              stories={storiesBySwimlane[String(sl.id)] ?? []}
              projectSlug={project.slug}
              zoomLevel={zoom}
              onQuickEdit={onQuickEdit}
            />
          ))}
        </div>
      ) : (
        <div className="flex gap-2 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              stories={storiesByStatus?.[status.id] ?? []}
              projectSlug={project.slug}
              zoomLevel={zoom}
              onQuickEdit={onQuickEdit}
            />
          ))}
        </div>
      )}

      {/* Drag overlay */}
      <DragOverlay>
        {activeStory && (
          <div className="opacity-80 rotate-2 shadow-lg">
            <KanbanCard
              story={activeStory}
              projectSlug={project.slug}
              zoomLevel={zoom}
            />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
