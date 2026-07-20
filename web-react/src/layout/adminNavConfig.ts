export type NavItem = { id: string; to: string; label: string };

export type AdminPrimarySection =
  | 'project-profile'
  | 'project-values'
  | 'memberships'
  | 'roles'
  | 'third-parties'
  | 'contrib';

export function primarySectionFromPath(pathname: string): AdminPrimarySection {
  if (pathname.includes('/admin/contrib/')) return 'contrib';
  if (pathname.includes('/admin/third-parties')) return 'third-parties';
  if (pathname.includes('/admin/project-values')) return 'project-values';
  if (pathname.includes('/admin/project-profile')) return 'project-profile';
  if (pathname.includes('/admin/memberships')) return 'memberships';
  if (pathname.includes('/admin/roles')) return 'roles';
  return 'project-profile';
}

export function primaryNav(projectSlug: string): NavItem[] {
  const p = encodeURIComponent(projectSlug);
  const base = `/project/${p}/admin`;
  return [
    { id: 'adminmenu-project-profile', to: `${base}/project-profile/details`, label: 'Project' },
    { id: 'adminmenu-project-values', to: `${base}/project-values/status`, label: 'Attributes' },
    { id: 'adminmenu-memberships', to: `${base}/memberships`, label: 'Members' },
    { id: 'adminmenu-roles', to: `${base}/roles`, label: 'Permissions' },
    { id: 'adminmenu-third-parties', to: `${base}/third-parties/webhooks`, label: 'Integrations' },
    {
      id: 'adminmenu-contrib',
      to: `${base}/contrib/sample-plugin`,
      label: 'Plugins',
    },
  ];
}

function tertiaryForSection(projectSlug: string, section: AdminPrimarySection): NavItem[] {
  const p = encodeURIComponent(projectSlug);
  const base = `/project/${p}/admin`;
  switch (section) {
    case 'project-profile':
      return [
        {
          id: 'adminmenu-details',
          to: `${base}/project-profile/details`,
          label: 'Project details',
        },
        {
          id: 'adminmenu-default-values',
          to: `${base}/project-profile/default-values`,
          label: 'Default values',
        },
        {
          id: 'adminmenu-modules',
          to: `${base}/project-profile/modules`,
          label: 'Modules',
        },
        { id: 'adminmenu-export', to: `${base}/project-profile/export`, label: 'Export' },
        { id: 'adminmenu-reports', to: `${base}/project-profile/reports`, label: 'Reports' },
      ];
    case 'project-values':
      return [
        { id: 'adminmenu-values-status', to: `${base}/project-values/status`, label: 'Status' },
        { id: 'adminmenu-values-points', to: `${base}/project-values/points`, label: 'Points' },
        {
          id: 'adminmenu-values-priorities',
          to: `${base}/project-values/priorities`,
          label: 'Priorities',
        },
        {
          id: 'adminmenu-values-severities',
          to: `${base}/project-values/severities`,
          label: 'Severities',
        },
        { id: 'adminmenu-values-types', to: `${base}/project-values/types`, label: 'Types' },
        {
          id: 'adminmenu-values-custom-fields',
          to: `${base}/project-values/custom-fields`,
          label: 'Custom fields',
        },
        { id: 'adminmenu-values-tags', to: `${base}/project-values/tags`, label: 'Tags' },
        {
          id: 'adminmenu-values-due-dates',
          to: `${base}/project-values/due-dates`,
          label: 'Due dates',
        },
        {
          id: 'adminmenu-values-kanban-power-ups',
          to: `${base}/project-values/kanban-power-ups`,
          label: 'Kanban options',
        },
      ];
    case 'third-parties':
      return [
        {
          id: 'adminmenu-third-parties-webhooks',
          to: `${base}/third-parties/webhooks`,
          label: 'Webhooks',
        },
        { id: 'adminmenu-third-parties-github', to: `${base}/third-parties/github`, label: 'GitHub' },
        { id: 'adminmenu-third-parties-gitlab', to: `${base}/third-parties/gitlab`, label: 'GitLab' },
        {
          id: 'adminmenu-third-parties-bitbucket',
          to: `${base}/third-parties/bitbucket`,
          label: 'Bitbucket',
        },
        { id: 'adminmenu-third-parties-gogs', to: `${base}/third-parties/gogs`, label: 'Gogs' },
      ];
    case 'memberships':
    case 'roles':
    case 'contrib':
      return [];
    default:
      return [];
  }
}

export function tertiaryNav(projectSlug: string, pathname: string): NavItem[] {
  return tertiaryForSection(projectSlug, primarySectionFromPath(pathname));
}
