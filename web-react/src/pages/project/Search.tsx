import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { ProjectDetail } from '@/api/types';

interface SearchResult {
  count: number;
  userstories: Array<{ id: number; ref: number; subject: string }>;
  tasks: Array<{ id: number; ref: number; subject: string }>;
  issues: Array<{ id: number; ref: number; subject: string }>;
  wikipages: Array<{ id: number; slug: string }>;
  epics?: Array<{ id: number; ref: number; subject: string }>;
}

export default function ProjectSearch() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const { data, isFetching } = useQuery({
    queryKey: ['search', project.id, submitted],
    enabled: submitted.length > 0,
    queryFn: () => api.get<SearchResult>('search', { query: { project: project.id, text: submitted } }),
  });

  return (
    <div data-testid="project-search">
      <h1>Search</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(text);
        }}
        style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}
      >
        <input
          value={text}
          placeholder="Search user stories, tasks, issues, wiki…"
          onChange={(e) => setText(e.target.value)}
          aria-label="Search"
          data-testid="search-input"
        />
        <button className="btn">Search</button>
      </form>
      {isFetching && <p className="muted">Searching…</p>}
      {data && (
        <div data-testid="search-results">
          <p className="muted">{data.count ?? 0} matches</p>
          {data.userstories?.length > 0 && (
            <section className="card">
              <h3>User stories</h3>
              <ul className="list">
                {data.userstories.map((u) => (
                  <li key={u.id}>
                    <Link to={`/project/${project.slug}/us/${u.ref}`}>#{u.ref} {u.subject}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.tasks?.length > 0 && (
            <section className="card">
              <h3>Tasks</h3>
              <ul className="list">
                {data.tasks.map((u) => (
                  <li key={u.id}>
                    <Link to={`/project/${project.slug}/task/${u.ref}`}>#{u.ref} {u.subject}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.issues?.length > 0 && (
            <section className="card">
              <h3>Issues</h3>
              <ul className="list">
                {data.issues.map((u) => (
                  <li key={u.id}>
                    <Link to={`/project/${project.slug}/issue/${u.ref}`}>#{u.ref} {u.subject}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {data.wikipages?.length > 0 && (
            <section className="card">
              <h3>Wiki pages</h3>
              <ul className="list">
                {data.wikipages.map((u) => (
                  <li key={u.id}>
                    <Link to={`/project/${project.slug}/wiki/${u.slug}`}>{u.slug}</Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
