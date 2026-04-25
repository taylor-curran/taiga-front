import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { userstories } from '../api/resources';
import type { Project, UserStory, Status } from '../types';
import Loader from '../components/common/Loader';
import { useState } from 'react';

function KanbanCard({ story, project }: { story: UserStory; project: Project }) {
  return (
    <div className="kanban-card">
      <div className="kanban-card-header">
        <Link to={`/project/${project.slug}/us/${story.ref}`} className="ref-link">#{story.ref}</Link>
        {story.epics?.map((epic) => (
          <span key={epic.id} className="epic-badge" style={{ backgroundColor: epic.color }}>
            {epic.subject}
          </span>
        ))}
      </div>
      <Link to={`/project/${project.slug}/us/${story.ref}`} className="kanban-card-subject">
        {story.subject}
      </Link>
      <div className="kanban-card-footer">
        {story.assigned_to_extra_info && (
          <span className="assigned-avatar" title={story.assigned_to_extra_info.full_name_display}>
            {story.assigned_to_extra_info.full_name_display.charAt(0)}
          </span>
        )}
        <span className="points-badge">{story.total_points ?? '-'}</span>
        {story.tags?.map(([tag, color]) => (
          <span key={tag} className="tag-badge" style={{ backgroundColor: color || '#a9aabc' }}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

function KanbanColumn({ status, stories, project }: { status: Status; stories: UserStory[]; project: Project }) {
  const [collapsed, setCollapsed] = useState(false);
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async ({ storyId, newStatus }: { storyId: number; newStatus: number }) => {
      await userstories.update(storyId, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban-stories', project.id] });
    },
  });

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const storyId = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (storyId) {
      updateStatusMutation.mutate({ storyId, newStatus: status.id });
    }
  };

  return (
    <div
      className={`kanban-column ${collapsed ? 'collapsed' : ''}`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
    >
      <div className="kanban-column-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="column-color" style={{ backgroundColor: status.color }} />
        <h3>{status.name}</h3>
        <span className="column-count">{stories.length}</span>
      </div>
      {!collapsed && (
        <div className="kanban-column-body">
          {stories.map((story) => (
            <div
              key={story.id}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(story.id))}
            >
              <KanbanCard story={story} project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function KanbanPage() {
  const { project } = useOutletContext<{ project: Project }>();

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

  if (isLoading) return <Loader />;

  const storiesByStatus = new Map<number, UserStory[]>();
  for (const s of project.us_statuses) {
    storiesByStatus.set(s.id, []);
  }
  for (const story of stories || []) {
    const arr = storiesByStatus.get(story.status);
    if (arr) arr.push(story);
    else storiesByStatus.set(story.status, [story]);
  }

  return (
    <div className="kanban-page">
      <div className="kanban-header">
        <h1>Kanban</h1>
      </div>
      <div className="kanban-board">
        {project.us_statuses
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((status) => (
            <KanbanColumn
              key={status.id}
              status={status}
              stories={storiesByStatus.get(status.id) || []}
              project={project}
            />
          ))}
      </div>
    </div>
  );
}
