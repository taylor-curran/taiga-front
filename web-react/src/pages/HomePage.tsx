import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projects as projectsApi, timeline } from '../api/resources';
import { useAuthStore } from '../stores/auth';
import type { ProjectListEntry, TimelineEntry } from '../types';
import Loader from '../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';

type WorkingOnEntry = Omit<TimelineEntry, 'data'> & {
  data?: {
    project?: { id?: number; slug?: string; name?: string; logo_big_url?: string | null };
    userstory?: { id?: number; ref?: number; subject?: string; status?: { name?: string } };
    task?: { id?: number; ref?: number; subject?: string; status?: { name?: string } };
    issue?: { id?: number; ref?: number; subject?: string; status?: { name?: string } };
  };
};

function workingOnHref(entry: WorkingOnEntry): string {
  const slug = entry.data?.project?.slug;
  if (!slug) return '#';
  if (entry.data?.userstory?.ref) return `/project/${slug}/us/${entry.data.userstory.ref}`;
  if (entry.data?.task?.ref) return `/project/${slug}/task/${entry.data.task.ref}`;
  if (entry.data?.issue?.ref) return `/project/${slug}/issue/${entry.data.issue.ref}`;
  return `/project/${slug}/`;
}

function workingOnLabel(entry: WorkingOnEntry): { kind: string; subject: string } {
  if (entry.data?.userstory) return { kind: 'User story', subject: entry.data.userstory.subject || '' };
  if (entry.data?.task) return { kind: 'Task', subject: entry.data.task.subject || '' };
  if (entry.data?.issue) return { kind: 'Issue', subject: entry.data.issue.subject || '' };
  return { kind: entry.event_type.replace(/\./g, ' '), subject: '' };
}

function WorkingOnSection({ userId }: { userId: number }) {
  const { data: timelineData, isLoading } = useQuery({
    queryKey: ['user-timeline', userId],
    queryFn: async () => {
      const res = await timeline.getUserTimeline(userId, { page_size: 20 });
      return res.data as WorkingOnEntry[];
    },
  });

  if (isLoading) return <Loader />;

  return (
    <tg-working-on className="dashboard-container working-on">
      <h3>Working on</h3>
      {!timelineData?.length ? (
        <p className="empty-state">It feels empty, doesn't it?</p>
      ) : (
        <ul className="timeline-list working-on-items">
          {timelineData.map((entry) => {
            const { kind, subject } = workingOnLabel(entry);
            const projectName = entry.data?.project?.name;
            const status = entry.data?.userstory?.status?.name
              || entry.data?.task?.status?.name
              || entry.data?.issue?.status?.name;
            return (
              <li key={entry.id} className="timeline-item working-on-item">
                <Link to={workingOnHref(entry)} className="working-on-link">
                  <span className="working-on-kind">{kind}</span>
                  {projectName && (
                    <span className="working-on-project"> · {projectName}</span>
                  )}
                  {subject && (
                    <span className="working-on-subject"> · {subject}</span>
                  )}
                  {status && (
                    <span className="working-on-status"> · {status}</span>
                  )}
                  <span className="working-on-date">
                    {' '}{formatDistanceToNow(new Date(entry.created), { addSuffix: true })}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </tg-working-on>
  );
}

export default function HomePage() {
  const user = useAuthStore((s) => s.user);

  const { data: projectsList, isLoading } = useQuery({
    queryKey: ['home-projects', user?.id],
    queryFn: async () => {
      // Mirror Angular's projects-dashboard: show every project visible to
      // the authenticated user (member projects + watched/owned ones).
      const res = await projectsApi.list({ order_by: 'user_order', slight: true });
      return res.data || [];
    },
    enabled: !!user,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="home-page home-wrapper centered">
      <div className="duty-summary home-content">
        <h1>Projects Dashboard</h1>
        {user && <WorkingOnSection userId={user.id} />}
      </div>
      <aside className="project-list home-projects">
        <h2 className="project-list-heading">My Projects</h2>
        {!projectsList?.length ? (
          <div className="empty-state">
            <p>You don't have any project yet.</p>
            <Link to="/project/new" className="btn btn-primary">Create a project</Link>
          </div>
        ) : (
          <ul className="project-cards project-list-items">
            {projectsList.map((p: ProjectListEntry) => (
              <li key={p.id} className="project-list-item">
                <Link to={`/project/${p.slug}/`} className="project-card project-list-link">
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
              </li>
            ))}
          </ul>
        )}
      </aside>
    </div>
  );
}
