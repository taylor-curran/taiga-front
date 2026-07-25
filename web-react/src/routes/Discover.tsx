import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useDiscoverProjects } from '../api/resources';
import { Loader } from '../components/Loader';

const ORDERS = [
  { id: 'most_liked', label: 'Most liked' },
  { id: 'most_active', label: 'Most active' },
  { id: 'least_active', label: 'Least active' },
  { id: 'most_followed', label: 'Most followed' },
];

export default function Discover() {
  const [order, setOrder] = useState<string>('most_liked');
  const { data: projects, isLoading } = useDiscoverProjects(order);
  const nav = useNavigate();
  const [q, setQ] = useState('');

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    nav(`/discover/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="mx-auto max-w-6xl p-6" data-testid="discover">
      <h1 className="text-2xl font-semibold text-slate-800">Discover projects</h1>
      <form onSubmit={onSearch} className="mt-4 flex max-w-xl gap-2">
        <input
          className="input"
          placeholder="Search public projects…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <button className="btn-primary" type="submit">Search</button>
      </form>
      <div className="mt-6 flex gap-2 text-sm">
        {ORDERS.map((o) => (
          <button
            key={o.id}
            onClick={() => setOrder(o.id)}
            className={`rounded px-3 py-1 ${order === o.id ? 'bg-taiga-600 text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects?.map((p) => (
            <Link key={p.id} to={`/project/${p.slug}/`} className="card p-4 hover:border-taiga-400 hover:shadow-md">
              <div className="flex items-center gap-3">
                {p.logo_small_url ? (
                  <img src={p.logo_small_url} alt={p.name} className="h-12 w-12 rounded object-cover" />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded bg-taiga-200 text-lg font-bold text-taiga-800">
                    {p.name.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-800">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.is_private ? 'Private' : 'Public'}</div>
                </div>
              </div>
              <p className="mt-3 line-clamp-3 text-sm text-slate-500">{p.description}</p>
              <div className="mt-3 flex gap-3 text-xs text-slate-400">
                <span>★ {p.total_fans ?? 0}</span>
                <span>👁 {p.total_watchers ?? 0}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function DiscoverSearch() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const { data: projects, isLoading } = useDiscoverProjects('most_liked');
  const filtered = (projects ?? []).filter(
    (p) =>
      p.name.toLowerCase().includes(q.toLowerCase()) ||
      (p.description ?? '').toLowerCase().includes(q.toLowerCase())
  );
  return (
    <div className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-semibold text-slate-800">Search results</h1>
      <input
        className="input mt-4 max-w-xl"
        placeholder="Search…"
        value={q}
        onChange={(e) => setParams({ q: e.target.value })}
      />
      {isLoading ? (
        <Loader />
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} to={`/project/${p.slug}/`} className="card p-4 hover:border-taiga-400">
              <div className="text-sm font-semibold">{p.name}</div>
              <p className="mt-2 line-clamp-3 text-xs text-slate-500">{p.description}</p>
            </Link>
          ))}
        </ul>
      )}
      {!isLoading && filtered.length === 0 && (
        <p className="mt-8 text-sm text-slate-500">No projects matched “{q}”.</p>
      )}
    </div>
  );
}
