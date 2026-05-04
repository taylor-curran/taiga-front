import { Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useProjectStats, useToggleLike, useToggleWatch } from '@/services/projects';
import { useProjectTimeline } from '@/services/timeline';
import { Loading } from '@/components/common/Loading';
import { Avatar } from '@/components/common/Avatar';
import { formatDistanceToNow } from 'date-fns';

function StatCard({
  label,
  value,
  to,
}: {
  label: string;
  value: string | number;
  to?: string;
}) {
  const inner = (
    <>
      <div className="text-2xl font-bold text-taiga-green-dark">{value}</div>
      <div className="text-xs text-taiga-grey-light mt-1">{label}</div>
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        className="card p-4 text-center hover:shadow-md no-underline hover:no-underline text-taiga-text transition-shadow"
      >
        {inner}
      </Link>
    );
  }
  return <div className="card p-4 text-center">{inner}</div>;
}

export function ProjectHomePage() {
  const project = useCurrentProject();
  const { data: stats } = useProjectStats(project.id);
  const { data: timeline, isLoading: timelineLoading } = useProjectTimeline(project.id);
  const likeMutation = useToggleLike();
  const watchMutation = useToggleWatch();

  const memberCount = project.members?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Project header */}
      <div className="card p-6">
        <div className="flex items-start gap-4">
          {project.logo_big_url || project.logo_small_url ? (
            <img
              src={project.logo_big_url ?? project.logo_small_url ?? ''}
              alt=""
              className="w-16 h-16 rounded object-cover flex-shrink-0"
            />
          ) : (
            <span className="w-16 h-16 rounded bg-taiga-green-dark text-white text-2xl font-bold flex items-center justify-center flex-shrink-0">
              {(project.name || '?').slice(0, 2).toUpperCase()}
            </span>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-taiga-grey-light text-sm mb-3">{project.description}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {project.is_private ? (
                <span className="badge">Private</span>
              ) : (
                <span className="badge">Public</span>
              )}
              {project.tags?.map((tag) => (
                <span key={String(tag)} className="badge">
                  {String(tag)}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              className={`btn-ghost text-sm flex items-center gap-1 ${project.is_fan ? 'text-taiga-green-dark' : ''}`}
              onClick={() =>
                likeMutation.mutate({ projectId: project.id, isLiked: !!project.is_fan })
              }
              disabled={likeMutation.isPending}
            >
              {'★ '}{project.total_fans ?? 0}
            </button>
            <button
              className={`btn-ghost text-sm flex items-center gap-1 ${project.is_watcher ? 'text-taiga-green-dark' : ''}`}
              onClick={() =>
                watchMutation.mutate({ projectId: project.id, isWatched: !!project.is_watcher })
              }
              disabled={watchMutation.isPending}
            >
              {'👁 '}{project.total_watchers ?? 0}
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Sprints"
          value={project.total_milestones ?? 0}
          to={`/project/${project.slug}/backlog`}
        />
        <StatCard
          label="Members"
          value={memberCount}
          to={`/project/${project.slug}/team`}
        />
        <StatCard
          label="Story points"
          value={stats?.total_points ?? project.total_story_points ?? 0}
        />
        <StatCard
          label="Closed points"
          value={stats?.closed_points ?? 0}
        />
      </div>

      {/* Module links */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {project.is_backlog_activated !== false && (
          <Link
            to={`/project/${project.slug}/backlog`}
            className="card p-3 text-center text-sm hover:shadow-md no-underline hover:no-underline text-taiga-text transition-shadow"
          >
            Backlog
          </Link>
        )}
        {project.is_kanban_activated !== false && (
          <Link
            to={`/project/${project.slug}/kanban`}
            className="card p-3 text-center text-sm hover:shadow-md no-underline hover:no-underline text-taiga-text transition-shadow"
          >
            Kanban
          </Link>
        )}
        {project.is_issues_activated !== false && (
          <Link
            to={`/project/${project.slug}/issues`}
            className="card p-3 text-center text-sm hover:shadow-md no-underline hover:no-underline text-taiga-text transition-shadow"
          >
            Issues
          </Link>
        )}
        {project.is_epics_activated !== false && (
          <Link
            to={`/project/${project.slug}/epics`}
            className="card p-3 text-center text-sm hover:shadow-md no-underline hover:no-underline text-taiga-text transition-shadow"
          >
            Epics
          </Link>
        )}
        {project.is_wiki_activated !== false && (
          <Link
            to={`/project/${project.slug}/wiki`}
            className="card p-3 text-center text-sm hover:shadow-md no-underline hover:no-underline text-taiga-text transition-shadow"
          >
            Wiki
          </Link>
        )}
      </div>

      {/* Team members preview */}
      {project.members && project.members.length > 0 && (
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Team</h2>
            <Link
              to={`/project/${project.slug}/team`}
              className="text-sm text-taiga-link"
            >
              View all
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {project.members.slice(0, 12).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-2 px-2 py-1 rounded bg-taiga-grey-lighter/20"
                title={member.full_name ?? member.username ?? ''}
              >
                <Avatar
                  name={member.full_name ?? member.username}
                  src={member.photo}
                  size={24}
                />
                <span className="text-xs truncate max-w-[100px]">
                  {member.full_name ?? member.username ?? 'Unknown'}
                </span>
                {member.role_name && (
                  <span className="text-xs text-taiga-grey-light">
                    {member.role_name}
                  </span>
                )}
              </div>
            ))}
            {project.members.length > 12 && (
              <span className="text-xs text-taiga-grey-light self-center">
                +{project.members.length - 12} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="card p-4">
        <h2 className="font-semibold mb-3">Recent activity</h2>
        {timelineLoading && <Loading label="Loading activity..." />}
        {timeline && timeline.length === 0 && (
          <p className="text-sm text-taiga-grey-light">No recent activity.</p>
        )}
        {timeline && timeline.length > 0 && (
          <div className="space-y-2">
            {timeline.slice(0, 10).map((entry) => (
              <div key={entry.id} className="flex items-start gap-2 text-sm py-1 border-b border-taiga-grey-lighter/30 last:border-0">
                <span className="text-xs text-taiga-grey-light flex-shrink-0 w-24">
                  {formatDistanceToNow(new Date(entry.created), { addSuffix: true })}
                </span>
                <span className="text-taiga-text">
                  {String((entry.data as Record<string, Record<string, unknown>>)?.user?.name ?? 'Someone')}{' '}
                  <span className="text-taiga-grey-light">
                    {entry.event_type.replace(/\./g, ' ')}
                  </span>
                </span>
              </div>
            ))}
            <Link
              to={`/project/${project.slug}/timeline`}
              className="block text-sm text-taiga-link mt-2"
            >
              View full timeline
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
