import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProjectBySlug } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { api } from '../../api/client';
import { toast } from '../../components/Toast';
import type { ChoiceItem, ProjectSummary } from '../../api/types';

interface ValuesPageProps {
  resourceUrl: string; // e.g. 'userstory-statuses'
  projectKey: keyof ProjectSummary;
  title: string;
  hasColor?: boolean;
  hasIsClosed?: boolean;
  extraFields?: Array<{ key: string; label: string; type?: 'number' | 'text' }>;
}

function ValuesPage({ resourceUrl, projectKey, title, hasColor = true, hasIsClosed = false, extraFields }: ValuesPageProps) {
  const { pslug } = useParams();
  const { data: project, isLoading, refetch } = useProjectBySlug(pslug);
  const qc = useQueryClient();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#5dafcd');
  const [isClosed, setIsClosed] = useState(false);
  const [extra, setExtra] = useState<Record<string, unknown>>({});

  if (isLoading || !project) return <Loader />;

  const items = ((project[projectKey] as unknown) as ChoiceItem[] | undefined) ?? [];

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { name, project: project.id };
    if (hasColor) payload.color = color;
    if (hasIsClosed) payload.is_closed = isClosed;
    Object.assign(payload, extra);
    await api().post(resourceUrl, payload);
    setCreating(false);
    setName('');
    setExtra({});
    toast.success('Value created');
    refetch();
    qc.invalidateQueries({ queryKey: ['projects'] });
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this value?')) return;
    await api().delete(`${resourceUrl}/${id}`);
    refetch();
    qc.invalidateQueries({ queryKey: ['projects'] });
    toast.success('Deleted');
  };

  return (
    <div data-testid={`admin-values-${title.toLowerCase()}`}>
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button className="btn-primary" onClick={() => setCreating(true)}>+ New</button>
      </header>
      <ul className="mt-4 card divide-y divide-slate-100">
        {items.map((item) => (
          <li key={item.id} className="flex items-center justify-between p-3">
            <div className="flex items-center gap-3">
              {hasColor && (
                <span className="inline-block h-4 w-4 rounded" style={{ background: item.color || '#cbd5e1' }} />
              )}
              <span className="text-sm">{item.name}</span>
            </div>
            <button className="text-slate-400 hover:text-red-600" onClick={() => remove(item.id)}>×</button>
          </li>
        ))}
      </ul>
      {creating && (
        <form className="mt-4 card space-y-3 p-4" onSubmit={onCreate}>
          <h3 className="text-sm font-semibold uppercase text-slate-500">New value</h3>
          <div>
            <label className="label">Name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          {hasColor && (
            <div>
              <label className="label">Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            </div>
          )}
          {hasIsClosed && (
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={isClosed} onChange={(e) => setIsClosed(e.target.checked)} />
              Closes the item
            </label>
          )}
          {extraFields?.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <input
                className="input"
                type={f.type || 'text'}
                value={String(extra[f.key] ?? '')}
                onChange={(e) =>
                  setExtra((m) => ({
                    ...m,
                    [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                  }))
                }
              />
            </div>
          ))}
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-secondary" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn-primary" type="submit">Create</button>
          </div>
        </form>
      )}
    </div>
  );
}

export function AdminStatuses() {
  return (
    <div className="space-y-8">
      <ValuesPage resourceUrl="userstory-statuses" projectKey="us_statuses" title="User-story statuses" hasIsClosed />
      <ValuesPage resourceUrl="task-statuses" projectKey="task_statuses" title="Task statuses" hasIsClosed />
      <ValuesPage resourceUrl="issue-statuses" projectKey="issue_statuses" title="Issue statuses" hasIsClosed />
      <ValuesPage resourceUrl="epic-statuses" projectKey="epic_statuses" title="Epic statuses" hasIsClosed />
    </div>
  );
}

export function AdminPoints() {
  return (
    <ValuesPage
      resourceUrl="points"
      projectKey="points"
      title="Points"
      hasColor={false}
      extraFields={[{ key: 'value', label: 'Value', type: 'number' }]}
    />
  );
}

export function AdminPriorities() {
  return <ValuesPage resourceUrl="priorities" projectKey="priorities" title="Priorities" />;
}
export function AdminSeverities() {
  return <ValuesPage resourceUrl="severities" projectKey="severities" title="Severities" />;
}
export function AdminIssueTypes() {
  return <ValuesPage resourceUrl="issue-types" projectKey="issue_types" title="Issue types" />;
}

export function AdminCustomFields() {
  return (
    <div data-testid="admin-custom-fields">
      <h2 className="text-lg font-semibold">Custom fields</h2>
      <p className="mt-2 text-sm text-slate-500">
        Manage custom fields for user stories, tasks, issues and epics. Use the API endpoints
        (<code>userstory-custom-attributes</code>, <code>task-custom-attributes</code>,
        <code>issue-custom-attributes</code>, <code>epic-custom-attributes</code>) directly
        for advanced configuration.
      </p>
    </div>
  );
}

export function AdminTags() {
  const { pslug } = useParams();
  const { data: project, isLoading, refetch } = useProjectBySlug(pslug);
  if (isLoading || !project) return <Loader />;
  return (
    <div data-testid="admin-tags">
      <h2 className="text-lg font-semibold">Tags</h2>
      <p className="text-sm text-slate-500">Tags currently used on this project.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {(project.tags_colors ?? []).length === 0 && <p className="text-sm text-slate-400">No tags yet.</p>}
        {(project.tags_colors ?? []).map(([t, c]) => (
          <span key={t} className="rounded px-2 py-1 text-sm" style={{ background: c || '#e2e8f0', color: c ? '#fff' : '#475569' }}>
            {t}
          </span>
        ))}
      </div>
      <button className="btn-secondary mt-3 text-xs" onClick={() => refetch()}>Refresh</button>
    </div>
  );
}

export function AdminDueDates() {
  return (
    <div data-testid="admin-due-dates">
      <h2 className="text-lg font-semibold">Due-date settings</h2>
      <p className="mt-2 text-sm text-slate-500">Configure overdue thresholds via the API.</p>
    </div>
  );
}

export function AdminKanbanPowerUps() {
  const { pslug } = useParams();
  const { data: project, isLoading, refetch } = useProjectBySlug(pslug);
  const update = (window as unknown as Record<string, unknown>); // satisfies linter
  void update;
  if (isLoading || !project) return <Loader />;
  return (
    <div data-testid="admin-kanban">
      <h2 className="text-lg font-semibold">Kanban power-ups</h2>
      <p className="mt-2 text-sm text-slate-500">
        Per-status WIP limits and swimlanes. Update statuses with <code>wip_limit</code> via the
        <code> /userstory-statuses/{'{id}'}</code> endpoint.
      </p>
      <ul className="mt-3 card divide-y divide-slate-100">
        {(project.us_statuses ?? []).map((s) => (
          <li key={s.id} className="flex items-center justify-between p-3 text-sm">
            <span>{s.name}</span>
            <span className="text-xs text-slate-500">color {s.color || '—'}</span>
          </li>
        ))}
      </ul>
      <button className="btn-secondary mt-3 text-xs" onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
