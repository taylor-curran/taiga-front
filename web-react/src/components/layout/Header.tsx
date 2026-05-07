import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth';
import { getAvatarUrl } from '../../utils/gravatar';
import { useState, useRef, useEffect } from 'react';

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
    <header className="main-header">
      <div className="header-left">
        <Link to="/" className="logo-link">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFB6C1" />
                <stop offset="50%" stopColor="#FF69B4" />
                <stop offset="100%" stopColor="#E91E90" />
              </linearGradient>
            </defs>
            <rect width="28" height="28" rx="6" fill="url(#logoGrad)" />
            <text x="14" y="20" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">T</text>
          </svg>
        </Link>
        {isAuthenticated() && (
          <nav className="header-nav">
            <Link to="/projects/" className="nav-link">Projects</Link>
          </nav>
        )}
      </div>
      <div className="header-right">
        {isAuthenticated() ? (
          <div className="user-menu" ref={menuRef}>
            <button className="user-avatar-btn" onClick={() => setMenuOpen(!menuOpen)}>
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
        ) : (
          <Link to="/login" className="nav-link login-link">Login</Link>
        )}
      </div>
    </header>
  );
}
