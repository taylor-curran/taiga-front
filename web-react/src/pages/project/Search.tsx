import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { Avatar } from '@/components/common/Avatar';
import {
  useSearch,
  type SearchResponse,
  type SearchResultItem,
  type SearchWikiItem,
} from '@/services/search';

// ---------------------------------------------------------------------------
// Tab definitions – order matches the AngularJS filter bar
// ---------------------------------------------------------------------------

type TabKey = 'epics' | 'userstories' | 'issues' | 'tasks' | 'wikipages';

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'epics', label: 'Epics' },
  { key: 'userstories', label: 'User Stories' },
  { key: 'issues', label: 'Issues' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'wikipages', label: 'Wiki' },
];

// ---------------------------------------------------------------------------
// Debounce hook
// ---------------------------------------------------------------------------

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tabCount(data: SearchResponse | undefined, key: TabKey): number {
  if (!data) return 0;
  return (data[key] ?? []).length;
}

function autoSelectTab(data: SearchResponse): TabKey {
  let best: TabKey = 'userstories';
  let max = 0;
  for (const tab of TABS) {
    const len = (data[tab.key] ?? []).length;
    if (len > max) {
      max = len;
      best = tab.key;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// SearchPage
// ---------------------------------------------------------------------------

export function SearchPage() {
  const project = useCurrentProject();
  const [searchParams, setSearchParams] = useSearchParams();

  const initialText = searchParams.get('text') ?? '';
  const [inputValue, setInputValue] = useState(initialText);
  const debouncedText = useDebounce(inputValue.trim(), 300);

  const [activeTab, setActiveTab] = useState<TabKey>('userstories');
  const autoTabApplied = useRef(false);

  // Sync debounced text to URL search param
  useEffect(() => {
    if (debouncedText) {
      setSearchParams({ text: debouncedText }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  }, [debouncedText, setSearchParams]);

  const { data, isLoading, error } = useSearch(project.id, debouncedText);

  // Reset auto-tab when query changes (must run before auto-select effect
  // so cached query hits still trigger tab selection)
  useEffect(() => {
    autoTabApplied.current = false;
  }, [debouncedText]);

  // Auto-select the tab with the most results on first search
  useEffect(() => {
    if (data && data.count > 0) {
      if (!autoTabApplied.current) {
        setActiveTab(autoSelectTab(data));
        autoTabApplied.current = true;
      }
    }
  }, [data]);

  const handleTabClick = useCallback((key: TabKey) => {
    setActiveTab(key);
  }, []);

  const totalCount = data?.count ?? 0;
  const hasQuery = debouncedText.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Search</h1>
      </header>

      {/* Search input area */}
      <div className="relative mb-6 max-w-lg">
        <input
          className="input pr-10"
          type="text"
          placeholder="Search this project…"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          autoFocus
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="inline-block h-3 w-3 rounded-full bg-taiga-green-dark animate-pulse" />
          </span>
        )}
        {!isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-taiga-grey-light">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>

      {/* Pre-search state */}
      {!hasQuery && (
        <p className="text-sm text-taiga-grey-light">
          Type a query to search across user stories, tasks, issues, epics, and wiki pages.
        </p>
      )}

      {/* Error */}
      {error && <ErrorBox error={error} />}

      {/* Loading (full-page, only when no data yet) */}
      {isLoading && !data && hasQuery && <Loading label="Searching…" />}

      {/* No results */}
      {data && totalCount === 0 && hasQuery && (
        <Empty
          title="No results found"
          message={`Nothing matched "${debouncedText}" in this project.`}
        />
      )}

      {/* Results */}
      {data && totalCount > 0 && (
        <>
          {/* Tab bar */}
          <TabBar
            data={data}
            activeTab={activeTab}
            onTabClick={handleTabClick}
          />

          {/* Result table */}
          <div className="mt-0">
            <ResultPanel
              tabKey={activeTab}
              data={data}
              projectSlug={project.slug}
            />
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TabBar
// ---------------------------------------------------------------------------

function TabBar({
  data,
  activeTab,
  onTabClick,
}: {
  data: SearchResponse;
  activeTab: TabKey;
  onTabClick: (key: TabKey) => void;
}) {
  return (
    <ul className="flex border-b border-taiga-grey-lighter/50 mb-0">
      {TABS.map((tab) => {
        const count = tabCount(data, tab.key);
        const isActive = tab.key === activeTab;
        return (
          <li key={tab.key}>
            <button
              type="button"
              onClick={() => onTabClick(tab.key)}
              className={`
                flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors
                border-b-2 -mb-px
                ${isActive
                  ? 'border-taiga-green-dark text-taiga-green-dark'
                  : 'border-transparent text-taiga-grey hover:text-taiga-text hover:border-taiga-grey-lighter'
                }
              `}
            >
              <span>{tab.label}</span>
              <span
                className={`
                  text-xs rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center
                  ${isActive
                    ? 'bg-taiga-green-dark text-white'
                    : 'bg-taiga-grey-lighter/60 text-taiga-grey'
                  }
                `}
              >
                {count}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// ResultPanel – dispatches to the correct result table
// ---------------------------------------------------------------------------

function ResultPanel({
  tabKey,
  data,
  projectSlug,
}: {
  tabKey: TabKey;
  data: SearchResponse;
  projectSlug: string;
}) {
  const items = data[tabKey] ?? [];

  if (items.length === 0) {
    return (
      <Empty
        title="No results"
        message="There are no results in this category."
      />
    );
  }

  switch (tabKey) {
    case 'userstories':
      return (
        <UserStoriesTable
          items={data.userstories}
          projectSlug={projectSlug}
        />
      );
    case 'tasks':
      return (
        <TasksTable items={data.tasks} projectSlug={projectSlug} />
      );
    case 'issues':
      return (
        <IssuesTable items={data.issues} projectSlug={projectSlug} />
      );
    case 'epics':
      return (
        <EpicsTable items={data.epics} projectSlug={projectSlug} />
      );
    case 'wikipages':
      return (
        <WikiTable items={data.wikipages} projectSlug={projectSlug} />
      );
  }
}

// ---------------------------------------------------------------------------
// Result tables
// ---------------------------------------------------------------------------

function UserStoriesTable({
  items,
  projectSlug,
}: {
  items: SearchResultItem[];
  projectSlug: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1fr_140px_140px_80px] gap-2 px-4 py-2 bg-taiga-bg/60 text-xs font-semibold text-taiga-grey uppercase tracking-wide">
        <span>User Story</span>
        <span className="text-center">Sprint</span>
        <span className="text-center">Status</span>
        <span className="text-center">Points</span>
      </div>
      <ul className="divide-y divide-taiga-grey-lighter/40">
        {items.map((us) => (
          <li
            key={us.id}
            className="grid grid-cols-[1fr_140px_140px_80px] gap-2 px-4 py-2.5 items-center hover:bg-taiga-bg/60"
          >
            <div className="truncate">
              <Link
                to={`/project/${projectSlug}/us/${us.ref}`}
                className="text-taiga-text hover:text-taiga-link"
              >
                <span className="text-taiga-link font-mono text-xs mr-1.5">
                  #{us.ref}
                </span>
                {us.subject}
              </Link>
            </div>
            <div className="text-center text-xs text-taiga-grey truncate">
              {us.milestone_name ? (
                <Link
                  to={`/project/${projectSlug}/taskboard/${us.milestone_slug}`}
                  className="text-taiga-link"
                >
                  {us.milestone_name}
                </Link>
              ) : (
                <span className="text-taiga-grey-lighter">—</span>
              )}
            </div>
            <div className="text-center">
              <StatusBadge info={us.status_extra_info} />
            </div>
            <div className="text-center text-sm">
              {us.total_points != null ? us.total_points : '—'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TasksTable({
  items,
  projectSlug,
}: {
  items: SearchResultItem[];
  projectSlug: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1fr_140px_140px] gap-2 px-4 py-2 bg-taiga-bg/60 text-xs font-semibold text-taiga-grey uppercase tracking-wide">
        <span>Task</span>
        <span className="text-center">Status</span>
        <span className="text-center">Assigned To</span>
      </div>
      <ul className="divide-y divide-taiga-grey-lighter/40">
        {items.map((task) => (
          <li
            key={task.id}
            className="grid grid-cols-[1fr_140px_140px] gap-2 px-4 py-2.5 items-center hover:bg-taiga-bg/60"
          >
            <div className="truncate">
              <Link
                to={`/project/${projectSlug}/task/${task.ref}`}
                className="text-taiga-text hover:text-taiga-link"
              >
                <span className="text-taiga-link font-mono text-xs mr-1.5">
                  #{task.ref}
                </span>
                {task.subject}
              </Link>
            </div>
            <div className="text-center">
              <StatusBadge info={task.status_extra_info} />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <AssigneeDisplay info={task.assigned_to_extra_info} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IssuesTable({
  items,
  projectSlug,
}: {
  items: SearchResultItem[];
  projectSlug: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1fr_140px_140px] gap-2 px-4 py-2 bg-taiga-bg/60 text-xs font-semibold text-taiga-grey uppercase tracking-wide">
        <span>Issue</span>
        <span className="text-center">Status</span>
        <span className="text-center">Assigned To</span>
      </div>
      <ul className="divide-y divide-taiga-grey-lighter/40">
        {items.map((issue) => (
          <li
            key={issue.id}
            className="grid grid-cols-[1fr_140px_140px] gap-2 px-4 py-2.5 items-center hover:bg-taiga-bg/60"
          >
            <div className="truncate">
              <Link
                to={`/project/${projectSlug}/issue/${issue.ref}`}
                className="text-taiga-text hover:text-taiga-link"
              >
                <span className="text-taiga-link font-mono text-xs mr-1.5">
                  #{issue.ref}
                </span>
                {issue.subject}
              </Link>
            </div>
            <div className="text-center">
              <StatusBadge info={issue.status_extra_info} />
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <AssigneeDisplay info={issue.assigned_to_extra_info} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function EpicsTable({
  items,
  projectSlug,
}: {
  items: SearchResultItem[];
  projectSlug: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1fr_140px] gap-2 px-4 py-2 bg-taiga-bg/60 text-xs font-semibold text-taiga-grey uppercase tracking-wide">
        <span>Epic</span>
        <span className="text-center">Status</span>
      </div>
      <ul className="divide-y divide-taiga-grey-lighter/40">
        {items.map((epic) => (
          <li
            key={epic.id}
            className="grid grid-cols-[1fr_140px] gap-2 px-4 py-2.5 items-center hover:bg-taiga-bg/60"
          >
            <div className="truncate">
              <Link
                to={`/project/${projectSlug}/epic/${epic.ref}`}
                className="text-taiga-text hover:text-taiga-link"
              >
                <span className="text-taiga-link font-mono text-xs mr-1.5">
                  #{epic.ref}
                </span>
                {epic.subject}
              </Link>
            </div>
            <div className="text-center">
              <StatusBadge info={epic.status_extra_info} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function WikiTable({
  items,
  projectSlug,
}: {
  items: SearchWikiItem[];
  projectSlug: string;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-2 bg-taiga-bg/60 text-xs font-semibold text-taiga-grey uppercase tracking-wide">
        Wiki Page
      </div>
      <ul className="divide-y divide-taiga-grey-lighter/40">
        {items.map((page) => (
          <li
            key={page.id}
            className="px-4 py-2.5 hover:bg-taiga-bg/60"
          >
            <Link
              to={`/project/${projectSlug}/wiki/${page.slug}`}
              className="text-taiga-text hover:text-taiga-link"
            >
              {page.slug}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small shared components
// ---------------------------------------------------------------------------

function StatusBadge({
  info,
}: {
  info?: { name?: string; color?: string; is_closed?: boolean };
}) {
  if (!info?.name) {
    return <span className="text-taiga-grey-lighter text-xs">—</span>;
  }
  return (
    <span
      className="badge"
      style={
        info.color
          ? { backgroundColor: info.color, color: '#fff' }
          : undefined
      }
    >
      {info.name}
    </span>
  );
}

function AssigneeDisplay({
  info,
}: {
  info?: {
    full_name_display?: string;
    photo?: string | null;
    username?: string;
  } | null;
}) {
  if (!info?.full_name_display) {
    return <span className="text-taiga-grey-lighter text-xs">—</span>;
  }
  return (
    <>
      <Avatar
        name={info.full_name_display}
        src={info.photo}
        size={24}
      />
      <span className="text-xs text-taiga-grey truncate max-w-[90px]">
        {info.full_name_display}
      </span>
    </>
  );
}
