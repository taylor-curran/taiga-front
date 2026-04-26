import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loginRequest } from '../../auth/apiClient';
import { useAuthStore } from '../../auth/authStore';
import { en } from '../../i18n/en';
import './LoginPage.css';

function decodeNext(raw: string | null, forceNext: string | null): string {
  if (forceNext) {
    try {
      return decodeURIComponent(forceNext);
    } catch {
      return '/';
    }
  }
  if (raw) {
    try {
      const d = decodeURIComponent(raw);
      if (d === '/login' || d.startsWith('/discover')) return '/';
      return d;
    } catch {
      return '/';
    }
  }
  return '/';
}

export function LoginPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const setSession = useAuthStore((s) => s.setSession);
  const clearSession = useAuthStore((s) => s.clearSession);
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthed = useAuthStore((s) => !!s.user);

  const forceLogin = params.get('force_login');
  const unauthorized = params.get('unauthorized');
  const nextParam = params.get('next');
  const forceNext = params.get('force_next');

  const nextUrl = useMemo(() => decodeNext(nextParam, forceNext), [nextParam, forceNext]);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [capsHint, setCapsHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthed || forceLogin) return;
    if (unauthorized) {
      clearSession();
      const p = new URLSearchParams(params);
      p.delete('unauthorized');
      p.delete('next');
      setParams(p, { replace: true });
      return;
    }
    navigate(nextUrl, { replace: true });
  }, [
    hydrated,
    isAuthed,
    forceLogin,
    unauthorized,
    nextUrl,
    navigate,
    clearSession,
    setParams,
    params,
  ]);

  const onPasswordKeyUp = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const v = (e.currentTarget as HTMLInputElement).value;
      setCapsHint(v.length > 0 && v !== v.toLowerCase());
    },
    [],
  );

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password) {
      setError(en.login.errorIncorrect);
      return;
    }
    setSubmitting(true);
    try {
      const user = await loginRequest(username.trim(), password);
      setSession(user);
      if (nextUrl.startsWith('http')) {
        window.location.href = nextUrl;
      } else {
        navigate(nextUrl, { replace: true });
      }
    } catch {
      setError(en.login.errorIncorrect);
    } finally {
      setSubmitting(false);
    }
  };

  if (hydrated && isAuthed && !forceLogin && !unauthorized) {
    return null;
  }

  return (
    <div className="tg-auth">
      <div className="tg-auth-container">
        <div className="logo-svg">
          <img src="/logo-color.svg" width={128} height={128} alt="" />
        </div>
        <h1 className="logo">{en.login.title}</h1>
        <h2 className="tagline">{en.common.tagLine2}</h2>

        <div className="tg-login-form-container">
          {error ? <div className="tg-notify-light-error">{error}</div> : null}
          <form className="tg-login-form" onSubmit={onSubmit} noValidate>
            <fieldset>
              <input
                type="text"
                name="username"
                autoComplete="username"
                autoCorrect="off"
                autoCapitalize="none"
                required
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                placeholder={en.login.usernamePlaceholder}
                className={error ? 'tg-input-error' : undefined}
              />
            </fieldset>
            <fieldset className="tg-login-password">
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                onKeyUp={onPasswordKeyUp}
                placeholder={en.login.passwordPlaceholder}
                className={error ? 'tg-input-error' : undefined}
              />
              <Link className="tg-forgot-pass" to="/forgot-password" title={en.login.forgotTitle}>
                {en.login.forgot}
              </Link>
            </fieldset>
            {capsHint ? <p className="tg-capslock-hint">{en.common.capslock}</p> : null}
            <fieldset className="end">
              <button type="submit" className="tg-btn-primary" disabled={submitting}>
                {en.login.submit}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
}
