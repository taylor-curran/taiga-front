import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link, Navigate } from 'react-router-dom';
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
    return <Navigate to={next} replace />;
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
          <svg width="90" height="90" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Crown base */}
            <rect x="40" y="130" width="120" height="24" rx="6" fill="url(#crownGrad)" />
            <rect x="44" y="134" width="112" height="16" rx="4" fill="none" stroke="#FFD700" strokeWidth="1" opacity="0.4" />
            {/* Crown body */}
            <path d="M40 130 L30 70 L65 100 L100 50 L135 100 L170 70 L160 130 Z" fill="url(#crownGrad)" />
            {/* Inner detail lines */}
            <path d="M50 125 L42 82 L65 100" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.5" />
            <path d="M150 125 L158 82 L135 100" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.5" />
            {/* Jewels */}
            <circle cx="100" cy="58" r="7" fill="#FFD700" />
            <circle cx="100" cy="58" r="4" fill="#FFF3B0" opacity="0.8" />
            <circle cx="65" cy="105" r="5" fill="#FF6EB4" />
            <circle cx="65" cy="105" r="2.5" fill="#FFB6C1" opacity="0.7" />
            <circle cx="135" cy="105" r="5" fill="#FF6EB4" />
            <circle cx="135" cy="105" r="2.5" fill="#FFB6C1" opacity="0.7" />
            <circle cx="35" cy="75" r="4" fill="#E91E8C" />
            <circle cx="165" cy="75" r="4" fill="#E91E8C" />
            {/* Band jewels */}
            <circle cx="70" cy="142" r="4" fill="#FFD700" opacity="0.7" />
            <circle cx="100" cy="142" r="5" fill="#FF6EB4" />
            <circle cx="130" cy="142" r="4" fill="#FFD700" opacity="0.7" />
            {/* Sparkle accents */}
            <path d="M45 55 L47 48 L55 50 L47 52 Z" fill="#FFD700" opacity="0.6" />
            <path d="M155 55 L157 48 L165 50 L157 52 Z" fill="#FFD700" opacity="0.6" />
            <path d="M95 30 L97 23 L105 25 L97 27 Z" fill="#FFD700" opacity="0.5" />
            <defs>
              <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6EB4" />
                <stop offset="50%" stopColor="#E91E8C" />
                <stop offset="100%" stopColor="#D63384" />
              </linearGradient>
            </defs>
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
