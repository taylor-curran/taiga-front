import { Link, Outlet, useParams } from 'react-router-dom';
import { useProjectBySlug } from '../hooks/useProjectBySlug';

type Section = 'memberships' | 'roles';

export function AdminLayout({ section }: { section: Section }) {
  const { projectSlug } = useParams<{ projectSlug: string }>();
  const { project, loading, error } = useProjectBySlug(projectSlug);

  if (loading) {
    return (
      <div className="admin-shell">
        <p className="centered">Loading…</p>
      </div>
    );
  }

  if (error === 'permission-denied') {
    return (
      <div className="admin-shell">
        <p className="centered">You do not have permission to view this project admin area.</p>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="admin-shell">
        <p className="centered">Project not found.</p>
      </div>
    );
  }

  const base = `/project/${project.slug}/admin`;

  return (
    <div className="admin-shell">
      <div className={`wrapper ${section === 'memberships' ? 'memberships' : 'roles'}`}>
        <aside className="menu-secondary sidebar settings-nav">
          <section className="admin-menu">
            <nav>
              <ul>
                <li id="adminmenu-project-profile">
                  <span className="title" style={{ opacity: 0.55, pointerEvents: 'none' }}>
                    Project settings
                  </span>
                </li>
                <li id="adminmenu-memberships" className={section === 'memberships' ? 'active' : ''}>
                  <Link to={`${base}/memberships`}>
                    <span className="title">Members</span>
                  </Link>
                </li>
                {!project.archived_code && (
                  <li id="adminmenu-roles" className={section === 'roles' ? 'active' : ''}>
                    <Link to={`${base}/roles`}>
                      <span className="title">Permissions</span>
                    </Link>
                  </li>
                )}
              </ul>
            </nav>
          </section>
        </aside>

        {section === 'roles' && (
          <aside className="menu-tertiary sidebar">
            <section className="admin-submenu">
              <nav>
                <ul>
                  <li className="active">
                    <span>Roles</span>
                  </li>
                </ul>
              </nav>
            </section>
          </aside>
        )}

        <Outlet context={{ project }} />
      </div>
    </div>
  );
}
