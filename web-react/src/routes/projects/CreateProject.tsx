import { Link, useNavigate, useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useCreateProject } from '../../api/resources';
import { toast } from '../../components/Toast';

const TEMPLATES: { id: 'scrum' | 'kanban'; label: string; description: string; templateId: number }[] = [
  { id: 'scrum', label: 'Scrum', description: 'Sprints, backlog, story points & taskboards.', templateId: 1 },
  { id: 'kanban', label: 'Kanban', description: 'Continuous flow board organised by columns.', templateId: 2 },
];

export default function CreateProjectPage() {
  return (
    <div className="mx-auto max-w-3xl p-6" data-testid="create-project">
      <h1 className="text-2xl font-semibold text-slate-800">Create a new project</h1>
      <p className="mt-1 text-sm text-slate-500">Pick a template to get started.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TEMPLATES.map((t) => (
          <Link
            key={t.id}
            to={`/project/new/${t.id}`}
            className="card p-5 hover:border-taiga-400"
          >
            <div className="text-lg font-semibold text-taiga-800">{t.label}</div>
            <p className="mt-1 text-sm text-slate-500">{t.description}</p>
          </Link>
        ))}
        <Link to="/project/new/duplicate" className="card p-5 hover:border-taiga-400">
          <div className="text-lg font-semibold text-taiga-800">Duplicate</div>
          <p className="mt-1 text-sm text-slate-500">Start by copying one of your existing projects.</p>
        </Link>
        <Link to="/project/new/import" className="card p-5 hover:border-taiga-400">
          <div className="text-lg font-semibold text-taiga-800">Import</div>
          <p className="mt-1 text-sm text-slate-500">Bring projects from Trello, Jira, Asana, GitHub, etc.</p>
        </Link>
      </div>
    </div>
  );
}

export function CreateProjectForm() {
  const { type } = useParams();
  const tpl = TEMPLATES.find((t) => t.id === type) || TEMPLATES[0];
  const create = useCreateProject();
  const nav = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const created = await create.mutateAsync({
        name,
        description,
        is_private: isPrivate,
        creation_template: tpl.templateId,
      });
      toast.success('Project created');
      nav(`/project/${created.slug}/`);
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { _error_message?: string } } };
      setError(ax?.response?.data?._error_message || 'Could not create project');
    }
  };

  return (
    <div className="mx-auto max-w-2xl p-6" data-testid="create-project-form">
      <Link to="/project/new" className="text-sm text-taiga-700">← Back</Link>
      <h1 className="mt-3 text-2xl font-semibold text-slate-800">New {tpl.label} project</h1>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="label" htmlFor="name">Name</label>
          <input id="name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="input min-h-[120px]" value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} />
          Private project
        </label>
        {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        <button className="btn-primary" disabled={create.isPending} type="submit">
          {create.isPending ? 'Creating…' : 'Create project'}
        </button>
      </form>
    </div>
  );
}

export function DuplicateProjectPage() {
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/project/new" className="text-sm text-taiga-700">← Back</Link>
      <h1 className="mt-3 text-2xl font-semibold text-slate-800">Duplicate project</h1>
      <p className="mt-2 text-sm text-slate-500">
        Pick the project you want to duplicate from your project list.
      </p>
    </div>
  );
}

export function ImportProjectPage() {
  const { platform } = useParams();
  return (
    <div className="mx-auto max-w-2xl p-6">
      <Link to="/project/new" className="text-sm text-taiga-700">← Back</Link>
      <h1 className="mt-3 text-2xl font-semibold text-slate-800">Import {platform || 'project'}</h1>
      <p className="mt-2 text-sm text-slate-500">
        Importers run server-side and require credentials configured by an administrator. Contact your admin if
        you need help.
      </p>
    </div>
  );
}
