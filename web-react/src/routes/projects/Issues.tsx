import { Link, useParams } from 'react-router-dom';
import { FormEvent, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCreateIssue, useDeleteIssue, useIssues, useProjectBySlug } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { Modal } from '../../components/Modal';
import { useEvents } from '../../api/useEvents';
import { toast } from '../../components/Toast';

export default function Issues() {
  const { pslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: issues, isLoading: li } = useIssues(project?.id);
  const create = useCreateIssue();
  const remove = useDeleteIssue();
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [subject, setSubject] = useState('');
  const [type, setType] = useState<number | undefined>();
  const [priority, setPriority] = useState<number | undefined>();
  const [severity, setSeverity] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'created' | 'priority' | 'severity'>('created');

  useEvents(project ? `project.${project.id}.issue` : null, () => {
    qc.invalidateQueries({ queryKey: ['issues'] });
  });

  const filtered = useMemo(() => {
    let list = issues ?? [];
    if (filterStatus !== 'all') list = list.filter((i) => i.status === filterStatus);
    if (search) list = list.filter((i) => i.subject.toLowerCase().includes(search.toLowerCase()));
    list = [...list].sort((a, b) => {
      if (sort === 'priority') return (b.priority || 0) - (a.priority || 0);
      if (sort === 'severity') return (b.severity || 0) - (a.severity || 0);
      return (b.id || 0) - (a.id || 0);
    });
    return list;
  }, [issues, filterStatus, search, sort]);

  if (lp || li) return <Loader />;
  if (!project) return null;

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    await create.mutateAsync({
      project: project.id,
      subject,
      type,
      priority,
      severity,
    });
    setSubject('');
    setShowCreate(false);
    toast.success('Issue created');
  };

  const stats = {
    total: issues?.length ?? 0,
    open: (issues ?? []).filter((i) => !i.is_closed).length,
    closed: (issues ?? []).filter((i) => i.is_closed).length,
  };

  return (
    <div data-testid="issues">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Issues</h1>
          <p className="text-sm text-slate-500">
            {stats.total} total · {stats.open} open · {stats.closed} closed
          </p>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>+ New issue</button>
      </header>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Search issues…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="input max-w-[180px]"
          value={String(filterStatus)}
          onChange={(e) => setFilterStatus(e.target.value === 'all' ? 'all' : Number(e.target.value))}
        >
          <option value="all">All statuses</option>
          {project.issue_statuses?.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        <select className="input max-w-[180px]" value={sort} onChange={(e) => setSort(e.target.value as 'created' | 'priority' | 'severity')}>
          <option value="created">Sort: newest</option>
          <option value="priority">Sort: priority</option>
          <option value="severity">Sort: severity</option>
        </select>
      </div>

      <div className="mt-5 card overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100" data-testid="issues-table">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Subject</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Type</th>
              <th className="px-4 py-2">Priority</th>
              <th className="px-4 py-2">Severity</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filtered.map((i) => (
              <tr key={i.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-slate-400">#{i.ref}</td>
                <td className="px-4 py-2">
                  <Link to={`/project/${pslug}/issue/${i.ref}`} className="font-medium text-slate-800 hover:text-taiga-700">
                    {i.subject}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  <Pill color={i.status_extra_info?.color} label={i.status_extra_info?.name} />
                </td>
                <td className="px-4 py-2">
                  <Pill color={i.type_extra_info?.color} label={i.type_extra_info?.name} />
                </td>
                <td className="px-4 py-2">
                  <Pill color={i.priority_extra_info?.color} label={i.priority_extra_info?.name} />
                </td>
                <td className="px-4 py-2">
                  <Pill color={i.severity_extra_info?.color} label={i.severity_extra_info?.name} />
                </td>
                <td className="px-4 py-2 text-right">
                  <button
                    className="text-slate-400 hover:text-red-600"
                    onClick={async () => {
                      if (confirm(`Delete issue #${i.ref}?`)) {
                        await remove.mutateAsync(i.id);
                        toast.success('Issue deleted');
                      }
                    }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-slate-400">No issues match.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="New issue">
        <form className="space-y-3" onSubmit={onCreate}>
          <div>
            <label className="label">Subject</label>
            <input className="input" required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Type</label>
              <select className="input" value={type ?? ''} onChange={(e) => setType(e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">—</option>
                {project.issue_types?.map((it) => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Priority</label>
              <select className="input" value={priority ?? ''} onChange={(e) => setPriority(e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">—</option>
                {project.priorities?.map((it) => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Severity</label>
              <select className="input" value={severity ?? ''} onChange={(e) => setSeverity(e.target.value ? Number(e.target.value) : undefined)}>
                <option value="">—</option>
                {project.severities?.map((it) => (
                  <option key={it.id} value={it.id}>{it.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn-primary">Create</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function Pill({ color, label }: { color?: string; label?: string }) {
  if (!label) return <span className="text-slate-400">—</span>;
  return (
    <span
      className="inline-block rounded px-2 py-0.5 text-xs"
      style={{ background: color || '#e2e8f0', color: color ? '#fff' : '#475569' }}
    >
      {label}
    </span>
  );
}
