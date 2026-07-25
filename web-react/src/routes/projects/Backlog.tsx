import { Link, useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import {
  useBulkUpdateUserStoryOrder,
  useCreateMilestone,
  useCreateUserStory,
  useDeleteUserStory,
  useMilestones,
  useProjectBySlug,
  useUserStoriesByMilestone,
} from '../../api/resources';
import type { Milestone, UserStory } from '../../api/types';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { useEvents } from '../../api/useEvents';
import { useQueryClient } from '@tanstack/react-query';
import { formatDate } from '../../utils/dates';
import { toast } from '../../components/Toast';

type DragState = { id: number; from: 'backlog' | number } | null;

export default function Backlog() {
  const { pslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: stories, isLoading: ls } = useUserStoriesByMilestone(project?.id, null);
  const { data: openMilestones, isLoading: lm } = useMilestones(project?.id, false);
  const { data: closedMilestones } = useMilestones(project?.id, true);
  const create = useCreateUserStory();
  const remove = useDeleteUserStory();
  const reorder = useBulkUpdateUserStoryOrder();
  const createMilestone = useCreateMilestone();
  const qc = useQueryClient();

  const [drag, setDrag] = useState<DragState>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showSprint, setShowSprint] = useState(false);
  const [bulk, setBulk] = useState('');
  const [name, setName] = useState('');
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [finish, setFinish] = useState(
    new Date(Date.now() + 14 * 86400 * 1000).toISOString().slice(0, 10)
  );

  useEvents(project ? `project.${project.id}.userstory` : null, () => {
    qc.invalidateQueries({ queryKey: ['userstories'] });
  });
  useEvents(project ? `project.${project.id}.milestone` : null, () => {
    qc.invalidateQueries({ queryKey: ['milestones'] });
  });

  const isLoading = lp || ls || lm;

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!project) return;
    const lines = bulk.split('\n').map((l) => l.trim()).filter(Boolean);
    if (!lines.length) {
      setShowCreate(false);
      return;
    }
    for (const line of lines) {
      await create.mutateAsync({ project: project.id, subject: line });
    }
    setBulk('');
    setShowCreate(false);
    toast.success(`${lines.length} user stor${lines.length === 1 ? 'y' : 'ies'} created`);
  };

  const onCreateSprint = async (e: FormEvent) => {
    e.preventDefault();
    if (!project) return;
    await createMilestone.mutateAsync({
      project: project.id,
      name,
      estimated_start: start,
      estimated_finish: finish,
    });
    setShowSprint(false);
    setName('');
    toast.success('Sprint created');
  };

  if (isLoading) return <Loader />;
  if (!project) return null;

  const handleDrop = async (target: 'backlog' | number) => {
    if (!drag || !project) return;
    if (target === drag.from) {
      setDrag(null);
      return;
    }
    if (target === 'backlog') {
      await reorder.mutateAsync({
        project_id: project.id,
        bulk_stories: [{ us_id: drag.id, order: 0 }],
        milestone_id: 0,
        type: 'backlog',
      });
    } else {
      await reorder.mutateAsync({
        project_id: project.id,
        bulk_stories: [{ us_id: drag.id, order: 0 }],
        milestone_id: target,
        type: 'milestone',
      });
    }
    setDrag(null);
  };

  return (
    <div data-testid="backlog">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Backlog</h1>
          <p className="mt-0.5 text-sm text-slate-500">{stories?.length ?? 0} user stories in backlog</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button className="btn-secondary" onClick={() => setShowSprint(true)}>+ New sprint</button>
          <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New stories</button>
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <section
          className={`card p-4 ${drag?.from !== 'backlog' && drag ? 'drag-over' : ''}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop('backlog')}
          data-testid="backlog-list"
        >
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">Backlog</h2>
          <ul className="divide-y divide-slate-100">
            {stories?.map((us) => (
              <BacklogRow
                key={us.id}
                us={us}
                pslug={pslug!}
                onDelete={async () => {
                  if (confirm(`Delete US #${us.ref} – ${us.subject}?`)) {
                    await remove.mutateAsync(us.id);
                    toast.success('User story deleted');
                  }
                }}
                onDragStart={() => setDrag({ id: us.id, from: 'backlog' })}
                onDragEnd={() => setDrag(null)}
              />
            ))}
            {!stories?.length && (
              <li className="py-8 text-center text-sm text-slate-400">Drop or create user stories here.</li>
            )}
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Sprints</h2>
          {openMilestones?.length ? (
            openMilestones.map((m) => (
              <SprintCard
                key={m.id}
                pslug={pslug!}
                m={m}
                isDropping={!!drag && drag.from !== m.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(m.id)}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400">No active sprints.</p>
          )}
          {!!closedMilestones?.length && (
            <details className="card p-3">
              <summary className="cursor-pointer text-sm font-semibold text-slate-600">
                Closed sprints ({closedMilestones.length})
              </summary>
              <ul className="mt-2 space-y-1">
                {closedMilestones.map((m) => (
                  <li key={m.id} className="text-sm">
                    <Link to={`/project/${pslug}/taskboard/${m.slug}`} className="text-taiga-700 hover:underline">{m.name}</Link>
                    <span className="ml-2 text-xs text-slate-400">{formatDate(m.estimated_start)} – {formatDate(m.estimated_finish)}</span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create user stories">
        <form onSubmit={onCreate}>
          <p className="mb-2 text-xs text-slate-500">One story per line. Each becomes a separate US.</p>
          <textarea
            className="input min-h-[160px]"
            value={bulk}
            onChange={(e) => setBulk(e.target.value)}
            placeholder={"As a user I can…\nAs a user I can…"}
            data-testid="bulk-stories-textarea"
          />
          <div className="mt-4 flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={create.isPending}>
              {create.isPending ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal open={showSprint} onClose={() => setShowSprint(false)} title="New sprint">
        <form onSubmit={onCreateSprint} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Start</label>
              <input type="date" className="input" value={start} onChange={(e) => setStart(e.target.value)} required />
            </div>
            <div>
              <label className="label">End</label>
              <input type="date" className="input" value={finish} onChange={(e) => setFinish(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowSprint(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function BacklogRow({
  us,
  pslug,
  onDelete,
  onDragStart,
  onDragEnd,
}: {
  us: UserStory;
  pslug: string;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  return (
    <li
      className="flex items-center gap-3 py-2"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', String(us.id));
        onDragStart();
      }}
      onDragEnd={onDragEnd}
    >
      <span
        className="inline-block h-3 w-3 shrink-0 rounded-full"
        style={{ background: us.status_extra_info?.color || '#cbd5e1' }}
        title={us.status_extra_info?.name}
      />
      <Link
        to={`/project/${pslug}/us/${us.ref}`}
        className="flex-1 truncate text-sm text-slate-700 hover:text-taiga-700"
      >
        <span className="text-slate-400">#{us.ref}</span> {us.subject}
      </Link>
      {us.total_points != null && (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{us.total_points}</span>
      )}
      <button
        className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
        onClick={onDelete}
        title="Delete"
      >
        ×
      </button>
    </li>
  );
}

function SprintCard({
  pslug,
  m,
  isDropping,
  onDragOver,
  onDrop,
}: {
  pslug: string;
  m: Milestone;
  isDropping: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const stories = useUserStoriesByMilestone(m.project, m.id);
  return (
    <div
      className={`card p-4 ${isDropping ? 'drag-over' : ''}`}
      onDragOver={onDragOver}
      onDrop={onDrop}
      data-testid={`sprint-${m.slug}`}
    >
      <div className="flex items-center justify-between">
        <Link to={`/project/${pslug}/taskboard/${m.slug}`} className="text-sm font-semibold text-taiga-700 hover:underline">
          {m.name}
        </Link>
        <span className="text-xs text-slate-400">{formatDate(m.estimated_start)} → {formatDate(m.estimated_finish)}</span>
      </div>
      <div className="mt-2 text-xs text-slate-500">
        {m.closed_points ?? 0}/{m.total_points ?? 0} points
      </div>
      <ul className="mt-3 space-y-1">
        {stories.data?.map((us) => (
          <li key={us.id} className="truncate text-sm text-slate-600">
            <Link to={`/project/${pslug}/us/${us.ref}`} className="hover:text-taiga-700">
              #{us.ref} {us.subject}
            </Link>
          </li>
        ))}
        {!stories.data?.length && <li className="text-xs text-slate-400">Drop user stories here.</li>}
      </ul>
    </div>
  );
}
