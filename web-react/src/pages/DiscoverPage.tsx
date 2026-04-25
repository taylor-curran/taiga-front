import { useQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { projects as projectsApi } from '../api/resources';
import type { ProjectListEntry } from '../types';
import Loader from '../components/common/Loader';
import { useState } from 'react';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('text') || '');
  const isSearch = !!searchParams.get('text');

  const { data: featuredProjects, isLoading: featuredLoading } = useQuery({
    queryKey: ['discover-featured'],
    queryFn: async () => {
      const res = await projectsApi.list({ is_featured: true, order_by: '-total_fans' });
      return res.data;
    },
    enabled: !isSearch,
  });

  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['discover-search', searchParams.get('text')],
    queryFn: async () => {
      const res = await projectsApi.list({ q: searchParams.get('text'), order_by: '-total_activity' });
      return res.data;
    },
    enabled: isSearch,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ text: query });
    }
  };

  const projectsList = isSearch ? searchResults : featuredProjects;
  const loading = isSearch ? searchLoading : featuredLoading;

  return (
    <div className="discover-page">
      <h1>Discover</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects..."
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {loading && <Loader />}

      <div className="discover-projects">
        {projectsList?.map((p: ProjectListEntry) => (
          <Link key={p.id} to={`/project/${p.slug}/`} className="project-card">
            <div className="project-card-header">
              {p.logo_small_url ? (
                <img src={p.logo_small_url} alt={p.name} className="project-card-logo" />
              ) : (
                <div className="project-card-logo-placeholder">{p.name.charAt(0)}</div>
              )}
              <h3>{p.name}</h3>
            </div>
            {p.description && <p className="project-card-desc">{p.description.slice(0, 150)}</p>}
            <div className="project-card-meta">
              <span>{p.total_fans} fans</span>
              <span>{p.total_activity_last_month} activity this month</span>
            </div>
          </Link>
        ))}
        {projectsList?.length === 0 && (
          <div className="empty-state"><p>No projects found</p></div>
        )}
      </div>
    </div>
  );
}
