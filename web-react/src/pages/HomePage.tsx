import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projects as projectsApi, timeline } from '../api/resources';
import { useAuthStore } from '../stores/auth';
import type { ProjectListEntry, TimelineEntry } from '../types';
import Loader from '../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';

function parseEventType(eventType: string): { module: string; action: string } {
  const parts = eventType.split('.');
  return {
    module: parts[1] || parts[0] || 'unknown',
    action: parts[2] || 'change',
  };
}

function getTypeLabel(module: string): string {
  const labels: Record<string, string> = {
    userstory: 'User story',
    userstories: 'User story',
    task: 'Task',
    tasks: 'Task',
    issue: 'Issue',
    issues: 'Issue',
    epic: 'Epic',
    epics: 'Epic',
    wiki: 'Wiki',
    wikipage: 'Wiki',
    milestone: 'Sprint',
    milestones: 'Sprint',
  };
  return labels[module.toLowerCase()] || module;
}

function WorkingOnSection({ userId }: { userId: number }) {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['user-timeline', userId],
    queryFn: async () => {
      const res = await timeline.getUserTimeline(userId, { page_size: 20 });
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="working-on-section">
      <h3>Working on</h3>
      {!timelineData?.length ? (
        <p className="empty-state">No recent activity</p>
      ) : (
        <ul className="timeline-list">
          {timelineData.map((entry: TimelineEntry) => {
            const { module, action } = parseEventType(entry.event_type);
            const typeLabel = getTypeLabel(module);
            const subject = (entry.data as Record<string, unknown>)?.subject as string | undefined;
            const ref = (entry.data as Record<string, unknown>)?.ref as number | undefined;
            const projectSlug = ((entry.data as Record<string, unknown>)?.project as Record<string, unknown>)?.slug as string | undefined;
            const projectName = ((entry.data as Record<string, unknown>)?.project as Record<string, unknown>)?.name as string | undefined;

            return (
              <li key={entry.id} className="timeline-item">
                <div className="timeline-event">
                  <div className="timeline-event-header">
                    {projectName && <span className="timeline-project">{projectName}</span>}
                    <span className="timeline-type-badge">{typeLabel}</span>
                    <span className="timeline-action">{action === 'create' ? 'Create' : 'Change'}</span>
                  </div>
                  {(ref || subject) && (
                    <div className="timeline-event-subject">
                      {ref && projectSlug ? (
                        <Link to={`/project/${projectSlug}/${module.toLowerCase().replace(/s$/, '')}/${ref}`}>
                          #{ref} {subject}
                        </Link>
                      ) : (
                        <span>{ref ? `#${ref} ` : ''}{subject}</span>
                      )}
                    </div>
                  )}
                  <span className="timeline-date">
                    {formatDistanceToNow(new Date(entry.created), { addSuffix: true })}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const { data: projectsList, isLoading } = useQuery({
    queryKey: ['my-projects'],
    queryFn: async () => {
      const res = await projectsApi.list({ member: user?.id, order_by: 'user_order', slight: true });
      return res.data;
    },
    enabled: !!user,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="home-page">
      <div className="home-content">
        <div className="home-projects">
          <h2>My Projects</h2>
          {!projectsList?.length ? (
            <div className="empty-state">
              <p>You don't have any projects yet.</p>
              <Link to="/project/new" className="btn btn-primary">Create a project</Link>
            </div>
          ) : (
            <div className="project-cards">
              {projectsList.map((p: ProjectListEntry) => (
                <Link key={p.id} to={`/project/${p.slug}/`} className="project-card">
                  <div className="project-card-header">
                    {p.logo_small_url ? (
                      <img src={p.logo_small_url} alt={p.name} className="project-card-logo" />
                    ) : (
                      <div className="project-card-logo-placeholder">
                        {p.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <h3>{p.name}</h3>
                      {p.is_private && <span className="badge badge-private">Private</span>}
                    </div>
                  </div>
                  {p.description && (
                    <p className="project-card-desc">{p.description.slice(0, 120)}{p.description.length > 120 ? '...' : ''}</p>
                  )}
                  <div className="project-card-meta">
                    <span>{p.total_fans} fans</span>
                    <span>{p.total_watchers} watchers</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        {user && <WorkingOnSection userId={user.id} />}
      </div>
    </div>
  );
}
