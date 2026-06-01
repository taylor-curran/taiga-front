import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, ApiError } from '../../auth/AuthProvider';
import './auth.scss';

export default function LoginPage() {
  const { t } = useTranslation();
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const next = (location.state as { next?: string })?.next || '/';

  if (isAuthenticated) {
    navigate(next, { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate(next, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as { _error_message?: string };
        setError(data?._error_message || t('LOGIN.ERROR'));
      } else {
        setError(t('LOGIN.ERROR'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
            <circle cx="14" cy="14" r="14" fill="#25A28C" />
            <text x="14" y="19" textAnchor="middle" fill="#fff" fontSize="14" fontWeight="bold">T</text>
          </svg>
        </div>
        <h1 className="auth-title">{t('LOGIN.TITLE')}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-field">
            <label htmlFor="login-username">{t('LOGIN.USERNAME_OR_EMAIL')}</label>
            <input
              id="login-username"
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
              autoComplete="username"
            />
          </div>
          <div className="form-field">
            <label htmlFor="login-password">{t('LOGIN.PASSWORD')}</label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? t('COMMON.LOADING') : t('LOGIN.SUBMIT')}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/forgot-password">{t('LOGIN.FORGOT_PASSWORD')}</Link>
          <Link to="/register">{t('LOGIN.CREATE_ACCOUNT')}</Link>
        </div>
      </div>
    </div>
  );
}
