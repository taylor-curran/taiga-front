import { useContext } from 'react';
import { ProjectContext } from './useCurrentProject';

export function usePermissions() {
  const project = useContext(ProjectContext);
  const myPermissions = project?.my_permissions ?? [];

  function check(permission: string): boolean {
    return myPermissions.includes(permission);
  }

  function checkAny(...permissions: string[]): boolean {
    return permissions.some((p) => myPermissions.includes(p));
  }

  function checkAll(...permissions: string[]): boolean {
    return permissions.every((p) => myPermissions.includes(p));
  }

  const isAdmin = project?.i_am_admin ?? project?.is_admin ?? false;
  const isOwner = project?.i_am_owner ?? false;
  const isMember = project?.i_am_member ?? false;

  return { check, checkAny, checkAll, isAdmin, isOwner, isMember, myPermissions };
}
