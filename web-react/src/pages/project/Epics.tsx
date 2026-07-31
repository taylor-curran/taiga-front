import { Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useEpics } from '@/services/epics';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';

export function EpicsPage() {
  const project = useCurrentProject();
  const { data, isLoading, error } = useEpics(project.id);
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No epics" />;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Epics</h1>
      <ul className="card divide-y divide-taiga-grey-lighter/40">
        {data.map((epic) => {
          const counts = epic.user_stories_counts;
          const total = counts?.total ?? 0;
          const progress = counts?.progress ?? 0;
          const percent = total > 0 ? Math.round((progress / total) * 100) : 0;
          return (
            <li
              key={epic.id}
              className="px-4 py-3 hover:bg-taiga-bg/60 flex items-center gap-3"
            >
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: epic.color || '#999' }}
              />
              <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0">
                #{epic.ref}
              </span>
              <Link
                to={`/project/${project.slug}/epic/${epic.ref}`}
                className="flex-1 truncate font-medium text-taiga-text"
              >
                {epic.subject}
              </Link>
              <div className="text-xs text-taiga-grey-light w-32 text-right">
                {progress} / {total} ({percent}%)
              </div>
              {epic.status_extra_info?.name && (
                <span className="badge">{epic.status_extra_info.name}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
