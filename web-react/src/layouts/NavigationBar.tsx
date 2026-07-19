// Top navigation bar — ported from app/modules/navigation-bar/
// Includes: logo, project dropdown, search, user menu, notifications

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthProvider';
import './NavigationBar.scss';

export function NavigationBar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="main-nav">
      <div className="main-nav-left">
        <Link to="/" className="main-nav-logo" aria-label="Taiga Home">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#25A28C" />
            <text x="14" y="19" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">T</text>
          </svg>
        </Link>

        {isAuthenticated && (
          <>
            <Link to="/projects/" className="main-nav-item">
              {t('PROJECT.NAVIGATION.MY_PROJECTS')}
            </Link>
          </>
        )}

        <Link to="/discover" className="main-nav-item">
          {t('PROJECT.NAVIGATION.DISCOVER')}
        </Link>
      </div>

      <div className="main-nav-right">
        {isAuthenticated ? (
          <>
            <Link to="/notifications" className="main-nav-item main-nav-notifications" aria-label="Notifications">
              <span className="nav-icon">&#128276;</span>
            </Link>
            <div className="main-nav-user" ref={menuRef}>
              <button
                className="main-nav-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
              >
                {user?.photo ? (
                  <img src={user.photo} alt={user.full_name_display} className="nav-avatar" />
                ) : (
                  <span className="nav-avatar nav-avatar-placeholder" style={{ background: user?.color || '#25A28C' }}>
                    {(user?.full_name_display || 'U')[0].toUpperCase()}
                  </span>
                )}
              </button>
              {userMenuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <strong>{user?.full_name_display}</strong>
                    <span>@{user?.username}</span>
                  </div>
                  <Link to="/profile" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    {t('USER.MY_PROFILE')}
                  </Link>
                  <Link to="/user-settings/user-profile" className="user-dropdown-item" onClick={() => setUserMenuOpen(false)}>
                    {t('USER.SETTINGS.SECTION_TITLE')}
                  </Link>
                  <button className="user-dropdown-item user-dropdown-logout" onClick={handleLogout}>
                    {t('COMMON.LOGOUT')}
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link to="/login" className="btn btn-primary main-nav-login">
            {t('COMMON.LOGIN')}
          </Link>
        )}
      </div>
    </nav>
  );
}
