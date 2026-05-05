import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { ErrorBox } from '@/components/common/ErrorBox';
import { SocialLoginButtons, verifyOAuthState } from '@/components/common/SocialLoginButtons';

export function LoginPage() {
  const login = useAuth((s) => s.login);
  const loginWith = useAuth((s) => s.loginWith);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Handle OAuth callback (GitHub/GitLab redirect with ?code=...)
  const code = params.get('code');
  const state = params.get('state');
  useEffect(() => {
    if (!code) return;
    const { valid, invitationToken, next: stateNext } = verifyOAuthState(state);
    if (!valid) {
      setError('OAuth state verification failed. Please try again.');
      return;
    }
    const provider = params.get('provider') || 'github';
    setSubmitting(true);
    loginWith({
      type: provider as 'github' | 'gitlab',
      code,
      invitation_token: invitationToken,
    })
      .then(() => {
        const next = stateNext || params.get('next');
        navigate(next || '/', { replace: true });
      })
      .catch(() => {
        setError('Social login failed. Please try again.');
        setSubmitting(false);
      });
  }, [code]); // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(username, password);
      const next = params.get('next');
      navigate(next ? decodeURIComponent(next) : '/', { replace: true });
    } catch (err) {
      const detail =
        (err as { response?: { data?: { _error_message?: string } } })?.response?.data
          ?._error_message || 'Invalid username or password.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Sign in</h1>
      {error && <div className="mb-4"><ErrorBox message={error} /></div>}
      <form onSubmit={onSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Username or email</span>
          <input
            className="input"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
          />
        </label>
        <label className="block">
          <span className="block text-sm font-medium mb-1">Password</span>
          <input
            className="input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        <button className="btn-primary w-full" type="submit" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
      <SocialLoginButtons />
      <div className="mt-6 flex justify-between text-sm">
        <Link to="/forgot-password">Forgot password?</Link>
        <Link to="/register">Create an account</Link>
      </div>
    </>
  );
}
