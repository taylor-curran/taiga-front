import { Link } from 'react-router-dom';
import { useMyProjects } from '@/services/projects';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { ProjectCard } from '@/components/ProjectCard';

export function ProjectsListPage() {
  const { data, isLoading, error } = useMyProjects();
  return (
    <>
      <header className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link to="/project/new" className="btn-primary text-sm">New project</Link>
      </header>
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      {data && data.length === 0 && (
        <Empty title="You have no projects yet" />
      )}
      {data && data.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </>
  );
}
