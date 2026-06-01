import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth, ApiError } from '../../auth/AuthProvider';
import './auth.scss';

export default function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', full_name: '', email: '', password: '', accepted_terms: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({ ...form, type: 'public' });
      navigate('/');
    } catch (err) {
      if (err instanceof ApiError) {
        const data = err.data as Record<string, string[]>;
        const firstField = Object.keys(data)[0];
        setError(firstField ? `${firstField}: ${data[firstField][0]}` : t('REGISTER.ERROR'));
      } else {
        setError(t('REGISTER.ERROR'));
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
        <h1 className="auth-title">{t('REGISTER.TITLE')}</h1>
        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          <div className="form-field">
            <label htmlFor="reg-fullname">{t('REGISTER.FULLNAME')}</label>
            <input id="reg-fullname" type="text" value={form.full_name} onChange={update('full_name')} required autoFocus />
          </div>
          <div className="form-field">
            <label htmlFor="reg-username">{t('REGISTER.USERNAME')}</label>
            <input id="reg-username" type="text" value={form.username} onChange={update('username')} required />
          </div>
          <div className="form-field">
            <label htmlFor="reg-email">{t('REGISTER.EMAIL')}</label>
            <input id="reg-email" type="email" value={form.email} onChange={update('email')} required />
          </div>
          <div className="form-field">
            <label htmlFor="reg-password">{t('REGISTER.PASSWORD')}</label>
            <input id="reg-password" type="password" value={form.password} onChange={update('password')} required autoComplete="new-password" />
          </div>
          <div className="form-field-checkbox">
            <input id="reg-terms" type="checkbox" checked={form.accepted_terms} onChange={update('accepted_terms')} required />
            <label htmlFor="reg-terms">{t('REGISTER.TERMS')}</label>
          </div>
          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? t('COMMON.LOADING') : t('REGISTER.SUBMIT')}
          </button>
        </form>
        <div className="auth-links">
          <Link to="/login">{t('REGISTER.ALREADY_HAVE_ACCOUNT')}</Link>
        </div>
      </div>
    </div>
  );
}
