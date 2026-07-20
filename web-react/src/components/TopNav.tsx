import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { storageRemove } from '../lib/storage';
import type { TaigaUser } from '../api/types';
import { resolveNavUrl } from '../lib/navUrls';

type Props = {
  user: TaigaUser | null;
  publicRegisterEnabled: boolean;
};

export function TopNav({ user, publicRegisterEnabled }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const authed = !!user;

  const logout = () => {
    storageRemove('token');
    storageRemove('refresh');
    storageRemove('userInfo');
    navigate(`/${resolveNavUrl('login')}`);
    window.location.reload();
  };

  return (
    <nav className="tg-navbar">
      <div>
        {authed ? (
          <Link className="tg-logo" to={`/${resolveNavUrl('home')}`} title={t('PROJECT.NAVIGATION.HOMEPAGE')}>
            TAIGA
          </Link>
        ) : (
          <a
            className="tg-logo"
            href="https://taiga.io/"
            title={t('PROJECT.NAVIGATION.HOMEPAGE')}
            target="_blank"
            rel="noreferrer"
          >
            TAIGA
          </a>
        )}
      </div>
      <div>
        {!authed && (
          <>
            <a href="#" onClick={(e) => { e.preventDefault(); navigate(`/${resolveNavUrl('login')}`); }}>
              {t('LOGIN_COMMON.ACTION_SIGN_IN')}
            </a>
            {publicRegisterEnabled && (
              <Link to={`/${resolveNavUrl('register')}`}>{t('REGISTER_FORM.ACTION_SIGN_UP')}</Link>
            )}
          </>
        )}
        {authed && (
          <>
            <Link to={`/${resolveNavUrl('discover')}`} title={t('PROJECT.NAVIGATION.DISCOVER_TITLE')}>
              ◎
            </Link>
            <Link to={`/${resolveNavUrl('projects')}`}>{t('PROJECTS.MY_PROJECTS')}</Link>
            <Link to={`/${resolveNavUrl('profile')}`}>{user.username}</Link>
            <a href="#" onClick={(e) => { e.preventDefault(); logout(); }}>
              {t('COMMON.LOGOUT')}
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
