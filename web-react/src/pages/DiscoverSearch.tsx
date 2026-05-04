import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchDiscoverProjects } from '@/services/projects';
import type { DiscoverParams } from '@/services/projects';
import type { DiscoverProject } from '@/types/api';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { ProjectCard } from '@/components/ProjectCard';

type FilterKey = 'all' | 'people' | 'scrum' | 'kanban';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'people', label: 'Looking for people' },
  { key: 'scrum', label: 'Scrum' },
  { key: 'kanban', label: 'Kanban' },
];

const ORDER_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Relevance' },
  { value: '-total_fans', label: 'Most liked' },
  { value: '-total_activity', label: 'Most active' },
  { value: '-created_date', label: 'Newest' },
];

function filterParams(filter: FilterKey): Partial<DiscoverParams> {
  if (filter === 'people') return { is_looking_for_people: true };
  if (filter === 'scrum') return { is_backlog_activated: true };
  if (filter === 'kanban') return { is_kanban_activated: true };
  return {};
}

export function DiscoverSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQ = searchParams.get('text') ?? '';
  const initialFilter = (searchParams.get('filter') as FilterKey) ?? 'all';
  const initialOrderBy = searchParams.get('order_by') ?? '';

  const [query, setQuery] = useState(initialQ);
  const [activeQuery, setActiveQuery] = useState(initialQ);
  const [filter, setFilter] = useState<FilterKey>(initialFilter);
  const [orderBy, setOrderBy] = useState(initialOrderBy);
  const [results, setResults] = useState<DiscoverProject[]>([]);
  const [hasNext, setHasNext] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const doSearch = useCallback(async (q: string, f: FilterKey, ob: string, p: number, append: boolean) => {
    if (!q) return;
    const setter = append ? setLoadingMore : setLoading;
    setter(true);
    setError(null);
    try {
      const params: DiscoverParams = {
        q,
        page: p,
        ...filterParams(f),
        ...(ob ? { order_by: ob } : {}),
      };
      const res = await fetchDiscoverProjects(params);
      setResults((prev) => append ? [...prev, ...res.data] : res.data);
      setHasNext(res.hasNext);
    } catch (err) {
      setError(err);
    } finally {
      setter(false);
    }
  }, []);

  useEffect(() => {
    if (activeQuery) {
      setPage(1);
      doSearch(activeQuery, filter, orderBy, 1, false);
    }
  }, [activeQuery, filter, orderBy, doSearch]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setActiveQuery(q);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (q) next.set('text', q);
      else next.delete('text');
      return next;
    });
  }

  function onFilterChange(f: FilterKey) {
    setFilter(f);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('filter', f);
      return next;
    });
  }

  function onOrderChange(ob: string) {
    setOrderBy(ob);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (ob) next.set('order_by', ob);
      else next.delete('order_by');
      return next;
    });
  }

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    doSearch(activeQuery, filter, orderBy, nextPage, true);
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Search public projects</h1>

      {/* Search bar with filter pills */}
      <form onSubmit={onSubmit} className="mb-4">
        <div className="flex gap-2 mb-3">
          <input
            className="input"
            placeholder="Find a project..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn-primary" type="submit" disabled={loading}>
            Search
          </button>
        </div>
        <div className="flex items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => onFilterChange(f.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                filter === f.key
                  ? 'bg-taiga-green-dark text-white'
                  : 'bg-taiga-grey-lighter/40 text-taiga-grey hover:bg-taiga-grey-lighter'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </form>

      {/* Order by */}
      {activeQuery && results.length > 0 && (
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-taiga-grey-light">
            {results.length} result{results.length !== 1 ? 's' : ''}
          </span>
          <select
            className="input w-auto text-sm"
            value={orderBy}
            onChange={(e) => onOrderChange(e.target.value)}
          >
            {ORDER_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Results */}
      {!activeQuery && (
        <p className="text-sm text-taiga-grey-light">Type a query to search.</p>
      )}
      {loading && <Loading />}
      {error && <ErrorBox error={error} />}
      {!loading && activeQuery && results.length === 0 && (
        <Empty title="No matches" message={`Nothing matched "${activeQuery}".`} />
      )}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((project) => (
            <ProjectCard key={project.id} project={project} listView />
          ))}
          {hasNext && (
            <div className="text-center mt-4">
              <button
                className="btn-ghost text-sm"
                onClick={loadMore}
                disabled={loadingMore}
              >
                {loadingMore ? 'Loading...' : 'View more'}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
