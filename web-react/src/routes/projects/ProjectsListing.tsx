import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useMyProjects } from '../../api/resources';
import { Loader } from '../../components/Loader';

export default function ProjectsListing() {
  const { data: projects, isLoading } = useMyProjects();
  const [q, setQ] = useState('');
  const filtered = (projects ?? []).filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="mx-auto max-w-5xl p-6" data-testid="projects-listing">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">My projects</h1>
        <Link to="/project/new" className="btn-primary">+ New project</Link>
      </div>
      <input
        className="input mt-4 max-w-md"
        placeholder="Filter projects…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <ul className="mt-6 space-y-3" data-testid="projects-list">
          {filtered.map((p) => (
            <li key={p.id}>
              <Link to={`/project/${p.slug}/`} className="card flex items-center gap-4 p-4 hover:border-taiga-400">
                {p.logo_small_url ? (
                  <img src={p.logo_small_url} alt={p.name} className="h-12 w-12 rounded object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-taiga-200 text-taiga-800 text-lg font-bold">
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-800">{p.name}</div>
                  <div className="line-clamp-1 text-sm text-slate-500">{p.description}</div>
                </div>
                <div className="text-xs text-slate-400">{p.is_private ? 'Private' : 'Public'}</div>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {!isLoading && filtered.length === 0 && (
        <div className="mt-8 rounded border border-dashed border-slate-300 p-8 text-center text-slate-500">
          No projects yet.{' '}
          <Link to="/project/new" className="text-taiga-700 hover:underline">Create one →</Link>
        </div>
      )}
    </div>
  );
}
