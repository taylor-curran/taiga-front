import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../api/auth';
import { getConfig } from '../../api/config';
import { toast } from '../../components/Toast';

export default function Login() {
  const { user, login, loading } = useAuth();
  const cfg = (() => {
    try {
      return getConfig();
    } catch {
      return null;
    }
  })();
  const nav = useNavigate();
  const [search] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [capslock, setCapslock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) nav(search.get('next') || '/');
  }, [user, nav, search]);

  useEffect(() => {
    if (search.get('unauthorized')) {
      toast.warning('Session expired. Please sign in again.');
    }
  }, [search]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login({ username, password });
      const next = search.get('next');
      nav(next || '/');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { _error_message?: string } } };
      setError(ax?.response?.data?._error_message || 'Wrong username or password');
    }
  };

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapslock(e.getModifierState && e.getModifierState('CapsLock'));
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-taiga-50 via-white to-taiga-100 p-6">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded bg-taiga-600 text-white">
            <svg viewBox="0 0 24 24" width={28} height={28}>
              <path
                fill="currentColor"
                d="M12 2 3 7v10l9 5 9-5V7l-9-5zm0 2.31L18.18 8 12 11.69 5.82 8 12 4.31zM5 9.69l6 3.6V20l-6-3.36V9.69zm14 6.95L13 20v-6.71l6-3.6v6.95z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-taiga-700">Taiga</h1>
          <p className="text-sm text-slate-500">A simple project management platform</p>
        </div>
        {cfg?.defaultLoginEnabled !== false && (
          <form onSubmit={onSubmit} className="space-y-4" data-testid="login-form">
            <div>
              <label className="label" htmlFor="username">Username or email</label>
              <input
                id="username"
                name="username"
                autoFocus
                autoComplete="username"
                required
                className="input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={onKeyUp}
              />
              {capslock && (
                <div className="mt-1 text-xs text-amber-600">Caps Lock is on</div>
              )}
              <Link to="/forgot-password" className="mt-2 inline-block text-xs text-taiga-700 hover:underline">
                Forgot your password?
              </Link>
            </div>
            {error && (
              <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}
            <button type="submit" className="btn-primary w-full" disabled={loading} data-testid="login-submit">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        )}
        {cfg?.publicRegisterEnabled && (
          <p className="mt-6 text-center text-sm text-slate-500">
            Need an account?{' '}
            <Link to="/register" className="text-taiga-700 hover:underline">
              Create one
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
