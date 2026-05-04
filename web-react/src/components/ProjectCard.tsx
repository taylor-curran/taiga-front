import { Link } from 'react-router-dom';
import type { ProjectSummary } from '@/types/api';

interface ProjectCardProps {
  project: ProjectSummary;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      to={`/project/${project.slug}/`}
      className="card p-4 hover:shadow-md transition-shadow text-taiga-text no-underline hover:no-underline block"
    >
      <div className="flex items-start gap-3">
        {project.logo_small_url ? (
          <img
            src={project.logo_small_url}
            alt=""
            className="w-12 h-12 rounded object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded bg-taiga-green-dark text-white font-bold flex items-center justify-center text-lg">
            {(project.name || '?').slice(0, 2).toUpperCase()}
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
            {project.total_milestones != null && (
              <span>{project.total_milestones} sprints</span>
            )}
            {project.total_fans != null && <span>★ {project.total_fans}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
