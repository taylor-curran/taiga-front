import { NavLink, Outlet, useParams } from 'react-router';
import { projectAdminRoutes, DEMO_PROJECT_SLUG } from '@/routes/adminRoutePaths';
import { AppHeader } from './AppHeader';
import './shell.css';

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'app-shell-nav__link app-shell-nav__link--active' : 'app-shell-nav__link';

function projectAdminHref(pslug: string | undefined, pattern: string) {
  return `/project/${pslug ?? DEMO_PROJECT_SLUG}/${pattern}`;
}

/**
 * Parity with `admin-menu.jade` + submenus: one flat list of all project admin targets for dev navigation.
 */
export default function ProjectAdminLayout() {
  const { pslug } = useParams();

  return (
    <div className="app-shell" data-testid="project-admin-layout">
      <AppHeader />
      <div className="app-shell__body">
        <aside className="app-shell__sidebar" aria-label="Project administration">
          <p className="app-shell__sidebar-title">Project admin</p>
          <p className="app-shell__sidebar-meta">
            <span data-testid="project-slug-label">Project slug:</span> <code>{pslug}</code>
          </p>
          <nav className="app-shell-nav" data-testid="admin-side-nav">
            {projectAdminRoutes.map((r) => (
              <NavLink
                key={r.pattern}
                to={projectAdminHref(pslug, r.pattern)}
                className={navClass}
                data-testid={`admin-nav-${r.pattern.replace(/[/:]/g, '-')}`}
              >
                {r.featureLabel}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="app-shell__main" data-testid="admin-outlet">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
