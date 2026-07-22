import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/auth/store';
import { ApiError } from '@/api/client';
import { getConfigSync } from '@/api/config';

interface FormValues {
  username: string;
  password: string;
}

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const cfg = getConfigSync();
  const user = useAuth((s) => s.user);
  const login = useAuth((s) => s.login);
  const setUser = useAuth((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormValues>({ mode: 'onTouched' });

  const nextUrl =
    params.get('force_next') !== null
      ? decodeURIComponent(params.get('force_next') ?? '')
      : params.get('next') !== null && !params.get('next')!.startsWith('%2Fdiscover')
        ? decodeURIComponent(params.get('next') ?? '/')
        : '/';

  useEffect(() => {
    if (user && !params.get('force_login')) {
      if (params.get('unauthorized')) {
        setUser(null);
      } else {
        navigate(nextUrl || '/', { replace: true });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    setSubmitting(true);
    try {
      await login(values);
      navigate(nextUrl || '/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError('Username or password is incorrect.');
      } else if (err instanceof ApiError) {
        setError(err.message || 'Login failed.');
      } else {
        setError('Login failed.');
      }
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Taiga</h1>
        <p className="tagline">Project management platform</p>

        {params.get('unauthorized') && !error && (
          <div className="banner banner-info" role="status">
            You have been signed out. Please sign in again.
          </div>
        )}

        {error && (
          <div className="banner banner-error" role="alert" data-testid="login-error">
            {error}
          </div>
        )}

        {cfg.defaultLoginEnabled && (
          <form onSubmit={onSubmit} className="login-form" noValidate data-testid="login-form">
            <fieldset>
              <label htmlFor="username">Username or email</label>
              <input
                id="username"
                type="text"
                autoFocus
                autoCorrect="off"
                autoCapitalize="none"
                placeholder="username or email address"
                aria-invalid={Boolean(errors.username)}
                {...register('username', { required: 'Required' })}
              />
              {errors.username && <div className="error-text">{errors.username.message}</div>}
            </fieldset>
            <fieldset>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="password"
                aria-invalid={Boolean(errors.password)}
                {...register('password', { required: 'Required' })}
              />
              <div style={{ marginTop: '0.4rem' }}>
                <Link to="/forgot-password" className="muted">
                  Forgot password?
                </Link>
              </div>
            </fieldset>
            <fieldset className="end" style={{ marginTop: '0.8rem' }}>
              <button
                type="submit"
                className="btn"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={submitting || !isValid}
                data-testid="login-submit"
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </button>
            </fieldset>
          </form>
        )}
        {cfg.publicRegisterEnabled && (
          <p className="muted" style={{ marginTop: '1rem', textAlign: 'center' }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
        )}
      </div>
    </div>
  );
}
