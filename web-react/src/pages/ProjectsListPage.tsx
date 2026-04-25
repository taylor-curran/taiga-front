import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { projects as projectsApi } from '../api/resources';
import { useAuthStore } from '../stores/auth';
import type { ProjectListEntry } from '../types';
import Loader from '../components/common/Loader';

export default function ProjectsListPage() {
  const user = useAuthStore((s) => s.user);

  const { data: projectsList, isLoading } = useQuery({
    queryKey: ['projects-list', user?.id],
    queryFn: async () => {
      const res = await projectsApi.list({ member: user?.id, order_by: 'user_order' });
      return res.data;
    },
    enabled: !!user,
  });

  if (isLoading) return <Loader />;

  return (
    <div className="projects-listing-page">
      <div className="page-header">
        <h1>My Projects</h1>
        <Link to="/project/new" className="btn btn-primary">New project</Link>
      </div>
      {!projectsList?.length ? (
        <div className="empty-state">
          <h3>You don't have any projects yet</h3>
          <p>Create a new project or ask to be invited to an existing one.</p>
        </div>
      ) : (
        <div className="projects-list">
          {projectsList.map((p: ProjectListEntry) => (
            <Link key={p.id} to={`/project/${p.slug}/`} className="project-list-item">
              <div className="project-list-logo">
                {p.logo_small_url ? (
                  <img src={p.logo_small_url} alt={p.name} />
                ) : (
                  <div className="logo-placeholder">{p.name.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="project-list-info">
                <h3>{p.name}</h3>
                {p.description && <p>{p.description.slice(0, 200)}</p>}
              </div>
              <div className="project-list-meta">
                {p.is_private && <span className="badge badge-private">Private</span>}
                <span className="member-count">{p.members.length} members</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
