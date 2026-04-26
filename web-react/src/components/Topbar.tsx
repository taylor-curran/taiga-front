import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/auth/store';
import { Avatar } from './Avatar';

export function Topbar() {
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar" data-testid="topbar">
      <Link to={user ? '/' : '/login'} className="brand">
        TAIGA
      </Link>
      {user && (
        <>
          <NavLink to="/projects/" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Projects
          </NavLink>
          <NavLink to="/discover" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Discover
          </NavLink>
          <NavLink to="/notifications" className={({ isActive }) => (isActive ? 'active' : undefined)}>
            Notifications
          </NavLink>
        </>
      )}
      <span className="spacer" />
      {user ? (
        <span className="user-chip">
          <Link to="/profile" data-testid="profile-link">
            <Avatar user={user} size={28} />
          </Link>
          <Link to="/profile">{user.full_name_display || user.username}</Link>
          <button type="button" onClick={onLogout} data-testid="logout-button">
            Sign out
          </button>
        </span>
      ) : (
        <Link to="/login">Sign in</Link>
      )}
    </header>
  );
}
