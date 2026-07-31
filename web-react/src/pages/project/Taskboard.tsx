import { useParams, Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { fetchMilestoneBySlug } from '@/services/projects';
import { useTasks } from '@/services/tasks';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { Avatar } from '@/components/common/Avatar';
import type { Task } from '@/types/api';

export function TaskboardPage() {
  const project = useCurrentProject();
  const { sslug } = useParams();

  const milestoneQuery = useQuery({
    queryKey: ['milestone', 'by_slug', project.id, sslug],
    queryFn: () => fetchMilestoneBySlug(project.id, sslug as string),
    enabled: !!sslug,
  });

  const tasksQuery = useTasks(
    milestoneQuery.data
      ? { project: project.id, milestone: milestoneQuery.data.id }
      : undefined,
  );

  const milestone = milestoneQuery.data;
  const tasks = tasksQuery.data ?? [];
  const stories = useMemo(() => milestone?.user_stories ?? [], [milestone]);

  const tasksByUS = useMemo<Record<string, Task[]>>(() => {
    const out: Record<string, Task[]> = {};
    for (const t of tasks) {
      const key = String(t.user_story ?? 'unassigned');
      (out[key] ??= []).push(t);
    }
    return out;
  }, [tasks]);

  if (milestoneQuery.isLoading || tasksQuery.isLoading) return <Loading />;
  if (milestoneQuery.error) return <ErrorBox error={milestoneQuery.error} />;
  if (!milestone) return <Empty title="Sprint not found" />;

  const statuses = (project.task_statuses ?? []).slice().sort(
    (a, b) => (a.order ?? 0) - (b.order ?? 0),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">{milestone.name}</h1>
        {milestone.estimated_start && milestone.estimated_finish && (
          <p className="text-sm text-taiga-grey-light">
            {milestone.estimated_start} → {milestone.estimated_finish} ·{' '}
            {milestone.closed_points ?? 0} / {milestone.total_points ?? 0} pts
          </p>
        )}
      </header>

      {stories.length === 0 && (
        <Empty title="No user stories in this sprint" />
      )}

      {stories.map((us) => {
        const usTasks = tasksByUS[String(us.id)] ?? [];
        return (
          <section key={us.id} className="card overflow-hidden">
            <header className="px-4 py-3 border-b border-taiga-grey-lighter/40 flex items-center gap-3">
              <Link
                to={`/project/${project.slug}/us/${us.ref}`}
                className="font-semibold flex-1 truncate"
              >
                <span className="text-taiga-grey-light font-mono mr-2">#{us.ref}</span>
                {us.subject}
              </Link>
              <span className="text-xs text-taiga-grey-light">
                {usTasks.length} tasks · {us.total_points ?? '—'} pts
              </span>
            </header>
            <div className="grid" style={{ gridTemplateColumns: `repeat(${Math.max(statuses.length, 1)}, minmax(0, 1fr))` }}>
              {statuses.map((status) => {
                const colTasks = usTasks.filter((t) => t.status === status.id);
                return (
                  <div
                    key={status.id}
                    className="border-l border-taiga-grey-lighter/40 first:border-l-0 p-2 min-h-[80px]"
                  >
                    <h4 className="text-xs font-semibold text-taiga-grey-light mb-2 flex items-center gap-2">
                      {status.color && (
                        <span
                          className="inline-block w-2 h-2 rounded-full"
                          style={{ backgroundColor: status.color }}
                        />
                      )}
                      {status.name}
                      <span className="ml-auto">{colTasks.length}</span>
                    </h4>
                    <ul className="space-y-1">
                      {colTasks.map((t) => (
                        <li key={t.id} className="card p-2 text-sm">
                          <Link
                            to={`/project/${project.slug}/task/${t.ref}`}
                            className="block font-medium text-taiga-text"
                          >
                            <span className="text-xs text-taiga-grey-light font-mono mr-1">#{t.ref}</span>
                            {t.subject}
                          </Link>
                          {t.assigned_to_extra_info?.full_name_display && (
                            <div className="mt-1 flex justify-end">
                              <Avatar
                                name={t.assigned_to_extra_info.full_name_display}
                                size={20}
                              />
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
