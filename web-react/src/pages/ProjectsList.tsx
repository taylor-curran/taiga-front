import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMyProjects } from '@/services/projects';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { ProjectCard } from '@/components/ProjectCard';

type SortKey = 'user_order' | 'name' | '-total_fans' | '-modified_date';
type ViewMode = 'grid' | 'list';

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'user_order', label: 'Custom order' },
  { value: 'name', label: 'Name' },
  { value: '-total_fans', label: 'Most liked' },
  { value: '-modified_date', label: 'Recently updated' },
];

function sortProjects<T extends { name: string; total_fans?: number; modified_date?: string }>(
  projects: T[],
  sortKey: SortKey,
): T[] {
  const sorted = [...projects];
  switch (sortKey) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case '-total_fans':
      sorted.sort((a, b) => (b.total_fans ?? 0) - (a.total_fans ?? 0));
      break;
    case '-modified_date':
      sorted.sort((a, b) => (b.modified_date ?? '').localeCompare(a.modified_date ?? ''));
      break;
    default:
      break;
  }
  return sorted;
}

export function ProjectsListPage() {
  const { data, isLoading, error } = useMyProjects();
  const [sortKey, setSortKey] = useState<SortKey>('user_order');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const projects = data ? sortProjects(data, sortKey) : [];

  return (
    <>
      <header className="flex items-baseline justify-between mb-4">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <Link to="/project/new" className="btn-primary text-sm">New project</Link>
      </header>

      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}

      {data && data.length === 0 && (
        <Empty title="You have no projects yet" message="Create a new project to get started." />
      )}

      {data && data.length > 0 && (
        <>
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <select
                className="input w-auto text-sm"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-taiga-green-dark text-white' : 'text-taiga-grey hover:bg-taiga-grey-lighter/40'}`}
                title="Grid view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="0" width="7" height="7" rx="1" />
                  <rect x="9" y="0" width="7" height="7" rx="1" />
                  <rect x="0" y="9" width="7" height="7" rx="1" />
                  <rect x="9" y="9" width="7" height="7" rx="1" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-taiga-green-dark text-white' : 'text-taiga-grey hover:bg-taiga-grey-lighter/40'}`}
                title="List view"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="0" y="1" width="16" height="3" rx="1" />
                  <rect x="0" y="6.5" width="16" height="3" rx="1" />
                  <rect x="0" y="12" width="16" height="3" rx="1" />
                </svg>
              </button>
            </div>
          </div>

          {/* Project cards */}
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} listView />
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
