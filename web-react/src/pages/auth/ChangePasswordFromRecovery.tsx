import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, ApiError } from '@/api/client';

interface FormValues {
  password: string;
  passwordConfirm: string;
}

export default function ChangePasswordFromRecovery() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onTouched' });

  const pwd = watch('password');

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      await api.post('users/change_password_from_recovery', { token, password: values.password });
      navigate('/login');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not change password.');
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Reset password</h1>
        {error && <div className="banner banner-error">{error}</div>}
        <form onSubmit={onSubmit} noValidate>
          <fieldset>
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              type="password"
              autoFocus
              {...register('password', { required: 'Required', minLength: { value: 6, message: 'Min 6 characters' } })}
            />
            {errors.password && <div className="error-text">{errors.password.message}</div>}
          </fieldset>
          <fieldset>
            <label htmlFor="new-password-confirm">Confirm password</label>
            <input
              id="new-password-confirm"
              type="password"
              {...register('passwordConfirm', {
                required: 'Required',
                validate: (v) => v === pwd || 'Passwords do not match',
              })}
            />
            {errors.passwordConfirm && (
              <div className="error-text">{errors.passwordConfirm.message}</div>
            )}
          </fieldset>
          <fieldset className="end" style={{ marginTop: '0.8rem' }}>
            <button type="submit" className="btn" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? 'Saving…' : 'Change password'}
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
