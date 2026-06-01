// Route guard component — redirects to /login when unauthenticated
// Mirrors the `access.requiresLogin` pattern from the legacy routes

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ next: location.pathname }} replace />;
  }

  return <>{children}</>;
}
