import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { auth } from '../api/resources';
import { useAuthStore } from '../stores/auth';
import TaigaLogo from '../components/common/TaigaLogo';

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
    <div className="wrapper">
      <div className="auth">
        <div className="auth-container">
          <div className="logo-svg">
            <TaigaLogo size={96} />
          </div>
          <h1 className="logo">Taiga</h1>
          <h2 className="tagline">LOVE YOUR PROJECT</h2>

          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              {error && <div className="auth-error">{error}</div>}
              {searchParams.get('unauthorized') && (
                <div className="auth-error">Your session has expired. Please sign in again.</div>
              )}
              <fieldset>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoCorrect="off"
                  autoCapitalize="none"
                  autoFocus
                  required
                  placeholder="Username or email (case sensitive)"
                />
              </fieldset>
              <fieldset className="login-password">
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Password (case sensitive)"
                />
                <Link
                  to="/forgot-password"
                  className="forgot-pass"
                  title="Did you forget your password?"
                >
                  Forgot it?
                </Link>
              </fieldset>
              <fieldset className="end">
                <button
                  type="submit"
                  className="btn-small full"
                  title="Login"
                  disabled={loading}
                >
                  {loading ? 'Logging in...' : 'Login'}
                </button>
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
