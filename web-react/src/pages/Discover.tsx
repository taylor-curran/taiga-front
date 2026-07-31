import { useDiscover } from '@/services/projects';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { ProjectCard } from '@/components/ProjectCard';
import { Link } from 'react-router-dom';

export function DiscoverPage() {
  const { data, isLoading, error } = useDiscover();
  return (
    <>
      <header className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-semibold">Discover projects</h1>
        <Link to="/discover/search" className="btn-ghost text-sm">Search</Link>
      </header>
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      {data && data.length === 0 && (
        <Empty title="No public projects found" />
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
