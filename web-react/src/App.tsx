import { useEffect, useState } from 'react';
import './App.css';

type Project = {
  id: number;
  name: string;
  slug: string;
};

type Status = 'loading' | 'ready' | 'error';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    let ignore = false;

    async function loadSampleProjects() {
      try {
        const auth = await fetch('/api/v1/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'normal',
            username: 'admin',
            password: 'adminpass',
          }),
        });

        if (!auth.ok) throw new Error(`auth failed: ${auth.status}`);

        const { auth_token: token } = await auth.json();
        const response = await fetch('/api/v1/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error(`projects failed: ${response.status}`);

        const data = (await response.json()) as Project[];
        if (!ignore) {
          setProjects(data);
          setStatus('ready');
        }
      } catch (error) {
        console.error(error);
        if (!ignore) setStatus('error');
      }
    }

    loadSampleProjects();

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Taiga React port</p>
        <h1>Scaffold wired to seeded sample data</h1>
        <p className="lead">
          The Vite dev server proxies auth and project requests to the Taiga gateway so
          React work can use the same sample projects as the Angular reference app.
        </p>
      </section>

      <section className="status-card" aria-live="polite">
        <div>
          <p className="status-label">Backend contract</p>
          <p className="status-message">
            {status === 'loading' && 'Loading projects from the Taiga gateway...'}
            {status === 'error' && 'Could not load sample projects.'}
            {status === 'ready' && `Loaded ${projects.length} projects through the Vite proxy.`}
          </p>
        </div>
        <span className="status-pill" data-state={status}>{status}</span>
      </section>

      {status === 'error' && (
        <p role="alert">
          Start Taiga with <code>npm run taiga-up && npm run taiga-seed</code>.
        </p>
      )}

      {status === 'ready' && (
        <section className="project-grid" aria-label="Sample Taiga projects">
          {projects.slice(0, 7).map((project) => (
            <article className="project-card" key={project.id}>
              <h2>{project.name}</h2>
              <p>{project.slug}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}
