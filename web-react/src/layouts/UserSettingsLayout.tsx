import { NavLink, Outlet } from 'react-router';
import { userSettingsRoutes } from '@/routes/adminRoutePaths';
import { AppHeader } from './AppHeader';
import './shell.css';

const navClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'app-shell-nav__link app-shell-nav__link--active' : 'app-shell-nav__link';

export default function UserSettingsLayout() {
  return (
    <div className="app-shell" data-testid="user-settings-layout">
      <AppHeader />
      <div className="app-shell__body">
        <aside className="app-shell__sidebar" aria-label="User settings">
          <p className="app-shell__sidebar-title">User settings</p>
          <nav className="app-shell-nav" data-testid="user-settings-nav">
            {userSettingsRoutes.map((r) => (
              <NavLink
                key={r.pattern}
                to={`/user-settings/${r.pattern}`}
                className={navClass}
                data-testid={`user-settings-nav-${r.pattern.replace(/[/:]/g, '-')}`}
              >
                {r.featureLabel}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="app-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
