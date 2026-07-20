import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTaigaConfig } from '../../contexts/ConfigContext';
import { login } from '../../api/auth';
import { useDocumentMeta } from '../../hooks/useDocumentMeta';
import { resolveNavUrl } from '../../lib/navUrls';
import type { TaigaUser } from '../../api/types';

type Props = { user: TaigaUser | null };

export function LoginPage({ user }: Props) {
  const { t } = useTranslation();
  const config = useTaigaConfig();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useDocumentMeta(t('LOGIN.PAGE_TITLE'), t('LOGIN.PAGE_DESCRIPTION'));

  if (user && !searchParams.get('force_login')) {
    const next = searchParams.get('next');
    navigate(next ? decodeURIComponent(next) : `/${resolveNavUrl('home')}`, { replace: true });
    return null;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(config, { username, password });
      const next = searchParams.get('next');
      navigate(next ? decodeURIComponent(next) : `/${resolveNavUrl('home')}`, { replace: true });
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="tg-login">
      <h1 style={{ marginTop: 0 }}>{t('LOGIN.PAGE_TITLE')}</h1>
      <form onSubmit={(e) => void onSubmit(e)}>
        {error && <div className="error">{error}</div>}
        <label htmlFor="username">{t('LOGIN_COMMON.PLACEHOLDER_AUTH_NAME')}</label>
        <input
          id="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <label htmlFor="password">{t('LOGIN_COMMON.PLACEHOLDER_AUTH_PASSWORD')}</label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="btn-small" disabled={pending} style={{ width: '100%' }}>
          {pending ? t('COMMON.LOADING') : t('LOGIN_COMMON.ACTION_SIGN_IN')}
        </button>
      </form>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
        <Link to={`/${resolveNavUrl('forgot-password')}`}>{t('LOGIN_COMMON.ACTION_FORGOT_PASSWORD')}</Link>
      </p>
    </div>
  );
}
