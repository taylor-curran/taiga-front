import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useParams } from 'react-router-dom';
import { fetchProjectBySlug } from '../../auth/apiClient';
import type { Project } from '../../auth/apiClient';
import { useAuthStore } from '../../auth/authStore';
import { en } from '../../i18n/en';
import './AdminLayout.css';

export function AdminLayout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const clearSession = useAuthStore((s) => s.clearSession);
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setError(null);
    fetchProjectBySlug(slug)
      .then((p) => {
        if (cancelled) return;
        if (!p.i_am_admin) {
          navigate('/permission-denied', { replace: true });
          return;
        }
        setProject(p);
      })
      .catch(() => {
        if (!cancelled) setError('load_failed');
      });
    return () => {
      cancelled = true;
    };
  }, [slug, navigate]);

  const logout = () => {
    clearSession();
    navigate('/login', { replace: true });
  };

  if (error === 'load_failed') {
    return (
      <div className="tg-admin-shell">
        <p className="tg-admin-placeholder">Could not load project.</p>
        <Link to="/">{en.common.goHome}</Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="tg-admin-shell">
        <p className="tg-admin-placeholder">Loading…</p>
      </div>
    );
  }

  return (
    <div className="tg-admin-shell">
      <header className="tg-admin-top">
        <h1>
          {project.name} — admin
        </h1>
        <div>
          <Link to={`/project/${slug}/`} style={{ marginRight: '0.75rem' }}>
            {en.admin.backProject}
          </Link>
          <button type="button" onClick={logout}>
            {en.common.logout}
          </button>
        </div>
      </header>
      <main className="tg-admin-body">
        <Outlet context={{ project, slug }} />
      </main>
    </div>
  );
}
