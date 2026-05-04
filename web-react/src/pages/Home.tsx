import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { useMyProjects } from '@/services/projects';
import { useWorkInProgress } from '@/services/workInProgress';
import { Loading } from '@/components/common/Loading';
import { Empty } from '@/components/common/Empty';
import { ErrorBox } from '@/components/common/ErrorBox';
import { ProjectCard } from '@/components/ProjectCard';
import { DutyList } from '@/components/home/DutyList';

export function HomePage() {
  const user = useAuth((s) => s.user);
  const { data: projects, isLoading, error } = useMyProjects();
  const { data: wip, isLoading: wipLoading } = useWorkInProgress(user?.id);

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
    <div className="home-wrapper grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Working on / Watching section */}
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>

        {/* Working on */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-taiga-text">Working on</h2>
          {wipLoading ? (
            <Loading label="Loading duties..." />
          ) : wip && wip.assignedTo.length > 0 ? (
            <DutyList duties={wip.assignedTo} />
          ) : (
            <p className="text-sm text-taiga-grey-light">
              You have no open items assigned to you.
            </p>
          )}
        </section>

        {/* Watching */}
        <section>
          <h2 className="text-lg font-semibold mb-3 text-taiga-text">Watching</h2>
          {wipLoading ? (
            <Loading label="Loading duties..." />
          ) : wip && wip.watching.length > 0 ? (
            <DutyList duties={wip.watching} />
          ) : (
            <p className="text-sm text-taiga-grey-light">
              You are not watching any items.
            </p>
          )}
        </section>
      </div>

      {/* Projects sidebar */}
      <aside>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="text-lg font-semibold">Your projects</h2>
          <Link to="/project/new" className="btn-primary text-xs">New project</Link>
        </div>
        {!projects || projects.length === 0 ? (
          <Empty title="No projects yet" message="Create one to get started." />
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} compact />
            ))}
            <Link
              to="/projects/"
              className="block text-center text-sm text-taiga-link hover:underline mt-2"
            >
              Manage projects
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
