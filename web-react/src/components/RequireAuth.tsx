import { type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/auth/store';

export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useAuth((s) => s.user);
  const hydrated = useAuth((s) => s.hydrated);
  const location = useLocation();
  if (!hydrated) return null;
  if (!user) {
    const next = location.pathname + location.search;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }
  return <>{children}</>;
}
