import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCreateTask,
  useMilestoneBySlug,
  useProjectBySlug,
  useTasks,
  useUpdateTask,
  useUserStoriesByMilestone,
} from '../../api/resources';
import { Loader } from '../../components/Loader';
import { useEvents } from '../../api/useEvents';
import { toast } from '../../components/Toast';
import { formatDate } from '../../utils/dates';

export default function Taskboard() {
  const { pslug, sslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: milestone, isLoading: lm } = useMilestoneBySlug(project?.id, sslug);
  const { data: stories, isLoading: ls } = useUserStoriesByMilestone(project?.id, milestone?.id);
  const { data: tasks, isLoading: lt } = useTasks(project?.id, { milestone: milestone?.id });
  const update = useUpdateTask();
  const create = useCreateTask();
  const qc = useQueryClient();
  const [drag, setDrag] = useState<{ id: number; status: number } | null>(null);
  const [newSubject, setNewSubject] = useState<Record<string, string>>({});

  useEvents(project ? `project.${project.id}.task` : null, () => {
    qc.invalidateQueries({ queryKey: ['tasks'] });
  });

  if (lp || lm || ls || lt) return <Loader />;
  if (!project || !milestone) return null;

  const statuses = (project.task_statuses ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const usList = stories ?? [];
  const groups: Array<{ usId: number | null; us: typeof usList[number] | null }> = [
    { usId: null, us: null },
    ...usList.map((us) => ({ usId: us.id, us })),
  ];

  const tasksByUs = new Map<number | string, Map<number, typeof tasks>>();
  for (const t of tasks ?? []) {
    const key: number | string = t.user_story ?? 'none';
    let inner = tasksByUs.get(key);
    if (!inner) {
      inner = new Map();
      tasksByUs.set(key, inner);
    }
    const lst = inner.get(t.status) || [];
    lst.push(t);
    inner.set(t.status, lst);
  }

  const onDrop = async (statusId: number) => {
    if (!drag) return;
    if (drag.status === statusId) {
      setDrag(null);
      return;
    }
    const t = (tasks ?? []).find((x) => x.id === drag.id);
    if (!t) return;
    await update.mutateAsync({ id: t.id, patch: { status: statusId, version: t.version } });
    setDrag(null);
  };

  const totalTasks = tasks?.length ?? 0;
  const closedTasks = (tasks ?? []).filter((t) => t.is_closed).length;

  return (
    <div data-testid="taskboard">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Taskboard – {milestone.name}</h1>
          <p className="text-sm text-slate-500">
            {formatDate(milestone.estimated_start)} – {formatDate(milestone.estimated_finish)} · {closedTasks}/{totalTasks} tasks
          </p>
        </div>
        <Link to={`/project/${pslug}/backlog`} className="btn-secondary">← Backlog</Link>
      </header>
      <div className="mt-5 overflow-x-auto">
        <table className="min-w-full table-fixed">
          <thead>
            <tr>
              <th className="w-64 p-2 text-left text-xs font-semibold uppercase text-slate-500">User story</th>
              {statuses.map((s) => (
                <th
                  key={s.id}
                  className="p-2 text-left text-xs font-semibold uppercase text-white"
                  style={{ background: s.color || '#94a3b8' }}
                >
                  {s.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const innerMap = tasksByUs.get(g.usId ?? 'none');
              return (
                <tr key={g.usId ?? 'none'} className="border-t border-slate-200">
                  <th className="bg-slate-50 p-3 align-top">
                    {g.us ? (
                      <Link to={`/project/${pslug}/us/${g.us.ref}`} className="text-sm font-semibold text-slate-800 hover:text-taiga-700">
                        #{g.us.ref} {g.us.subject}
                      </Link>
                    ) : (
                      <span className="text-sm font-semibold text-slate-500">Unassigned</span>
                    )}
                  </th>
                  {statuses.map((s) => (
                    <td
                      key={s.id}
                      className={`align-top p-2 ${drag && drag.status !== s.id ? 'drag-over' : ''}`}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => onDrop(s.id)}
                    >
                      <ul className="space-y-2">
                        {innerMap?.get(s.id)?.map((t) => (
                          <li
                            key={t.id}
                            className="rounded border border-slate-200 bg-white p-2 text-sm shadow-sm"
                            draggable
                            onDragStart={() => setDrag({ id: t.id, status: t.status })}
                            onDragEnd={() => setDrag(null)}
                          >
                            <Link to={`/project/${pslug}/task/${t.ref}`} className="text-slate-800 hover:text-taiga-700">
                              #{t.ref} {t.subject}
                            </Link>
                          </li>
                        ))}
                      </ul>
                      <form
                        className="mt-2"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const key = `${g.usId ?? 'none'}.${s.id}`;
                          const subject = (newSubject[key] || '').trim();
                          if (!subject) return;
                          await create.mutateAsync({
                            project: project.id,
                            subject,
                            status: s.id,
                            milestone: milestone.id,
                            user_story: g.usId,
                          });
                          setNewSubject((m) => ({ ...m, [key]: '' }));
                          toast.success('Task created');
                        }}
                      >
                        <input
                          className="w-full rounded border border-dashed border-slate-300 bg-transparent px-2 py-1 text-xs hover:border-taiga-400"
                          placeholder="+ task"
                          value={newSubject[`${g.usId ?? 'none'}.${s.id}`] || ''}
                          onChange={(e) =>
                            setNewSubject((m) => ({ ...m, [`${g.usId ?? 'none'}.${s.id}`]: e.target.value }))
                          }
                        />
                      </form>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
