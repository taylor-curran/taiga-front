import { Link, useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useCreateEpic, useEpics, useProjectBySlug } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { useEvents } from '../../api/useEvents';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from '../../components/Toast';

export default function Epics() {
  const { pslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: epics, isLoading: le } = useEpics(project?.id);
  const create = useCreateEpic();
  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const qc = useQueryClient();

  useEvents(project ? `project.${project.id}.epic` : null, () => {
    qc.invalidateQueries({ queryKey: ['epics'] });
  });

  if (lp || le) return <Loader />;
  if (!project) return null;

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    await create.mutateAsync({ project: project.id, subject });
    setSubject('');
    setShowCreate(false);
    toast.success('Epic created');
  };

  return (
    <div data-testid="epics-dashboard">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Epics</h1>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New epic</button>
      </header>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {epics?.map((e) => (
          <li key={e.id} className="card p-4 hover:border-taiga-400">
            <Link to={`/project/${pslug}/epic/${e.ref}`} className="text-sm font-semibold text-slate-800 hover:text-taiga-700">
              <span className="text-slate-400">#{e.ref}</span> {e.subject}
            </Link>
            {e.description && <p className="mt-2 line-clamp-3 text-xs text-slate-500">{e.description}</p>}
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span
                className="inline-block rounded px-2 py-0.5 text-white"
                style={{ background: e.status_extra_info?.color || '#94a3b8' }}
              >
                {e.status_extra_info?.name}
              </span>
              {e.user_stories_counts && (
                <span>
                  {e.user_stories_counts.progress}/{e.user_stories_counts.total} stories
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New epic">
        <form onSubmit={onCreate} className="space-y-3">
          <div>
            <label className="label">Subject</label>
            <input className="input" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
