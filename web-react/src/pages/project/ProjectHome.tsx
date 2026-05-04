import { Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';

export function ProjectHomePage() {
  const project = useCurrentProject();
  return (
    <div className="card p-6">
      <h1 className="text-2xl font-semibold mb-2">{project.name}</h1>
      {project.description && (
        <p className="text-taiga-grey-light mb-4">{project.description}</p>
      )}
      <div className="flex flex-wrap gap-2 mb-6">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <Link to={`/project/${project.slug}/backlog`} className="card p-4 text-center hover:shadow-md no-underline hover:no-underline text-taiga-text">
          <div className="text-xl font-bold">{project.total_milestones ?? 0}</div>
          <div className="text-taiga-grey-light">Sprints</div>
        </Link>
        <Link to={`/project/${project.slug}/team`} className="card p-4 text-center hover:shadow-md no-underline hover:no-underline text-taiga-text">
          <div className="text-xl font-bold">{project.members?.length ?? 0}</div>
          <div className="text-taiga-grey-light">Members</div>
        </Link>
        <Link to={`/project/${project.slug}/issues`} className="card p-4 text-center hover:shadow-md no-underline hover:no-underline text-taiga-text">
          <div className="text-xl font-bold">{project.issue_statuses?.length ?? 0}</div>
          <div className="text-taiga-grey-light">Issue states</div>
        </Link>
        <Link to={`/project/${project.slug}/wiki`} className="card p-4 text-center hover:shadow-md no-underline hover:no-underline text-taiga-text">
          <div className="text-xl font-bold">📖</div>
          <div className="text-taiga-grey-light">Wiki</div>
        </Link>
      </div>
    </div>
  );
}
