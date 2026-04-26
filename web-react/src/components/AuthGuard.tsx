import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAppStore } from '@/stores/appStore';
type Props = { children: ReactNode };

/**
 * Skeleton guard — no token checks yet. Toggles with `isAuthenticated` in the store for tests.
 */
export function AuthGuard({ children }: Props) {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
