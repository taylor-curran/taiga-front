import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useCreateProject } from '@/services/projects';
import { ErrorBox } from '@/components/common/ErrorBox';

type ProjectType = 'scrum' | 'kanban';

function ProjectTypeSelector() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6 text-center">Create a project</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/project/new/scrum"
          className="card p-6 text-center hover:shadow-md transition-shadow no-underline hover:no-underline text-taiga-text"
        >
          <div className="text-4xl mb-3">&#x1F3C3;</div>
          <h2 className="text-lg font-semibold mb-1">Scrum</h2>
          <p className="text-sm text-taiga-grey-light">
            For teams that work in sprints with a prioritized backlog.
          </p>
        </Link>
        <Link
          to="/project/new/kanban"
          className="card p-6 text-center hover:shadow-md transition-shadow no-underline hover:no-underline text-taiga-text"
        >
          <div className="text-4xl mb-3">&#x1F4CB;</div>
          <h2 className="text-lg font-semibold mb-1">Kanban</h2>
          <p className="text-sm text-taiga-grey-light">
            For teams that work with a continuous flow of tasks.
          </p>
        </Link>
      </div>
      <div className="mt-6 flex justify-center gap-4">
        <Link to="/project/new/duplicate" className="btn-ghost text-sm">
          Duplicate existing project
        </Link>
        <Link to="/project/new/import" className="btn-ghost text-sm">
          Import project
        </Link>
      </div>
    </div>
  );
}

function CreateProjectForm({ type }: { type: ProjectType }) {
  const navigate = useNavigate();
  const mutation = useCreateProject();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!name.trim()) errs.push('Project name is required.');
    if (!description.trim()) errs.push('Description is required.');
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    setErrors([]);
    mutation.mutate(
      {
        name: name.trim(),
        description: description.trim(),
        creation_template: type === 'scrum' ? 1 : 2,
        is_private: isPrivate,
      },
      {
        onSuccess: (project) => {
          navigate(`/project/${project.slug}/`);
        },
      },
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-1">
        {type === 'scrum' ? 'New Scrum project' : 'New Kanban project'}
      </h1>
      <p className="text-sm text-taiga-grey-light mb-6">
        {type === 'scrum'
          ? 'Work in sprints with a prioritized backlog and story points.'
          : 'Continuous flow with customizable columns and WIP limits.'}
      </p>

      {mutation.error && <ErrorBox error={mutation.error} />}
      {errors.length > 0 && (
        <div className="border border-taiga-red/40 bg-taiga-red/10 text-taiga-red rounded p-3 mb-4 text-sm">
          {errors.map((err, i) => <div key={i}>{err}</div>)}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Project name</label>
          <input
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My awesome project"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="input min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is-private"
            checked={isPrivate}
            onChange={(e) => setIsPrivate(e.target.checked)}
            className="rounded border-taiga-grey-lighter"
          />
          <label htmlFor="is-private" className="text-sm">
            Private project (only visible to members)
          </label>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            className="btn-primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Create project'}
          </button>
          <Link to="/project/new" className="btn-ghost text-sm">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export function NewProjectPage() {
  return <ProjectTypeSelector />;
}

export function NewProjectScrumPage() {
  return <CreateProjectForm type="scrum" />;
}

export function NewProjectKanbanPage() {
  return <CreateProjectForm type="kanban" />;
}

export function DuplicateProjectPage() {
  return (
    <div className="max-w-xl mx-auto card p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">Duplicate project</h2>
      <p className="text-taiga-grey-light mb-4">
        Select a project to duplicate. A copy will be created with all settings and structure intact.
      </p>
      <p className="text-sm text-taiga-grey-light">
        This feature requires selecting from your existing projects.
        Please use the project admin panel to duplicate a specific project.
      </p>
      <div className="mt-6">
        <Link to="/project/new" className="btn-ghost">Back</Link>
      </div>
    </div>
  );
}

export function ImportProjectPage() {
  const { platform } = useParams();
  return (
    <div className="max-w-xl mx-auto card p-8 text-center">
      <h2 className="text-xl font-semibold mb-2">
        Import project{platform ? ` from ${platform}` : ''}
      </h2>
      <p className="text-taiga-grey-light mb-4">
        Import projects from external tools like Trello, Jira, Asana, or GitHub.
      </p>
      <p className="text-sm text-taiga-grey-light">
        Import functionality requires API tokens for the external service.
        Configure importers in the Taiga admin settings.
      </p>
      <div className="mt-6">
        <Link to="/project/new" className="btn-ghost">Back</Link>
      </div>
    </div>
  );
}
