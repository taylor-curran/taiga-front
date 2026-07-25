import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../api/auth';
import { Avatar } from '../components/Avatar';
import { useState } from 'react';

export function NavBar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm">
      <div className="flex items-center gap-6">
        <Link to="/" className="flex items-center gap-2 font-bold text-taiga-700">
          <svg viewBox="0 0 24 24" width={26} height={26} className="text-taiga-600">
            <path
              fill="currentColor"
              d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.31L18.18 8 12 11.69 5.82 8 12 4.31zM5 9.69l6 3.6V20l-6-3.36V9.69zm14 6.95L13 20v-6.71l6-3.6v6.95z"
            />
          </svg>
          <span>Taiga</span>
        </Link>
        {user && (
          <nav className="flex items-center gap-4 text-sm">
            <NavLink
              to="/"
              end
              className={({ isActive }) => (isActive ? 'text-taiga-700 font-semibold' : 'text-slate-600 hover:text-taiga-700')}
            >
              Home
            </NavLink>
            <NavLink
              to="/discover"
              className={({ isActive }) => (isActive ? 'text-taiga-700 font-semibold' : 'text-slate-600 hover:text-taiga-700')}
            >
              Discover
            </NavLink>
            <NavLink
              to="/projects/"
              className={({ isActive }) => (isActive ? 'text-taiga-700 font-semibold' : 'text-slate-600 hover:text-taiga-700')}
            >
              My Projects
            </NavLink>
          </nav>
        )}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <>
            <Link to="/notifications" className="rounded p-2 text-slate-500 hover:bg-slate-100" title="Notifications">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2z" />
              </svg>
            </Link>
            <button
              onClick={() => setOpen((o) => !o)}
              className="flex items-center gap-2 rounded p-1 hover:bg-slate-100"
              aria-haspopup="menu"
              aria-expanded={open}
            >
              <Avatar user={user} size={32} />
              <span className="hidden text-sm font-medium text-slate-700 md:inline">
                {user.full_name_display || user.username}
              </span>
            </button>
            {open && (
              <div className="absolute right-4 top-14 w-56 rounded border border-slate-200 bg-white py-2 shadow-lg" role="menu">
                <Link to={`/profile/${user.username}`} className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Profile
                </Link>
                <Link to="/user-settings/user-profile" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Account settings
                </Link>
                <Link to="/notifications" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
                  Notifications
                </Link>
                <Link to="/project/new" className="block px-4 py-2 text-sm hover:bg-slate-50" onClick={() => setOpen(false)}>
                  New project
                </Link>
                <div className="my-1 h-px bg-slate-200" />
                <button
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    logout();
                    setOpen(false);
                    nav('/login');
                  }}
                >
                  Sign out
                </button>
              </div>
            )}
          </>
        ) : (
          <Link to="/login" className="btn-primary">Sign in</Link>
        )}
      </div>
    </header>
  );
}
