import { Link } from 'react-router-dom';
import type { ProjectSummary } from '@/types/api';

interface ProjectCardProps {
  project: ProjectSummary;
  compact?: boolean;
  listView?: boolean;
}

export function ProjectCard({ project, compact, listView }: ProjectCardProps) {
  const logo = project.logo_small_url;
  const initials = (project.name || '?').slice(0, 2).toUpperCase();

  if (compact) {
    return (
      <Link
        to={`/project/${project.slug}/`}
        className="flex items-center gap-3 p-2 rounded hover:bg-taiga-grey-lighter/30 no-underline hover:no-underline text-taiga-text"
      >
        {logo ? (
          <img src={logo} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
        ) : (
          <span className="w-9 h-9 rounded bg-taiga-green-dark text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
            {initials}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm truncate">{project.name}</div>
          <div className="text-xs text-taiga-grey-light flex items-center gap-2">
            {project.is_private ? 'Private' : 'Public'}
            {project.total_fans != null && <span>{'★ ' + project.total_fans}</span>}
          </div>
        </div>
      </Link>
    );
  }

  if (listView) {
    return (
      <Link
        to={`/project/${project.slug}/`}
        className="flex items-center gap-4 p-4 card hover:shadow-md transition-shadow no-underline hover:no-underline text-taiga-text"
      >
        {logo ? (
          <img src={logo} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />
        ) : (
          <span className="w-12 h-12 rounded bg-taiga-green-dark text-white font-bold flex items-center justify-center text-lg flex-shrink-0">
            {initials}
          </span>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{project.name}</h3>
          <p className="text-xs text-taiga-grey-light line-clamp-1">
            {project.description || ' '}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-taiga-grey-light flex-shrink-0">
          {project.is_private ? (
            <span className="badge">Private</span>
          ) : (
            <span className="badge">Public</span>
          )}
          {project.members && (
            <span title="Members">{project.members.length} members</span>
          )}
          {project.total_fans != null && <span title="Likes">{'★ ' + project.total_fans}</span>}
          {project.total_watchers != null && <span title="Watchers">{'👁 ' + project.total_watchers}</span>}
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/project/${project.slug}/`}
      className="card p-4 hover:shadow-md transition-shadow text-taiga-text no-underline hover:no-underline block"
    >
      <div className="flex items-start gap-3">
        {logo ? (
          <img src={logo} alt="" className="w-12 h-12 rounded object-cover" />
        ) : (
          <div className="w-12 h-12 rounded bg-taiga-green-dark text-white font-bold flex items-center justify-center text-lg">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{project.name}</h3>
          <p className="text-xs text-taiga-grey-light line-clamp-2 min-h-[2.25rem]">
            {project.description || ' '}
          </p>
          <div className="mt-2 flex items-center gap-3 text-xs text-taiga-grey-light">
            {project.is_private ? (
              <span className="badge">Private</span>
            ) : (
              <span className="badge">Public</span>
            )}
            {project.members && (
              <span title="Members">{project.members.length} members</span>
            )}
            {project.total_milestones != null && (
              <span>{project.total_milestones} sprints</span>
            )}
            {project.total_fans != null && <span>{'★ ' + project.total_fans}</span>}
            {project.total_watchers != null && <span>{'👁 ' + project.total_watchers}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
