import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/common/Avatar';

export function AppShell() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-taiga-grey-lighter">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 h-14">
          <Link to="/" className="text-taiga-green-dark font-extrabold text-xl tracking-tight no-underline hover:no-underline">
            taiga
          </Link>
          <nav className="flex-1 flex items-center gap-1 ml-4">
            <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Home
            </NavLink>
            <NavLink to="/projects/" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Projects
            </NavLink>
            <NavLink to="/discover" className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              Discover
            </NavLink>
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Link to="/notifications" className="nav-link" title="Notifications">
                  <span aria-hidden>🔔</span>
                </Link>
                <Link to="/user-settings/user-profile" className="flex items-center gap-2 text-sm hover:bg-taiga-grey-lighter/40 rounded px-2 py-1">
                  <Avatar name={user.full_name_display || user.full_name || user.username} src={user.photo} size={28} />
                  <span className="hidden md:inline">{user.full_name_display || user.username}</span>
                </Link>
                <button
                  className="btn-ghost text-sm"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-taiga-grey-lighter py-4 text-center text-xs text-taiga-grey-light">
        Taiga · React port (work in progress)
      </footer>
    </div>
  );
}
