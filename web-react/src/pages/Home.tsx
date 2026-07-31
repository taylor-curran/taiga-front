import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useMyProjects } from '@/services/projects';
import { Loading } from '@/components/common/Loading';
import { Empty } from '@/components/common/Empty';
import { ErrorBox } from '@/components/common/ErrorBox';
import { ProjectCard } from '@/components/ProjectCard';

export function HomePage() {
  const user = useAuth((s) => s.user);
  const { data, isLoading, error } = useMyProjects();

  if (!user) {
    return (
      <div className="card p-10 text-center">
        <h1 className="text-2xl font-semibold mb-2">Welcome to Taiga</h1>
        <p className="text-taiga-grey-light mb-6">
          Project management for agile teams.
        </p>
        <div className="flex justify-center gap-3">
          <Link to="/login" className="btn-primary">Sign in</Link>
          <Link to="/discover" className="btn-ghost">Discover projects</Link>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  return (
    <>
      <header className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-semibold">Your projects</h1>
        <Link to="/project/new" className="btn-primary text-sm">New project</Link>
      </header>
      {!data || data.length === 0 ? (
        <Empty title="No projects yet" message="Create one to get started." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
