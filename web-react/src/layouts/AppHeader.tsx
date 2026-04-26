import { Link, useLocation } from 'react-router';
import { performLogout } from '@/lib/authActions';
import { useAppStore } from '@/stores/appStore';
import { DEMO_PROJECT_SLUG } from '@/routes/adminRoutePaths';

export function AppHeader() {
    const user = useAppStore((s) => s.user);
    const isAuthed = useAppStore((s) => s.isAuthenticated);
    const location = useLocation();
    const next = encodeURIComponent(`${location.pathname}${location.search}`);

    return (
        <header className="app-header" data-testid="app-header">
            <div className="app-header__brand">
                <Link to="/" className="app-header__logo" data-testid="nav-home">
                    Taiga
                </Link>
                <span className="app-header__tag">Admin (React port)</span>
            </div>
            <nav className="app-header__nav" aria-label="Skeletal shortcuts">
                <Link
                    to={`/project/${DEMO_PROJECT_SLUG}/admin/project-profile/details`}
                    data-testid="nav-jump-admin"
                >
                    Project admin
                </Link>
                <Link to="/user-settings/user-profile" data-testid="nav-jump-settings">
                    User settings
                </Link>
                {isAuthed && user ? (
                    <span
                        className="app-header__user"
                        data-testid="header-user"
                        style={{ fontSize: '0.9rem' }}
                    >
                        {user.username}
                        <button
                            type="button"
                            className="taiga-btn taiga-btn--ghost"
                            data-testid="header-logout"
                            style={{ marginLeft: 8, padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                            onClick={() => performLogout()}
                        >
                            Logout
                        </button>
                    </span>
                ) : (
                    <Link to={`/login?next=${next}`} data-testid="nav-jump-login">
                        Login
                    </Link>
                )}
            </nav>
        </header>
    );
}
