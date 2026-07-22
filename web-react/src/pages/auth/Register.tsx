import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { api, ApiError } from '@/api/client';
import { getConfigSync } from '@/api/config';
import { useAuth } from '@/auth/store';

interface FormValues {
  username: string;
  full_name: string;
  email: string;
  password: string;
  accepted_terms: boolean;
}

export default function Register() {
  const navigate = useNavigate();
  const cfg = getConfigSync();
  const setUser = useAuth((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ mode: 'onTouched' });

  useEffect(() => {
    if (!cfg.publicRegisterEnabled) navigate('/not-found', { replace: true });
  }, [cfg.publicRegisterEnabled, navigate]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      const u = await api.post<{ auth_token: string }>('auth/register', {
        ...values,
        type: 'public',
      });
      setUser(u as never);
      navigate('/');
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message || 'Registration failed.' : 'Registration failed.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Sign up</h1>
        {error && <div className="banner banner-error">{error}</div>}
        <form onSubmit={onSubmit} noValidate data-testid="register-form">
          <fieldset>
            <label>Username</label>
            <input {...register('username', { required: 'Required' })} />
            {errors.username && <div className="error-text">{errors.username.message}</div>}
          </fieldset>
          <fieldset>
            <label>Full name</label>
            <input {...register('full_name', { required: 'Required' })} />
            {errors.full_name && <div className="error-text">{errors.full_name.message}</div>}
          </fieldset>
          <fieldset>
            <label>Email</label>
            <input type="email" {...register('email', { required: 'Required' })} />
            {errors.email && <div className="error-text">{errors.email.message}</div>}
          </fieldset>
          <fieldset>
            <label>Password</label>
            <input type="password" {...register('password', { required: 'Required', minLength: 6 })} />
            {errors.password && <div className="error-text">Password is required (min 6).</div>}
          </fieldset>
          <fieldset>
            <label style={{ fontWeight: 400, display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input type="checkbox" {...register('accepted_terms', { required: true })} style={{ width: 'auto' }} />
              <span>I accept the terms of service.</span>
            </label>
          </fieldset>
          <fieldset className="end" style={{ marginTop: '0.8rem' }}>
            <button className="btn" disabled={submitting} style={{ width: '100%', justifyContent: 'center' }}>
              {submitting ? 'Creating…' : 'Create account'}
            </button>
          </fieldset>
        </form>
        <p className="muted" style={{ textAlign: 'center', marginTop: '1rem' }}>
          <Link to="/login">Already have an account? Sign in</Link>
        </p>
      </div>
    </div>
  );
}
