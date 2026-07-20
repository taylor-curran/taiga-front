import { Link } from 'react-router';
import { DEMO_PROJECT_SLUG } from '@/routes/adminRoutePaths';

export function AppHeader() {
  return (
    <header className="app-header" data-testid="app-header">
      <div className="app-header__brand">
        <Link to="/" className="app-header__logo" data-testid="nav-home">
          Taiga
        </Link>
        <span className="app-header__tag">Admin (React port)</span>
      </div>
      <nav className="app-header__nav" aria-label="Skeletal shortcuts">
        <Link to={`/project/${DEMO_PROJECT_SLUG}/admin/project-profile/details`} data-testid="nav-jump-admin">
          Project admin
        </Link>
        <Link to="/user-settings/user-profile" data-testid="nav-jump-settings">
          User settings
        </Link>
        <Link to="/login" data-testid="nav-jump-login">
          Login
        </Link>
      </nav>
    </header>
  );
}
