import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface RequirePermissionProps {
  permission?: string;
  permissions?: string[];
  mode?: 'any' | 'all';
  adminOverride?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
}

export function RequirePermission({
  permission,
  permissions,
  mode = 'any',
  adminOverride = true,
  fallback = null,
  children,
}: RequirePermissionProps) {
  const { checkAny, checkAll, isAdmin } = usePermissions();

  if (adminOverride && isAdmin) return <>{children}</>;

  const perms = permissions ?? (permission ? [permission] : []);
  if (perms.length === 0) return <>{children}</>;

  const allowed = mode === 'all' ? checkAll(...perms) : checkAny(...perms);
  return allowed ? <>{children}</> : <>{fallback}</>;
}
