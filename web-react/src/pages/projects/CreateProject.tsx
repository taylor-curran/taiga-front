import { Link } from 'react-router-dom';

const TEMPLATES: Array<{ slug: string; label: string; description: string }> = [
  { slug: 'scrum', label: 'Scrum', description: 'Sprints, backlog and points.' },
  { slug: 'kanban', label: 'Kanban', description: 'Continuous-flow board.' },
  { slug: 'duplicate', label: 'Duplicate', description: 'Copy an existing project.' },
  { slug: 'import', label: 'Import', description: 'Import from another platform.' },
];

export default function CreateProject() {
  return (
    <main className="page" data-testid="create-project">
      <h1>Create project</h1>
      <p className="muted">Pick a template:</p>
      <ul className="list card">
        {TEMPLATES.map((t) => (
          <li key={t.slug}>
            <div className="grow">
              <Link to={`/project/new/${t.slug}`} className="subject-link">
                {t.label}
              </Link>
              <div className="muted">{t.description}</div>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}

export function CreateProjectForm({ type }: { type: 'scrum' | 'kanban' }) {
  return (
    <main className="page" data-testid={`create-project-${type}`}>
      <h1>New {type} project</h1>
      <form className="card" onSubmit={(e) => e.preventDefault()}>
        <fieldset><label>Name</label><input required /></fieldset>
        <fieldset><label>Description</label><textarea /></fieldset>
        <fieldset>
          <label style={{ display: 'inline-flex', gap: '0.4rem', fontWeight: 400 }}>
            <input type="checkbox" style={{ width: 'auto' }} /> Private
          </label>
        </fieldset>
        <fieldset className="end" style={{ marginTop: '0.6rem' }}>
          <button className="btn">Create</button>
        </fieldset>
      </form>
      <p className="muted" style={{ marginTop: '1rem' }}>
        Form is read-only in the React port for safety.
      </p>
    </main>
  );
}

export function DuplicateProject() {
  return (
    <main className="page" data-testid="duplicate-project">
      <h1>Duplicate project</h1>
      <p className="muted">Pick an existing project to duplicate. (Read-only stub.)</p>
    </main>
  );
}

export function ImportProject() {
  return (
    <main className="page" data-testid="import-project">
      <h1>Import project</h1>
      <p className="muted">Import from Trello, Jira, GitHub or Asana. (Read-only stub.)</p>
    </main>
  );
}
