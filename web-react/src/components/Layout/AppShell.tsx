import { useState, useCallback } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth';
import { useMyProjects } from '@/services/projects';
import { Avatar } from '@/components/common/Avatar';
import { Dropdown } from '@/components/common/Dropdown';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';

export function AppShell() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);
  const logout = useAuth((s) => s.logout);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-gray-300 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-4 px-4 h-14">
          {/* Hamburger (mobile) */}
          <button
            className="tablet:hidden text-black-900 text-xl p-1"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {'\u2630'}
          </button>

          {/* Logo */}
          <Link
            to="/"
            className="text-primary font-extrabold text-xl tracking-tight no-underline hover:no-underline"
          >
            taiga
          </Link>

          {/* Desktop nav */}
          <nav className="hidden tablet:flex flex-1 items-center gap-1 ml-4">
            <NavLink to="/" end className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')}>
              {t('COMMON.GO_HOME', 'Home')}
            </NavLink>
            <NavLink to="/projects/" className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')}>
              {t('PROJECT.SECTION_NAME', 'Projects')}
            </NavLink>
            <NavLink to="/discover" className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')}>
              {t('PROJECT.NAVIGATION.DISCOVER', 'Discover')}
            </NavLink>

            {/* Project switcher */}
            {user && <ProjectSwitcher />}
          </nav>

          {/* Right side */}
          <div className="hidden tablet:flex items-center gap-2 ml-auto">
            <LanguageSwitcher />

            {user ? (
              <>
                <Link to="/notifications" className="nav-link relative" title={t('NOTIFICATIONS.TITLE', 'Notifications')}>
                  <span aria-hidden className="text-base">{'\uD83D\uDD14'}</span>
                </Link>

                <Dropdown
                  align="right"
                  trigger={
                    <div className="flex items-center gap-2 text-sm hover:bg-gray-300/40 rounded px-2 py-1 cursor-pointer">
                      <Avatar name={user.full_name_display || user.full_name || user.username} src={user.photo} size={28} />
                      <span className="hidden desktop:inline text-black-900">
                        {user.full_name_display || user.username}
                      </span>
                    </div>
                  }
                  items={[
                    { key: 'profile', label: t('USER_PROFILE.PAGE_TITLE', 'Profile'), onClick: () => navigate('/profile') },
                    { key: 'settings', label: t('USER_SETTINGS.PAGE_TITLE', 'Settings'), onClick: () => navigate('/user-settings/user-profile') },
                    { key: 'logout', label: t('COMMON.LOGOUT', 'Sign out'), onClick: handleLogout, danger: true },
                  ]}
                />
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm">
                {t('LOGIN.TITLE', 'Sign in')}
              </Link>
            )}
          </div>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <nav className="tablet:hidden border-t border-gray-300 bg-white px-4 py-2 space-y-1">
            <NavLink to="/" end className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')} onClick={() => setMobileOpen(false)}>
              {t('COMMON.GO_HOME', 'Home')}
            </NavLink>
            <NavLink to="/projects/" className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')} onClick={() => setMobileOpen(false)}>
              {t('PROJECT.SECTION_NAME', 'Projects')}
            </NavLink>
            <NavLink to="/discover" className={({ isActive }) => clsx('nav-link', isActive && 'nav-link-active')} onClick={() => setMobileOpen(false)}>
              {t('PROJECT.NAVIGATION.DISCOVER', 'Discover')}
            </NavLink>
            {user && (
              <>
                <Link to="/notifications" className="nav-link" onClick={() => setMobileOpen(false)}>
                  {t('NOTIFICATIONS.TITLE', 'Notifications')}
                </Link>
                <Link to="/user-settings/user-profile" className="nav-link" onClick={() => setMobileOpen(false)}>
                  {t('USER_SETTINGS.PAGE_TITLE', 'Settings')}
                </Link>
                <LanguageSwitcher />
                <button className="nav-link text-link-red w-full text-left" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  {t('COMMON.LOGOUT', 'Sign out')}
                </button>
              </>
            )}
            {!user && (
              <Link to="/login" className="btn-primary text-sm w-full" onClick={() => setMobileOpen(false)}>
                {t('LOGIN.TITLE', 'Sign in')}
              </Link>
            )}
          </nav>
        )}
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        <Outlet />
      </main>

      <footer className="border-t border-gray-300 py-4 text-center text-xs text-gray-600">
        {'\u00A9'} Taiga {'\u00B7'} React port (work in progress)
      </footer>
    </div>
  );
}

function ProjectSwitcher() {
  const { data: projects } = useMyProjects();
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!projects || projects.length === 0) return null;

  return (
    <Dropdown
      trigger={
        <span className="nav-link cursor-pointer text-sm flex items-center gap-1">
          {t('PROJECT.SECTION_NAME', 'Projects')} {'\u25BE'}
        </span>
      }
      items={projects.slice(0, 15).map((p) => ({
        key: String(p.id),
        label: p.name,
        onClick: () => navigate(`/project/${p.slug}/`),
      }))}
    />
  );
}
