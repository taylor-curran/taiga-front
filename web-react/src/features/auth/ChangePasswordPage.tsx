import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthProvider';
import './auth.scss';

export default function ChangePasswordPage() {
  const { t } = useTranslation();
  const { token } = useParams<{ token: string }>();
  const { changePasswordFromRecovery } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError(t('CHANGE_PASSWORD.PASSWORDS_DONT_MATCH'));
      return;
    }
    setError('');
    setLoading(true);
    try {
      await changePasswordFromRecovery(token!, password);
      navigate('/login');
    } catch {
      setError(t('CHANGE_PASSWORD.ERROR'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">{t('CHANGE_PASSWORD.TITLE')}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-field">
            <label htmlFor="cp-password">{t('CHANGE_PASSWORD.NEW_PASSWORD')}</label>
            <input id="cp-password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoFocus autoComplete="new-password" />
          </div>
          <div className="form-field">
            <label htmlFor="cp-confirm">{t('CHANGE_PASSWORD.REPEAT_PASSWORD')}</label>
            <input id="cp-confirm" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required autoComplete="new-password" />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? t('COMMON.LOADING') : t('CHANGE_PASSWORD.SUBMIT')}
          </button>
        </form>
      </div>
    </div>
  );
}
