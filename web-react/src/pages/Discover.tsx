import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDiscover } from '@/services/projects';
import type { DiscoverOrderBy } from '@/services/projects';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { ProjectCard } from '@/components/ProjectCard';

type TabKey = 'featured' | 'most-liked' | 'most-active';
type TimePeriod = 'week' | 'month' | 'year' | 'all';

function getOrderBy(tab: TabKey, period: TimePeriod): DiscoverOrderBy {
  if (tab === 'most-liked') {
    return period === 'all' ? '-total_fans' : (`-total_fans_last_${period}` as DiscoverOrderBy);
  }
  if (tab === 'most-active') {
    return period === 'all' ? '-total_activity' : (`-total_activity_last_${period}` as DiscoverOrderBy);
  }
  return '-total_fans';
}

const TABS: { key: TabKey; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'most-liked', label: 'Most liked' },
  { key: 'most-active', label: 'Most active' },
];

const PERIODS: { key: TimePeriod; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'year', label: 'This year' },
  { key: 'all', label: 'All time' },
];

export function DiscoverPage() {
  const [tab, setTab] = useState<TabKey>('featured');
  const [period, setPeriod] = useState<TimePeriod>('year');

  const params = tab === 'featured'
    ? { is_featured: true }
    : { order_by: getOrderBy(tab, period) };

  const { data, isLoading, error } = useDiscover(params);
  const projects = data?.data?.slice(0, tab === 'featured' ? undefined : 4) ?? [];

  return (
    <>
      {/* Header */}
      <header className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-semibold">Discover projects</h1>
        <Link to="/discover/search" className="btn-ghost text-sm">Search projects</Link>
      </header>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 border-b border-taiga-grey-lighter">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-taiga-green-dark text-taiga-green-dark'
                : 'border-transparent text-taiga-grey hover:text-taiga-text'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Period selector for most-liked / most-active */}
      {tab !== 'featured' && (
        <div className="flex items-center gap-2 mb-4">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                period === p.key
                  ? 'bg-taiga-green-dark text-white'
                  : 'bg-taiga-grey-lighter/40 text-taiga-grey hover:bg-taiga-grey-lighter'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      {!isLoading && projects.length === 0 && (
        <Empty title="No public projects found" />
      )}
      {projects.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <Link
              to={`/discover/search${tab !== 'featured' ? `?order_by=${getOrderBy(tab, period)}` : ''}`}
              className="btn-ghost text-sm"
            >
              View more
            </Link>
          </div>
        </>
      )}
    </>
  );
}
