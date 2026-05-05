import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { userstories } from '../api/resources';
import type { Project, UserStory, Status } from '../types';
import Loader from '../components/common/Loader';
import { useState, useMemo } from 'react';

type ZoomLevel = 0 | 1 | 2 | 3;
const ZOOM_LABELS: Record<ZoomLevel, string> = { 0: 'Compact', 1: 'Default', 2: 'Detailed', 3: 'Full' };

function KanbanCard({ story, project, zoom }: { story: UserStory; project: Project; zoom: ZoomLevel }) {
  return (
    <div className={`kanban-card zoom-${zoom}`}>
      {zoom >= 1 && (
        <div className="kanban-card-header">
          {story.epics?.map((epic) => (
            <span key={epic.id} className="epic-badge" style={{ backgroundColor: epic.color }}>
              {epic.subject}
            </span>
          ))}
        </div>
      )}
      <div className="kanban-card-title">
        <Link to={`/project/${project.slug}/us/${story.ref}`} className="ref-link">#{story.ref}</Link>
        <Link to={`/project/${project.slug}/us/${story.ref}`} className="kanban-card-subject">
          {story.subject}
        </Link>
      </div>
      {zoom >= 1 && (
        <div className="kanban-card-footer">
          {story.assigned_to_extra_info ? (
            <img
              className="avatar-sm"
              src={story.assigned_to_extra_info.photo || `https://www.gravatar.com/avatar/${story.assigned_to_extra_info.gravatar_id}?s=24&d=mm`}
              alt={story.assigned_to_extra_info.full_name_display}
              title={story.assigned_to_extra_info.full_name_display}
            />
          ) : (
            <span className="unassigned-avatar-sm" title="Not assigned" />
          )}
          {zoom >= 2 && story.tags?.map(([tag, color]) => (
            <span key={tag} className="tag-badge-sm" style={{ backgroundColor: color || '#a9aabc' }}>{tag}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function KanbanColumn({
  status,
  stories,
  project,
  zoom,
  folded,
  onToggleFold,
}: {
  status: Status;
  stories: UserStory[];
  project: Project;
  zoom: ZoomLevel;
  folded: boolean;
  onToggleFold: () => void;
}) {
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ storyId, newStatus, version }: { storyId: number; newStatus: number; version: number }) => {
      await userstories.update(storyId, { status: newStatus, version });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-stories', project.id] });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData('application/json');
    if (data) {
      const { storyId, version } = JSON.parse(data);
      updateStatusMutation.mutate({ storyId, newStatus: status.id, version });
    }
  };

  if (folded) {
    return (
      <div className="kanban-column folded" onClick={onToggleFold}>
        <div className="kanban-column-header-folded">
          <span className="column-color" style={{ backgroundColor: status.color }} />
          <span className="column-name-vertical">{status.name}</span>
          <span className="column-count">{stories.length}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="kanban-column"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header">
        <span className="column-color" style={{ backgroundColor: status.color }} />
        <h3>{status.name}</h3>
        <button type="button" className="btn-icon-sm" onClick={onToggleFold} title="Fold column">‹</button>
      </div>
      <div className="kanban-column-body">
        {stories.map((story) => (
          <div
            key={story.id}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData('application/json', JSON.stringify({ storyId: story.id, version: story.version }))
            }
          >
            <KanbanCard story={story} project={project} zoom={zoom} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SwimlaneRow({
  swimlane,
  storiesByStatus,
  statuses,
  project,
  zoom,
  foldedColumns,
  onToggleFold,
}: {
  swimlane: { id: number | null; name: string };
  storiesByStatus: Map<number, UserStory[]>;
  statuses: Status[];
  project: Project;
  zoom: ZoomLevel;
  foldedColumns: Set<number>;
  onToggleFold: (statusId: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="swimlane-row">
      <div className="swimlane-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="swimlane-toggle">{collapsed ? '▶' : '▼'}</span>
        <h2>{swimlane.name}</h2>
      </div>
      {!collapsed && (
        <div className="swimlane-columns">
          {statuses.map((status) => {
            const stories = storiesByStatus.get(status.id) || [];
            return (
              <KanbanColumn
                key={status.id}
                status={status}
                stories={stories}
                project={project}
                zoom={zoom}
                folded={foldedColumns.has(status.id)}
                onToggleFold={() => onToggleFold(status.id)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function KanbanPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const [zoom, setZoom] = useState<ZoomLevel>(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [foldedColumns, setFoldedColumns] = useState<Set<number>>(new Set());

  const { data: stories, isLoading } = useQuery({
    queryKey: ['kanban-stories', project.id],
    queryFn: async () => {
      const res = await userstories.list({
        project: project.id,
        order_by: 'kanban_order',
      });
      return res.data;
    },
  });

  const statuses = useMemo(
    () => [...project.us_statuses].sort((a, b) => a.order - b.order),
    [project.us_statuses],
  );

  const hasSwimlanes = project.swimlanes && project.swimlanes.length > 0;

  const filteredStories = useMemo(() => {
    if (!stories) return [];
    if (!searchQuery.trim()) return stories;
    const q = searchQuery.toLowerCase();
    return stories.filter((s: UserStory) =>
      s.subject.toLowerCase().includes(q) || String(s.ref).includes(q),
    );
  }, [stories, searchQuery]);

  const swimlaneData = useMemo(() => {
    if (!filteredStories.length) return [];
    if (!hasSwimlanes) {
      const byStatus = new Map<number, UserStory[]>();
      for (const s of statuses) byStatus.set(s.id, []);
      for (const story of filteredStories) {
        const arr = byStatus.get(story.status);
        if (arr) arr.push(story);
      }
      return [{ swimlane: { id: null, name: '' } as { id: number | null; name: string }, byStatus }];
    }
    const lanes: Array<{ swimlane: { id: number | null; name: string }; byStatus: Map<number, UserStory[]> }> = [];
    for (const sl of project.swimlanes) {
      const byStatus = new Map<number, UserStory[]>();
      for (const s of statuses) byStatus.set(s.id, []);
      for (const story of filteredStories.filter((st: UserStory) => st.swimlane === sl.id)) {
        const arr = byStatus.get(story.status);
        if (arr) arr.push(story);
      }
      lanes.push({ swimlane: sl, byStatus });
    }
    const unassigned = filteredStories.filter((st: UserStory) => st.swimlane == null);
    if (unassigned.length > 0) {
      const byStatus = new Map<number, UserStory[]>();
      for (const s of statuses) byStatus.set(s.id, []);
      for (const story of unassigned) {
        const arr = byStatus.get(story.status);
        if (arr) arr.push(story);
      }
      lanes.push({ swimlane: { id: null, name: 'Unclassified' }, byStatus });
    }
    return lanes;
  }, [filteredStories, statuses, hasSwimlanes, project.swimlanes]);

  const toggleFold = (statusId: number) => {
    setFoldedColumns((prev) => {
      const next = new Set(prev);
      if (next.has(statusId)) next.delete(statusId);
      else next.add(statusId);
      return next;
    });
  };

  if (isLoading) return <Loader />;

  return (
    <tg-kanban-board className="kanban-page">
      <div className="kanban-toolbar">
        <h1>Kanban</h1>
        <div className="kanban-toolbar-actions">
          <button type="button" className="btn btn-default filters-btn">Filters</button>
          <div className="search-input">
            <input
              type="search"
              placeholder="subject or reference"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="zoom-control">
            <span>Zoom:</span>
            {([0, 1, 2, 3] as ZoomLevel[]).map((z) => (
              <button
                key={z}
                className={`btn btn-sm ${zoom === z ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setZoom(z)}
                title={ZOOM_LABELS[z]}
              >
                {ZOOM_LABELS[z]}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="kanban-board-container">
        {/* Column headers */}
        <div className="kanban-column-headers">
          {statuses.map((status) => (
            <div
              key={status.id}
              className={`kanban-col-header ${foldedColumns.has(status.id) ? 'folded' : ''}`}
              onClick={() => foldedColumns.has(status.id) && toggleFold(status.id)}
            >
              <span className="column-color" style={{ backgroundColor: status.color }} />
              <h2 className="column-name">{status.name}</h2>
              {!foldedColumns.has(status.id) && (
                <button type="button" className="btn-icon-sm" onClick={(e) => { e.stopPropagation(); toggleFold(status.id); }} title="Fold column">‹</button>
              )}
            </div>
          ))}
        </div>
        {/* Swimlane rows */}
        {swimlaneData.map(({ swimlane, byStatus }, i) => (
          <SwimlaneRow
            key={swimlane.id ?? `default-${i}`}
            swimlane={swimlane}
            storiesByStatus={byStatus}
            statuses={statuses}
            project={project}
            zoom={zoom}
            foldedColumns={foldedColumns}
            onToggleFold={toggleFold}
          />
        ))}
      </div>
    </tg-kanban-board>
  );
}
