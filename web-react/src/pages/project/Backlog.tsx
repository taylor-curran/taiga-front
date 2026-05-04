import { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useMilestones } from '@/services/milestones';
import {
  useUserStories,
  useCreateUserStory,
  usePatchUserStory,
  useBulkUpdateBacklogOrder,
} from '@/services/userstories';
import {
  useCreateMilestone,
  useUpdateMilestone,
  useDeleteMilestone,
} from '@/services/milestones';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { BacklogStoryRow, DragOverlayStoryRow } from '@/components/backlog/BacklogStoryRow';
import { SprintPanel } from '@/components/backlog/SprintPanel';
import { FilterBar, type BacklogFilters } from '@/components/backlog/FilterBar';
import { BulkActions } from '@/components/backlog/BulkActions';
import { SprintFormDialog } from '@/components/backlog/SprintFormDialog';
import { NewStoryForm } from '@/components/backlog/NewStoryForm';
import type { Milestone, UserStory } from '@/types/api';

export function BacklogPage() {
  const project = useCurrentProject();

  // Filters
  const [filters, setFilters] = useState<BacklogFilters>({});
  const [showTags, setShowTags] = useState(true);
  const [showNewStoryForm, setShowNewStoryForm] = useState(false);

  // Sprint dialog
  const [sprintDialogOpen, setSprintDialogOpen] = useState(false);
  const [editingSprint, setEditingSprint] = useState<Milestone | null>(null);

  // Selection for bulk operations
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Drag state
  const [activeId, setActiveId] = useState<string | null>(null);

  // Data fetching
  const milestonesQuery = useMilestones(project.id);
  const backlogStoriesQuery = useUserStories({
    project: project.id,
    milestone: 'null',
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.assigned_to ? { assigned_to: filters.assigned_to } : {}),
    ...(filters.tags ? { tags: filters.tags } : {}),
    ...(filters.q ? { q: filters.q } : {}),
  });

  // Mutations
  const createStory = useCreateUserStory();
  const patchStory = usePatchUserStory();
  const bulkUpdateOrder = useBulkUpdateBacklogOrder();
  const createMilestone = useCreateMilestone();
  const updateMilestone = useUpdateMilestone();
  const deleteMilestone = useDeleteMilestone();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const milestones = milestonesQuery.data ?? [];
  const backlogStories = backlogStoriesQuery.data ?? [];

  // Get stories per sprint from milestones data
  const sprintStories = useMemo(() => {
    const map = new Map<number, UserStory[]>();
    for (const m of milestones) {
      map.set(m.id, m.user_stories ?? []);
    }
    return map;
  }, [milestones]);

  // All stories flat (for drag lookup)
  const allStories = useMemo(() => {
    const all = [...backlogStories];
    for (const stories of sprintStories.values()) {
      all.push(...stories);
    }
    return all;
  }, [backlogStories, sprintStories]);

  // Doomline calculation: show after story where cumulative points exceed sprint capacity
  const doomlineIndex = useMemo(() => {
    const openSprints = milestones.filter((m) => !m.closed);
    if (openSprints.length === 0) return -1;
    const totalSprintCapacity = openSprints.reduce(
      (acc, m) => acc + (m.total_points ?? 0),
      0,
    );
    if (totalSprintCapacity <= 0) return -1;

    let cumulative = 0;
    for (let i = 0; i < backlogStories.length; i++) {
      cumulative += backlogStories[i].total_points ?? 0;
      if (cumulative > totalSprintCapacity) return i;
    }
    return -1;
  }, [backlogStories, milestones]);

  // Point totals
  const totalBacklogPoints = backlogStories.reduce((acc, s) => acc + (s.total_points ?? 0), 0);

  // Handlers
  const handleSelect = useCallback((id: number, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }, []);

  const handleBulkChangeStatus = useCallback(
    (statusId: number) => {
      selectedIds.forEach((id) => {
        patchStory.mutate({ id, data: { status: statusId } });
      });
      setSelectedIds(new Set());
    },
    [selectedIds, patchStory],
  );

  const handleBulkMoveToSprint = useCallback(
    (milestoneId: number | null) => {
      selectedIds.forEach((id) => {
        patchStory.mutate({ id, data: { milestone: milestoneId } });
      });
      setSelectedIds(new Set());
    },
    [selectedIds, patchStory],
  );

  const handleBulkAssign = useCallback(
    (userId: number | null) => {
      selectedIds.forEach((id) => {
        patchStory.mutate({ id, data: { assigned_to: userId } });
      });
      setSelectedIds(new Set());
    },
    [selectedIds, patchStory],
  );

  const handleCreateStory = useCallback(
    (subject: string) => {
      createStory.mutate({ project: project.id, subject });
      setShowNewStoryForm(false);
    },
    [createStory, project.id],
  );

  const handleSprintSubmit = useCallback(
    (data: { name: string; estimated_start: string; estimated_finish: string }) => {
      if (editingSprint) {
        updateMilestone.mutate({ id: editingSprint.id, data });
      } else {
        createMilestone.mutate({ project: project.id, ...data });
      }
      setSprintDialogOpen(false);
      setEditingSprint(null);
    },
    [editingSprint, updateMilestone, createMilestone, project.id],
  );

  const handleDeleteSprint = useCallback(
    (id: number) => {
      if (confirm('Delete this sprint? Stories will return to the backlog.')) {
        deleteMilestone.mutate(id);
      }
    },
    [deleteMilestone],
  );

  const handleEditSprint = useCallback((m: Milestone) => {
    setEditingSprint(m);
    setSprintDialogOpen(true);
  }, []);

  // Drag handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeStoryId = Number(String(active.id).replace('us-', ''));
    const overId = String(over.id);

    // Determine if dropping onto a sprint container
    if (overId.startsWith('sprint-')) {
      const milestoneId = Number(overId.replace('sprint-', ''));
      patchStory.mutate({ id: activeStoryId, data: { milestone: milestoneId } });
      return;
    }

    // Reorder within backlog
    const overStoryId = Number(overId.replace('us-', ''));
    const oldIndex = backlogStories.findIndex((s) => s.id === activeStoryId);
    const newIndex = backlogStories.findIndex((s) => s.id === overStoryId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const reordered = arrayMove(backlogStories, oldIndex, newIndex);
      const bulk: Array<[number, number]> = reordered.map((s, i) => [s.id, i]);
      bulkUpdateOrder.mutate({ project_id: project.id, bulk_userstories: bulk });
    } else {
      // Moving from sprint to backlog or between sprints
      const overInBacklog = backlogStories.find((s) => s.id === overStoryId);
      if (overInBacklog) {
        patchStory.mutate({ id: activeStoryId, data: { milestone: null } });
      }
    }
  };

  const draggedStory = activeId
    ? allStories.find((s) => s.id === Number(activeId.replace('us-', '')))
    : null;

  if (backlogStoriesQuery.isLoading || milestonesQuery.isLoading) return <Loading />;
  if (backlogStoriesQuery.error) return <ErrorBox error={backlogStoriesQuery.error} />;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-baseline gap-3">
            <h1 className="text-2xl font-semibold text-taiga-text">Backlog</h1>
            <span className="text-sm text-taiga-grey-light">
              {backlogStories.length} stories {'\u00B7'} {totalBacklogPoints} points
            </span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1.5 text-sm text-taiga-grey-light cursor-pointer">
              <input
                type="checkbox"
                checked={showTags}
                onChange={(e) => setShowTags(e.target.checked)}
                className="accent-taiga-primary"
              />
              Show tags
            </label>
            <button
              onClick={() => setShowNewStoryForm(true)}
              className="px-3 py-1.5 bg-taiga-primary text-white text-sm rounded hover:bg-taiga-primary/90"
            >
              + New Story
            </button>
            <button
              onClick={() => { setEditingSprint(null); setSprintDialogOpen(true); }}
              className="px-3 py-1.5 bg-taiga-secondary text-white text-sm rounded hover:bg-taiga-secondary/90"
            >
              + New Sprint
            </button>
          </div>
        </header>

        {/* Bulk Actions */}
        <BulkActions
          selectedCount={selectedIds.size}
          project={project}
          milestones={milestones}
          onChangeStatus={handleBulkChangeStatus}
          onMoveToSprint={handleBulkMoveToSprint}
          onAssign={handleBulkAssign}
          onClearSelection={() => setSelectedIds(new Set())}
        />

        {/* Filter Bar */}
        <FilterBar
          project={project}
          filters={filters}
          onFiltersChange={setFilters}
          totalCount={backlogStories.length}
          filteredCount={backlogStories.length}
        />

        {/* Backlog list */}
        <section className="card overflow-hidden">
          <header className="px-4 py-3 flex justify-between items-center bg-taiga-bg/80 border-b border-taiga-grey-lighter/40">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-taiga-text">Backlog</h2>
              <span className="text-xs text-taiga-grey-light bg-taiga-grey-lighter/40 px-2 py-0.5 rounded-full">
                {backlogStories.length}
              </span>
            </div>
            <span className="text-sm text-taiga-grey-light font-mono">
              {totalBacklogPoints} pts
            </span>
          </header>

          <SortableContext
            items={backlogStories.map((s) => `us-${s.id}`)}
            strategy={verticalListSortingStrategy}
          >
            {backlogStories.length === 0 && !showNewStoryForm ? (
              <div className="text-center py-10 text-taiga-grey-light">
                <p className="text-sm">No user stories in the backlog.</p>
                <button
                  onClick={() => setShowNewStoryForm(true)}
                  className="mt-2 text-sm text-taiga-primary hover:underline"
                >
                  Create the first story
                </button>
              </div>
            ) : (
              <ul className="divide-y divide-taiga-grey-lighter/40">
                {backlogStories.map((s, idx) => (
                  <BacklogStoryRow
                    key={s.id}
                    story={s}
                    projectSlug={project.slug}
                    selected={selectedIds.has(s.id)}
                    onSelect={handleSelect}
                    showTags={showTags}
                    isDoomlineBelow={idx === doomlineIndex}
                  />
                ))}
              </ul>
            )}
          </SortableContext>

          {showNewStoryForm && (
            <NewStoryForm
              onSubmit={handleCreateStory}
              onCancel={() => setShowNewStoryForm(false)}
            />
          )}
        </section>

        {/* Sprints */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-taiga-text">Sprints</h2>
            <span className="text-xs text-taiga-grey-light">
              {milestones.length} sprint{milestones.length !== 1 ? 's' : ''}
            </span>
          </div>
          {milestones.length === 0 ? (
            <div className="card p-8 text-center text-taiga-grey-light">
              <p className="text-sm">No sprints yet.</p>
              <button
                onClick={() => { setEditingSprint(null); setSprintDialogOpen(true); }}
                className="mt-2 text-sm text-taiga-primary hover:underline"
              >
                Create your first sprint
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {milestones.map((m) => (
                <SprintPanel
                  key={m.id}
                  milestone={m}
                  stories={sprintStories.get(m.id) ?? []}
                  projectSlug={project.slug}
                  selectedIds={selectedIds}
                  onSelect={handleSelect}
                  showTags={showTags}
                  onEditSprint={handleEditSprint}
                  onDeleteSprint={handleDeleteSprint}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {draggedStory ? <DragOverlayStoryRow story={draggedStory} /> : null}
      </DragOverlay>

      {/* Sprint Form Dialog */}
      <SprintFormDialog
        open={sprintDialogOpen}
        onClose={() => { setSprintDialogOpen(false); setEditingSprint(null); }}
        onSubmit={handleSprintSubmit}
        editing={editingSprint}
      />
    </DndContext>
  );
}
