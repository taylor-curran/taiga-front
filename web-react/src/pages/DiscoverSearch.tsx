import { FormEvent, useState } from 'react';
import { searchProjects } from '@/services/projects';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { ProjectCard } from '@/components/ProjectCard';

export function DiscoverSearchPage() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState('');

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['discover', 'search', active],
    queryFn: () => searchProjects(active),
    enabled: !!active,
  });

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setActive(query.trim());
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Search public projects</h1>
      <form onSubmit={onSubmit} className="mb-6 flex gap-2">
        <input
          className="input"
          placeholder="Find a project…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn-primary" type="submit" disabled={isFetching}>
          Search
        </button>
      </form>
      {!active && <p className="text-sm text-taiga-grey-light">Type a query to search.</p>}
      {isLoading && active && <Loading />}
      {error && <ErrorBox error={error} />}
      {data && data.length === 0 && active && (
        <Empty title="No matches" message={`Nothing matched "${active}".`} />
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
