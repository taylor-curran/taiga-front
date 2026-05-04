import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useKanbanStories, useSwimlanes, usePatchUserStory } from '@/services/kanban';
import { useEpics } from '@/services/epics';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import type { UserStory } from '@/types/api';
import { KanbanBoard, KanbanFilterBar, BoardZoom, useKanbanStore } from './kanban';

export function KanbanPage() {
  const project = useCurrentProject();
  const {
    data: serverStories,
    isLoading: storiesLoading,
    error: storiesError,
  } = useKanbanStories({ project: project.id });

  const { data: swimlanes } = useSwimlanes(project.id);
  const { data: epics } = useEpics(project.id);

  const patchUs = usePatchUserStory();

  // Local stories state for optimistic drag-and-drop updates
  const [localOverrides, setLocalOverrides] = useState<Map<number, Partial<UserStory>>>(
    new Map(),
  );
  // Track story IDs with in-flight mutations to preserve their overrides on refetch
  const pendingMutations = useRef(new Set<number>());

  // Clear optimistic overrides once the server provides fresh data,
  // but keep overrides for stories with in-flight mutations
  useEffect(() => {
    if (pendingMutations.current.size === 0) {
      setLocalOverrides(new Map());
    } else {
      setLocalOverrides((prev) => {
        const next = new Map<number, Partial<UserStory>>();
        for (const [id, override] of prev) {
          if (pendingMutations.current.has(id)) {
            next.set(id, override);
          }
        }
        return next;
      });
    }
  }, [serverStories]);

  const stories = useMemo(() => {
    if (!serverStories) return [];
    return serverStories.map((s) => {
      const override = localOverrides.get(s.id);
      return override ? { ...s, ...override } : s;
    });
  }, [serverStories, localOverrides]);

  const handleStoriesChange = useCallback(
    (updater: (prev: UserStory[]) => UserStory[]) => {
      if (!serverStories) return;
      const updated = updater(stories);
      const overrides = new Map<number, Partial<UserStory>>();
      for (const s of updated) {
        const original = serverStories.find((os) => os.id === s.id);
        if (
          original &&
          (s.status !== original.status ||
            s.swimlane !== original.swimlane ||
            s.kanban_order !== original.kanban_order)
        ) {
          overrides.set(s.id, {
            status: s.status,
            swimlane: s.swimlane,
            kanban_order: s.kanban_order,
          });
        }
      }
      setLocalOverrides(overrides);
    },
    [serverStories, stories],
  );

  const handleQuickEdit = useCallback(
    (story: UserStory, field: string, value: unknown) => {
      patchUs.mutate({
        id: story.id,
        data: { [field]: value, version: story.version },
      });
    },
    [patchUs],
  );

  const isFilterOpen = useKanbanStore((s) => s.isFilterOpen);
  const toggleFilter = useKanbanStore((s) => s.toggleFilter);
  const activeFiltersCount = useKanbanStore((s) => {
    const f = s.filters;
    return (
      f.assignedUsers.length +
      f.tags.length +
      f.epics.length +
      f.owners.length +
      (f.q ? 1 : 0)
    );
  });

  if (storiesLoading) return <Loading />;
  if (storiesError) return <ErrorBox error={storiesError} />;

  return (
    <div className="kanban-page flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-taiga-grey-lighter bg-white shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-taiga-text">Kanban</h1>
          <button
            className={`btn-ghost text-xs ${isFilterOpen ? 'bg-taiga-grey-lighter/60' : ''}`}
            onClick={toggleFilter}
          >
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-taiga-green-dark text-white text-[10px]">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
        <div className="flex items-center gap-3">
          <BoardZoom />
        </div>
      </header>

      {/* Filter panel */}
      {isFilterOpen && (
        <div className="px-4 pt-3">
          <KanbanFilterBar
            project={project}
            stories={stories}
            epics={epics}
          />
        </div>
      )}

      {/* Board */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <KanbanBoard
          project={project}
          stories={stories}
          swimlanes={swimlanes ?? []}
          onStoriesChange={handleStoriesChange}
          onQuickEdit={handleQuickEdit}
          pendingMutations={pendingMutations}
        />
      </div>
    </div>
  );
}
