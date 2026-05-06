import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import { projects as projectsApi } from '../api/resources';
import type { ProjectListEntry } from '../types';
import Loader from '../components/common/Loader';
import { useState } from 'react';

function ProjectCard({ project }: { project: ProjectListEntry }) {
  return (
    <Link to={`/project/${project.slug}/`} className="project-card" title={project.name}>
      <div className="project-card-header">
        {project.logo_small_url ? (
          <img src={project.logo_small_url} alt={project.name} className="project-card-logo" />
        ) : (
          <div className="project-card-logo-placeholder">{project.name.charAt(0)}</div>
        )}
        <div>
          <h3>{project.name}</h3>
          {project.is_private && <span className="badge badge-private">Private</span>}
        </div>
      </div>
      {project.description && <p className="project-card-desc">{project.description.slice(0, 150)}</p>}
      <div className="project-card-meta">
        <span>{project.total_fans} fans</span>
        <span>{project.total_watchers} watchers</span>
        <span>{project.members?.length || 0} members</span>
      </div>
    </Link>
  );
}

function DiscoverSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('text') || '');
  const text = searchParams.get('text') || '';

  const { data: results, isLoading } = useQuery({
    queryKey: ['discover-search', text],
    queryFn: async () => {
      const res = await projectsApi.list({ q: text, order_by: '-total_activity' });
      return res.data;
    },
    enabled: !!text,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ text: query });
    }
  };

  return (
    <div className="discover-page">
      <header className="discover-header">
        <h1>Discover projects</h1>
        <form onSubmit={handleSearch} className="discover-search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type something..."
            autoFocus
          />
          <button type="submit" className="btn-search">Search</button>
        </form>
      </header>

      {isLoading && <Loader />}

      {results && (
        <div className="discover-results">
          <h2>{results.length} projects found</h2>
          <div className="discover-grid">
            {results.map((p: ProjectListEntry) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
          {results.length === 0 && (
            <div className="empty-state"><p>No projects found matching your search.</p></div>
          )}
        </div>
      )}
    </div>
  );
}

function DiscoverHomePage() {
  const [, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState('');

  const { data: allProjects, isLoading } = useQuery({
    queryKey: ['discover-all'],
    queryFn: async () => {
      const res = await projectsApi.list({ is_looking_for_people: false, order_by: '-total_fans' });
      return res.data;
    },
  });

  const { data: mostLiked } = useQuery({
    queryKey: ['discover-most-liked'],
    queryFn: async () => {
      const res = await projectsApi.list({ order_by: '-total_fans', page_size: 5 });
      return res.data;
    },
  });

  const { data: mostActive } = useQuery({
    queryKey: ['discover-most-active'],
    queryFn: async () => {
      const res = await projectsApi.list({ order_by: '-total_activity', page_size: 5 });
      return res.data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ text: query });
    }
  };

  const publicCount = allProjects?.filter((p: ProjectListEntry) => !p.is_private).length ?? 0;

  return (
    <div className="discover-page">
      <header className="discover-header">
        <h1>Discover projects</h1>
        <p className="discover-count">{publicCount} public projects to discover</p>
        <form onSubmit={handleSearch} className="discover-search-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type something..."
          />
          <button type="submit" className="btn-search">Search</button>
        </form>
      </header>

      {isLoading && <Loader />}

      {allProjects && allProjects.length > 0 && (
        <section className="discover-section featured-section">
          <h2>Featured Projects</h2>
          <div className="discover-grid featured-grid">
            {allProjects.slice(0, 4).map((p: ProjectListEntry) => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      <div className="discover-columns">
        {mostLiked && mostLiked.length > 0 && (
          <section className="discover-section">
            <h2>Most liked</h2>
            <div className="discover-list">
              {mostLiked.map((p: ProjectListEntry) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}

        {mostActive && mostActive.length > 0 && (
          <section className="discover-section">
            <h2>Most active</h2>
            <div className="discover-list">
              {mostActive.map((p: ProjectListEntry) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default function DiscoverPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isSearch = location.pathname.includes('/discover/search') || !!searchParams.get('text');

  if (isSearch) {
    return <DiscoverSearchPage />;
  }
  return <DiscoverHomePage />;
}
