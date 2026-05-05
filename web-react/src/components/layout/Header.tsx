import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { getAvatarUrl } from '../../utils/gravatar';
import { useState, useRef, useEffect } from 'react';
import TaigaLogo from '../common/TaigaLogo';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar main-header">
      <div className="nav-left header-left">
        <Link to="/" className="logo logo-link" title="Homepage">
          <TaigaLogo size={28} />
        </Link>
        {isAuthenticated() && (
          <nav className="header-nav">
            <Link to="/projects/" className="nav-link">Projects</Link>
          </nav>
        )}
      </div>
      <div className="nav-right header-right">
        {isAuthenticated() ? (
          <>
            <Link
              to="/discover"
              className="nav-link nav-icon"
              title="Discover trending projects"
            >
              <span aria-hidden>⌖</span>
            </Link>
            <a
              href="https://community.taiga.io/"
              target="_blank"
              rel="noreferrer"
              className="nav-link nav-icon"
              title="Help"
            >
              <span aria-hidden>?</span>
            </a>
            <Link
              to="/notifications"
              className="nav-link nav-icon"
              title="Events"
            >
              <span aria-hidden>🔔</span>
            </Link>
            <div className="user-menu" ref={menuRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setMenuOpen(!menuOpen)}
                title={user?.full_name_display || user?.username || 'User menu'}
              >
                <img
                  src={getAvatarUrl(user)}
                  alt={user?.full_name_display || user?.username || ''}
                  className="user-avatar"
                />
              </button>
              {menuOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <strong>{user?.full_name_display || user?.username}</strong>
                    <span className="dropdown-email">{user?.email}</span>
                  </div>
                  <div className="dropdown-divider" />
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>My profile</Link>
                  <Link to="/notifications" className="dropdown-item" onClick={() => setMenuOpen(false)}>Notifications</Link>
                  <Link to="/user-settings/user-profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>Settings</Link>
                  <div className="dropdown-divider" />
                  <button className="dropdown-item logout-btn" onClick={handleLogout}>Sign out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="nav-link login-link">Login</Link>
        )}
      </div>
    </nav>
  );
}
