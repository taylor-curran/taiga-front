import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/api/client';

interface FormValues {
  username: string;
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onTouched' });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    setError(null);
    try {
      await api.post('users/password_recovery', values);
      navigate('/login');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Could not send recovery email.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Recover</h1>
        <p className="tagline">We'll send a password reset link to your email.</p>
        {error && (
          <div className="banner banner-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={onSubmit} noValidate data-testid="forgot-form">
          <fieldset>
            <label htmlFor="recover-username">Username or email</label>
            <input
              id="recover-username"
              type="text"
              autoFocus
              {...register('username', { required: 'Required' })}
              aria-invalid={Boolean(errors.username)}
            />
            {errors.username && <div className="error-text">{errors.username.message}</div>}
          </fieldset>
          <fieldset className="end" style={{ marginTop: '0.8rem' }}>
            <button
              type="submit"
              className="btn"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={submitting}
            >
              {submitting ? 'Sending…' : 'Send recovery email'}
            </button>
          </fieldset>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
