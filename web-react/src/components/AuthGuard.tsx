import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useSessionStore } from '../store/sessionStore';

/**
 * Skeleton guard: mirrors Angular access.requiresLogin wiring later.
 * Does not perform network auth yet.
 */
export function AuthGuard({ children }: { children: ReactNode }) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
