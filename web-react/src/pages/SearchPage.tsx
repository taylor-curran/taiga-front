import { useQuery } from '@tanstack/react-query';
import { useOutletContext, useSearchParams, Link } from 'react-router-dom';
import { search as searchApi } from '../api/resources';
import type { Project, UserStory, Issue, Task, Epic } from '../types';
import { useState, useEffect } from 'react';

export default function SearchPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('text') || '');
  const text = searchParams.get('text') || '';

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', project.id, text],
    queryFn: async () => {
      const res = await searchApi.do(project.id, text);
      return res.data;
    },
    enabled: !!text,
  });

  useEffect(() => {
    setQuery(text);
  }, [text]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ text: query }, { replace: true });
  };

  return (
    <div className="search-page">
      <h1>Search</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          autoFocus
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      {isLoading && <p>Searching...</p>}

      {results && (
        <div className="search-results">
          <div className="search-count">Found {results.count} results</div>

          {results.userstories?.length > 0 && (
            <div className="search-section">
              <h2>User Stories ({results.userstories.length})</h2>
              {results.userstories.map((us: UserStory) => (
                <div key={us.id} className="search-result-item">
                  <Link to={`/project/${project.slug}/us/${us.ref}`}>
                    #{us.ref} {us.subject}
                  </Link>
                  <span className="search-result-status">{us.status_extra_info?.name}</span>
                </div>
              ))}
            </div>
          )}

          {results.tasks?.length > 0 && (
            <div className="search-section">
              <h2>Tasks ({results.tasks.length})</h2>
              {results.tasks.map((t: Task) => (
                <div key={t.id} className="search-result-item">
                  <Link to={`/project/${project.slug}/task/${t.ref}`}>
                    #{t.ref} {t.subject}
                  </Link>
                  <span className="search-result-status">{t.status_extra_info?.name}</span>
                </div>
              ))}
            </div>
          )}

          {results.issues?.length > 0 && (
            <div className="search-section">
              <h2>Issues ({results.issues.length})</h2>
              {results.issues.map((i: Issue) => (
                <div key={i.id} className="search-result-item">
                  <Link to={`/project/${project.slug}/issue/${i.ref}`}>
                    #{i.ref} {i.subject}
                  </Link>
                  <span className="search-result-status">{i.status_extra_info?.name}</span>
                </div>
              ))}
            </div>
          )}

          {results.epics?.length > 0 && (
            <div className="search-section">
              <h2>Epics ({results.epics.length})</h2>
              {results.epics.map((e: Epic) => (
                <div key={e.id} className="search-result-item">
                  <Link to={`/project/${project.slug}/epic/${e.ref}`}>
                    #{e.ref} {e.subject}
                  </Link>
                  <span className="search-result-status">{e.status_extra_info?.name}</span>
                </div>
              ))}
            </div>
          )}

          {results.wikipages?.length > 0 && (
            <div className="search-section">
              <h2>Wiki Pages ({results.wikipages.length})</h2>
              {results.wikipages.map((w) => (
                <div key={w.id} className="search-result-item">
                  <Link to={`/project/${project.slug}/wiki/${w.slug}`}>
                    {w.slug}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
