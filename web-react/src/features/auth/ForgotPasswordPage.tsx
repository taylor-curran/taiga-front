import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../auth/AuthProvider';
import './auth.scss';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPassword(email);
      setSubmitted(true);
    } catch {
      setError(t('FORGOT_PASSWORD.ERROR'));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-box">
          <h1 className="auth-title">{t('FORGOT_PASSWORD.SUCCESS_TITLE')}</h1>
          <p className="auth-text">{t('FORGOT_PASSWORD.SUCCESS_TEXT')}</p>
          <div className="auth-links">
            <Link to="/login">{t('FORGOT_PASSWORD.BACK_TO_LOGIN')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <h1 className="auth-title">{t('FORGOT_PASSWORD.TITLE')}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-field">
            <label htmlFor="fp-email">{t('FORGOT_PASSWORD.EMAIL')}</label>
            <input id="fp-email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? t('COMMON.LOADING') : t('FORGOT_PASSWORD.SUBMIT')}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">{t('FORGOT_PASSWORD.BACK_TO_LOGIN')}</Link>
        </div>
      </div>
    </div>
  );
}
