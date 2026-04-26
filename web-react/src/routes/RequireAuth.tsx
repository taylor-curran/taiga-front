import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';

export function RequireAuth() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();

  if (!hydrated) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'system-ui' }} role="status">
        Loading…
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(`${location.pathname}${location.search}`);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <Outlet />;
}
