import { NavLink, Outlet, useLocation, useParams } from 'react-router-dom';
import { primaryNav, tertiaryNav } from './adminNavConfig';
import type { NavItem } from './adminNavConfig';

function isPrimarySectionActive(pathname: string, item: NavItem): boolean {
  switch (item.id) {
    case 'adminmenu-project-profile':
      return pathname.includes('/admin/project-profile');
    case 'adminmenu-project-values':
      return pathname.includes('/admin/project-values');
    case 'adminmenu-memberships':
      return pathname.includes('/admin/memberships');
    case 'adminmenu-roles':
      return pathname.includes('/admin/roles');
    case 'adminmenu-third-parties':
      return pathname.includes('/admin/third-parties');
    case 'adminmenu-contrib':
      return pathname.includes('/admin/contrib');
    default:
      return false;
  }
}

export type { NavItem };

export function AdminShellLayout() {
  const { projectSlug = '' } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const primary = primaryNav(projectSlug);
  const tertiary = tertiaryNav(projectSlug, pathname);

  return (
    <div className="taiga-admin-root" data-testid="admin-shell-root">
      <div className="taiga-admin-wrapper">
        <aside className="taiga-admin-menu-secondary settings-nav" aria-label="Admin sections">
          <nav>
            <ul>
              {primary.map((item) => {
                const active = isPrimarySectionActive(pathname, item);
                return (
                  <li key={item.id} id={item.id} className={active ? 'is-active' : undefined}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => (isActive || active ? 'is-active' : '')}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {tertiary.length > 0 ? (
          <aside className="taiga-admin-menu-tertiary" aria-label="Admin subsection">
            <nav>
              <ul>
                {tertiary.map((item) => (
                  <li key={item.id} id={item.id}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) => (isActive ? 'is-active' : '')}
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        ) : null}

        <section className="taiga-admin-main">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
