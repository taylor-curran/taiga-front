import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useBulkUpdateUserStoryOrder,
  useCreateUserStory,
  useProjectBySlug,
  useUpdateUserStory,
  useUserStoriesForKanban,
} from '../../api/resources';
import { Loader } from '../../components/Loader';
import { useEvents } from '../../api/useEvents';
import type { UserStory } from '../../api/types';
import { toast } from '../../components/Toast';

export default function Kanban() {
  const { pslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: stories, isLoading: ls } = useUserStoriesForKanban(project?.id);
  const update = useUpdateUserStory();
  const reorder = useBulkUpdateUserStoryOrder();
  const create = useCreateUserStory();
  const qc = useQueryClient();
  const [drag, setDrag] = useState<{ id: number; status: number } | null>(null);
  const [newSubject, setNewSubject] = useState<Record<number, string>>({});

  useEvents(project ? `project.${project.id}.userstory` : null, () => {
    qc.invalidateQueries({ queryKey: ['userstories', 'kanban'] });
  });

  if (lp || ls) return <Loader />;
  if (!project) return null;

  const statuses = (project.us_statuses ?? []).slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const byStatus = new Map<number, UserStory[]>();
  for (const s of statuses) byStatus.set(s.id, []);
  for (const us of stories ?? []) {
    const lst = byStatus.get(us.status) || [];
    lst.push(us);
    byStatus.set(us.status, lst);
  }
  for (const lst of byStatus.values()) lst.sort((a, b) => (a.kanban_order ?? 0) - (b.kanban_order ?? 0));

  const onDrop = async (statusId: number) => {
    if (!drag) return;
    if (drag.status === statusId) {
      setDrag(null);
      return;
    }
    const us = (stories ?? []).find((u) => u.id === drag.id);
    if (!us) return;
    await update.mutateAsync({ id: us.id, patch: { status: statusId, version: us.version } });
    await reorder.mutateAsync({
      project_id: project.id,
      bulk_stories: [{ us_id: us.id, order: 0 }],
      status_id: statusId,
      type: 'kanban',
    });
    setDrag(null);
  };

  return (
    <div data-testid="kanban">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Kanban</h1>
        <span className="text-sm text-slate-500">{stories?.length ?? 0} stories</span>
      </header>
      <div className="mt-5 flex gap-4 overflow-x-auto pb-4">
        {statuses.map((s) => (
          <section
            key={s.id}
            className={`w-72 shrink-0 rounded bg-slate-100 ${drag && drag.status !== s.id ? 'drag-over' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => onDrop(s.id)}
            data-testid={`kanban-col-${s.id}`}
          >
            <header
              className="flex items-center justify-between rounded-t px-3 py-2 text-sm font-semibold text-white"
              style={{ background: s.color || '#94a3b8' }}
            >
              <span>{s.name}</span>
              <span className="rounded bg-black/20 px-2 py-0.5 text-xs">{byStatus.get(s.id)?.length ?? 0}</span>
            </header>
            <ul className="space-y-2 p-3">
              {byStatus.get(s.id)?.map((us) => (
                <li
                  key={us.id}
                  className="rounded bg-white p-3 shadow-sm ring-1 ring-slate-200"
                  draggable
                  onDragStart={() => setDrag({ id: us.id, status: us.status })}
                  onDragEnd={() => setDrag(null)}
                  data-testid={`kanban-card-${us.id}`}
                >
                  <Link
                    to={`/project/${pslug}/us/${us.ref}`}
                    className="text-sm font-medium text-slate-800 hover:text-taiga-700"
                  >
                    #{us.ref} {us.subject}
                  </Link>
                  {us.tags && us.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {us.tags.map(([tag, color]) => (
                        <span
                          key={tag}
                          className="rounded px-2 py-0.5 text-xs"
                          style={{ background: color || '#e2e8f0', color: color ? '#fff' : '#475569' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
              <li>
                <form
                  className="flex gap-1"
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const subject = (newSubject[s.id] || '').trim();
                    if (!subject) return;
                    await create.mutateAsync({ project: project.id, subject, status: s.id });
                    setNewSubject((m) => ({ ...m, [s.id]: '' }));
                    toast.success('User story created');
                  }}
                >
                  <input
                    className="input text-xs"
                    placeholder="+ Add user story"
                    value={newSubject[s.id] || ''}
                    onChange={(e) => setNewSubject((m) => ({ ...m, [s.id]: e.target.value }))}
                  />
                </form>
              </li>
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
