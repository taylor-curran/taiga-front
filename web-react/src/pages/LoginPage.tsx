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
          <svg width="80" height="80" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="100,20 120,60 100,50 80,60" fill="#a5d6a7" opacity="0.8"/>
            <polygon points="100,50 130,70 100,100 70,70" fill="#4db6ac" opacity="0.7"/>
            <polygon points="100,50 70,70 50,50 80,60" fill="#c5e1a5" opacity="0.7"/>
            <polygon points="100,50 130,70 150,50 120,60" fill="#80cbc4" opacity="0.6"/>
            <polygon points="70,70 50,100 100,100" fill="#ce93d8" opacity="0.5"/>
            <polygon points="130,70 150,100 100,100" fill="#9575cd" opacity="0.5"/>
            <polygon points="100,100 50,100 70,130 100,120" fill="#78909c" opacity="0.6"/>
            <polygon points="100,100 150,100 130,130 100,120" fill="#90a4ae" opacity="0.5"/>
            <polygon points="100,120 70,130 80,150 100,140" fill="#b39ddb" opacity="0.5"/>
            <polygon points="100,120 130,130 120,150 100,140" fill="#a1887f" opacity="0.4"/>
          </svg>
          <h1>Taiga</h1>
        </div>
        <p className="auth-tagline">Love your project</p>
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
              placeholder="Username or email (case sensitive)"
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
              placeholder="Password (case sensitive)"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Login'}
          </button>
          <div className="auth-links">
            <Link to="/forgot-password">Forgot your password?</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
