import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { userstories, milestones as milestonesApi } from '../api/resources';
import type { Project, UserStory, Milestone } from '../types';
import Loader from '../components/common/Loader';
import { useState } from 'react';

function StoryRow({ story, project }: { story: UserStory; project: Project }) {
  const statusInfo = project.us_statuses.find((s) => s.id === story.status);
  return (
    <div className="backlog-row">
      <div className="backlog-row-ref">
        <Link to={`/project/${project.slug}/us/${story.ref}`} className="ref-link">
          #{story.ref}
        </Link>
      </div>
      <div className="backlog-row-subject">
        <Link to={`/project/${project.slug}/us/${story.ref}`}>{story.subject}</Link>
      </div>
      <div className="backlog-row-status">
        <span className="status-badge" style={{ borderColor: statusInfo?.color }}>
          {statusInfo?.name || 'Unknown'}
        </span>
      </div>
      <div className="backlog-row-points">
        {story.total_points != null ? story.total_points : '-'}
      </div>
      <div className="backlog-row-assigned">
        {story.assigned_to_extra_info?.full_name_display || 'Unassigned'}
      </div>
    </div>
  );
}

function SprintPanel({ milestone, project }: { milestone: Milestone; project: Project }) {
  const [collapsed, setCollapsed] = useState(milestone.closed);

  return (
    <div className={`sprint-panel ${milestone.closed ? 'closed' : 'open'}`}>
      <div className="sprint-header" onClick={() => setCollapsed(!collapsed)}>
        <span className="sprint-toggle">{collapsed ? '▶' : '▼'}</span>
        <h3>
          <Link to={`/project/${project.slug}/taskboard/${milestone.slug}`}>{milestone.name}</Link>
        </h3>
        <div className="sprint-meta">
          <span>{milestone.estimated_start} - {milestone.estimated_finish}</span>
          <span className="sprint-points">{milestone.closed_points}/{milestone.total_points} points</span>
        </div>
      </div>
      {!collapsed && (
        <div className="sprint-stories">
          {milestone.user_stories?.map((us: UserStory) => (
            <StoryRow key={us.id} story={us} project={project} />
          ))}
          {(!milestone.user_stories || milestone.user_stories.length === 0) && (
            <p className="empty-state-small">No user stories in this sprint</p>
          )}
        </div>
      )}
    </div>
  );
}

export default function BacklogPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const queryClient = useQueryClient();
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);

  const { data: stories, isLoading: storiesLoading } = useQuery({
    queryKey: ['backlog-stories', project.id],
    queryFn: async () => {
      const res = await userstories.list({
        project: project.id,
        milestone__isnull: true,
        order_by: 'backlog_order',
      });
      return res.data;
    },
  });

  const { data: sprintsList, isLoading: sprintsLoading } = useQuery({
    queryKey: ['milestones', project.id],
    queryFn: async () => {
      const res = await milestonesApi.list(project.id, { order_by: '-estimated_start' });
      return res.data;
    },
  });

  const bulkCreateMutation = useMutation({
    mutationFn: async (text: string) => {
      await userstories.bulkCreate(project.id, text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backlog-stories', project.id] });
      setBulkText('');
      setShowBulk(false);
    },
  });

  if (storiesLoading || sprintsLoading) return <Loader />;

  return (
    <div className="backlog-page">
      <div className="backlog-header">
        <h1>Backlog</h1>
        <div className="backlog-actions">
          <button className="btn btn-secondary" onClick={() => setShowBulk(!showBulk)}>
            + Add user stories
          </button>
        </div>
      </div>

      {showBulk && (
        <div className="bulk-create-form">
          <textarea
            placeholder="Write one user story per line"
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            rows={4}
          />
          <div className="bulk-actions">
            <button className="btn btn-primary" onClick={() => bulkCreateMutation.mutate(bulkText)} disabled={!bulkText.trim()}>
              Create
            </button>
            <button className="btn btn-secondary" onClick={() => setShowBulk(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="backlog-content">
        <div className="sprints-section">
          {sprintsList?.map((milestone: Milestone) => (
            <SprintPanel key={milestone.id} milestone={milestone} project={project} />
          ))}
        </div>

        <div className="backlog-section">
          <h2>Product Backlog ({stories?.length || 0})</h2>
          <div className="backlog-list">
            <div className="backlog-row backlog-row-header">
              <div className="backlog-row-ref">Ref</div>
              <div className="backlog-row-subject">Subject</div>
              <div className="backlog-row-status">Status</div>
              <div className="backlog-row-points">Points</div>
              <div className="backlog-row-assigned">Assigned</div>
            </div>
            {stories?.map((story: UserStory) => (
              <StoryRow key={story.id} story={story} project={project} />
            ))}
            {(!stories || stories.length === 0) && (
              <div className="empty-state">
                <p>The backlog is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
