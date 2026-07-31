import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { epics as epicsApi, userstories } from '../api/resources';
import type { Project, Epic, Status, UserStory } from '../types';
import Loader from '../components/common/Loader';
import { useState } from 'react';

interface RelatedUS {
  epic: number;
  user_story: number;
  order: number;
}

function EpicRow({ epic, project }: { epic: Epic; project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const st = project.epic_statuses.find((s: Status) => s.id === epic.status);
  const total = epic.user_stories_counts.total;
  const progress = epic.user_stories_counts.progress;
  const pct = total > 0 ? Math.round((progress / total) * 100) : 0;

  const { data: relatedStories } = useQuery({
    queryKey: ['epic-related', epic.id],
    queryFn: async () => {
      const relRes = await epicsApi.getRelatedUserstories(epic.id);
      const rels: RelatedUS[] = relRes.data;
      if (rels.length === 0) return [];
      const storyPromises = rels.map((r) => userstories.getById(r.user_story).then((res) => res.data));
      return Promise.all(storyPromises);
    },
    enabled: expanded,
  });

  return (
    <>
      <div className="epic-row" onClick={() => setExpanded(!expanded)}>
        <div className="epic-expand">
          {total > 0 && <span className="expand-toggle">{expanded ? '▼' : '▷'}</span>}
        </div>
        <div className="epic-color-dot" style={{ backgroundColor: epic.color }} />
        <div className="epic-name">
          <Link to={`/project/${project.slug}/epic/${epic.ref}`}>
            <span className="ref">#{epic.ref}</span> {epic.subject}
          </Link>
        </div>
        <div className="epic-assigned">
          {epic.assigned_to_extra_info ? (
            <img
              className="avatar-sm"
              src={epic.assigned_to_extra_info.photo || `https://www.gravatar.com/avatar/${epic.assigned_to_extra_info.gravatar_id}?s=24&d=mm`}
              alt={epic.assigned_to_extra_info.full_name_display}
              title={epic.assigned_to_extra_info.full_name_display}
            />
          ) : (
            <span className="unassigned-avatar-sm" />
          )}
        </div>
        <div className="epic-status">
          <span className="status-badge" style={{ borderColor: st?.color, color: st?.color }}>{st?.name}</span>
        </div>
        <div className="epic-progress-cell">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      {expanded && relatedStories && (
        <div className="epic-related-stories">
          {relatedStories.map((story: UserStory) => {
            const sSt = project.us_statuses.find((s) => s.id === story.status);
            return (
              <div key={story.id} className="related-story-row">
                <Link to={`/project/${project.slug}/us/${story.ref}`}>
                  #{story.ref} {story.subject}
                </Link>
                <span className="status-badge-sm" style={{ borderColor: sSt?.color, color: sSt?.color }}>{sSt?.name}</span>
              </div>
            );
          })}
          {relatedStories.length === 0 && <p className="empty-state-small">No related user stories</p>}
        </div>
      )}
    </>
  );
}

export default function EpicsDashboardPage() {
  const { project } = useOutletContext<{ project: Project }>();

  const { data: epicsList, isLoading } = useQuery({
    queryKey: ['epics', project.id],
    queryFn: async () => {
      const res = await epicsApi.list({ project: project.id, order_by: 'epics_order' });
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="epics-page">
      <header className="epics-header">
        <h1>Epics</h1>
        <span className="view-options-btn">View options</span>
      </header>
      <div className="epics-table">
        <div className="epics-row-header">
          <div className="epic-expand" />
          <div className="epic-color-dot" />
          <div className="epic-name">Name</div>
          <div className="epic-assigned">Assigned</div>
          <div className="epic-status">Status</div>
          <div className="epic-progress-cell">Progress</div>
        </div>
        {epicsList?.map((epic: Epic) => (
          <EpicRow key={epic.id} epic={epic} project={project} />
        ))}
        {(!epicsList || epicsList.length === 0) && (
          <div className="empty-state"><p>No epics</p></div>
        )}
      </div>
    </div>
  );
}
