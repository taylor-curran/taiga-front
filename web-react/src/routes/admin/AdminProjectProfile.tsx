import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDeleteProject, useProjectBySlug, useUpdateProject } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { toast } from '../../components/Toast';

export function AdminProjectDetails() {
  const { pslug } = useParams();
  const { data: project, isLoading, refetch } = useProjectBySlug(pslug);
  const update = useUpdateProject();
  const remove = useDeleteProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  useEffect(() => {
    if (project) {
      setName(project.name);
      setDescription(project.description || '');
      setIsPrivate(project.is_private);
    }
  }, [project]);

  if (isLoading || !project) return <Loader />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({ id: project.id, patch: { name, description, is_private: isPrivate } });
    toast.success('Project saved');
    refetch();
  };

  const onDelete = async () => {
    if (!confirm(`Delete project "${project.name}"? This cannot be undone.`)) return;
    await remove.mutateAsync(project.id);
    toast.success('Project deleted');
    window.location.href = '/projects/';
  };

  return (
    <div data-testid="admin-details">
      <h2 className="text-lg font-semibold">Project details</h2>
      <form onSubmit={onSubmit} className="mt-4 space-y-4 card p-5">
        <div>
          <label className="label">Name</label>
          <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea className="input min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          Private project
        </label>
        <div className="flex justify-between">
          <button type="submit" className="btn-primary">Save</button>
          <button type="button" className="btn-danger" onClick={onDelete}>Delete project</button>
        </div>
      </form>
    </div>
  );
}

export function AdminProjectModules() {
  const { pslug } = useParams();
  const { data: project, isLoading, refetch } = useProjectBySlug(pslug);
  const update = useUpdateProject();
  if (isLoading || !project) return <Loader />;

  const FLAGS: { key: keyof typeof project; label: string }[] = [
    { key: 'is_backlog_activated', label: 'Backlog' },
    { key: 'is_kanban_activated', label: 'Kanban' },
    { key: 'is_epics_activated', label: 'Epics' },
    { key: 'is_issues_activated', label: 'Issues' },
    { key: 'is_wiki_activated', label: 'Wiki' },
    { key: 'is_contact_activated', label: 'Contact' },
  ];
  return (
    <div data-testid="admin-modules">
      <h2 className="text-lg font-semibold">Modules</h2>
      <ul className="mt-4 card divide-y divide-slate-100">
        {FLAGS.map(({ key, label }) => (
          <li key={String(key)} className="flex items-center justify-between p-3">
            <span className="text-sm">{label}</span>
            <input
              type="checkbox"
              checked={!!project[key]}
              onChange={async (e) => {
                await update.mutateAsync({ id: project.id, patch: { [key]: e.target.checked } as any });
                refetch();
                toast.success(`${label} ${e.target.checked ? 'enabled' : 'disabled'}`);
              }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminProjectDefaultValues() {
  const { pslug } = useParams();
  const { data: project, isLoading, refetch } = useProjectBySlug(pslug);
  const update = useUpdateProject();
  if (isLoading || !project) return <Loader />;
  const fields: { key: keyof typeof project; label: string; choices: { id: number; name: string }[] }[] = [
    { key: 'default_us_status', label: 'Default user-story status', choices: project.us_statuses ?? [] },
    { key: 'default_task_status', label: 'Default task status', choices: project.task_statuses ?? [] },
    { key: 'default_issue_status', label: 'Default issue status', choices: project.issue_statuses ?? [] },
    { key: 'default_priority', label: 'Default priority', choices: project.priorities ?? [] },
    { key: 'default_severity', label: 'Default severity', choices: project.severities ?? [] },
    { key: 'default_issue_type', label: 'Default issue type', choices: project.issue_types ?? [] },
  ];
  return (
    <div data-testid="admin-defaults">
      <h2 className="text-lg font-semibold">Default values</h2>
      <div className="mt-4 card divide-y divide-slate-100">
        {fields.map((f) => (
          <div key={String(f.key)} className="grid grid-cols-2 items-center gap-3 p-3">
            <span className="text-sm">{f.label}</span>
            <select
              className="input"
              value={(project[f.key] as number) ?? ''}
              onChange={async (e) => {
                await update.mutateAsync({ id: project.id, patch: { [f.key]: Number(e.target.value) } as any });
                refetch();
              }}
            >
              {f.choices.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AdminProjectExport() {
  return (
    <div data-testid="admin-export">
      <h2 className="text-lg font-semibold">Export project</h2>
      <p className="mt-2 text-sm text-slate-500">
        Export your project as JSON dump. The export endpoint streams a downloadable archive — large projects
        may take time.
      </p>
    </div>
  );
}

export function AdminProjectReports() {
  return (
    <div data-testid="admin-reports">
      <h2 className="text-lg font-semibold">Reports</h2>
      <p className="mt-2 text-sm text-slate-500">CSV reports are generated server-side per resource.</p>
    </div>
  );
}
