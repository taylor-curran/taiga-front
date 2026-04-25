import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { auth } from '../api/resources';
import { useAuthStore } from '../stores/auth';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setUser, isAuthenticated } = useAuthStore();

  if (isAuthenticated() && !searchParams.get('force_login')) {
    const next = searchParams.get('next') || '/';
    navigate(next, { replace: true });
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.login(username, password);
      setUser(res.data);
      const next = searchParams.get('next') || '/';
      navigate(next, { replace: true });
    } catch {
      setError('Login error: username or password is incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-logo">
          <svg width="48" height="48" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="6" fill="#4c566a" />
            <text x="14" y="20" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">T</text>
          </svg>
          <h1>Taiga</h1>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Sign in</h2>
          {error && <div className="auth-error">{error}</div>}
          {searchParams.get('unauthorized') && (
            <div className="auth-error">Your session has expired. Please sign in again.</div>
          )}
          <div className="form-field">
            <label htmlFor="username">Username or email</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoFocus
              required
              autoComplete="username"
            />
          </div>
          <div className="form-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
