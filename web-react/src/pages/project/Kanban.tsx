import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useUserStories } from '@/services/userstories';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Avatar } from '@/components/common/Avatar';
import { Tags } from '@/components/common/Tags';
import type { UserStory } from '@/types/api';

export function KanbanPage() {
  const project = useCurrentProject();
  const { data, isLoading, error } = useUserStories({ project: project.id });

  const grouped = useMemo<Record<number, UserStory[]>>(() => {
    const out: Record<number, UserStory[]> = {};
    if (!data) return out;
    for (const s of data) {
      (out[s.status] ??= []).push(s);
    }
    return out;
  }, [data]);

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;

  const statuses = (project.us_statuses ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <div>
      <header className="mb-4">
        <h1 className="text-2xl font-semibold">Kanban</h1>
      </header>
      <div className="flex gap-3 overflow-x-auto">
        {statuses.map((status) => {
          const stories = grouped[status.id] ?? [];
          return (
            <div
              key={status.id}
              className="card p-3 min-w-[260px] max-w-[300px] flex-1"
            >
              <header className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  {status.color && (
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: status.color }}
                    />
                  )}
                  {status.name}
                </h3>
                <span className="text-xs text-taiga-grey-light">
                  {stories.length}
                  {status.wip_limit ? ` / ${status.wip_limit}` : ''}
                </span>
              </header>
              <ul className="space-y-2">
                {stories.map((s) => (
                  <li key={s.id} className="card p-2 hover:shadow-sm">
                    <Link
                      to={`/project/${project.slug}/us/${s.ref}`}
                      className="block text-sm font-medium text-taiga-text"
                    >
                      <span className="text-xs text-taiga-grey-light font-mono mr-1">#{s.ref}</span>
                      {s.subject}
                    </Link>
                    <div className="mt-2 flex items-center justify-between">
                      <Tags tags={s.tags} />
                      {s.assigned_to_extra_info?.full_name_display && (
                        <Avatar
                          name={s.assigned_to_extra_info.full_name_display}
                          src={s.assigned_to_extra_info.photo}
                          size={20}
                        />
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
