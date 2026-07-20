import { Link } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { en } from '../i18n/en';

export function HomePlaceholder() {
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);

  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Taiga (React port)</h1>
      <p>Dashboard placeholder — auth slice only.</p>
      {user ? (
        <p>
          Signed in as <strong>{user.username}</strong>.{' '}
          <button type="button" onClick={() => clearSession()}>
            {en.common.logout}
          </button>{' '}
          <Link to="/login">Login page</Link>
        </p>
      ) : (
        <p>
          <Link to="/login">Sign in</Link>
        </p>
      )}
    </div>
  );
}
