/**
 * Admin + auth-related paths mirrored from `app/coffee/app.coffee` and `app/coffee/modules/base.coffee` (url map).
 * Base path: `/project/:pslug/...` for all project admin screens.
 */
export const DEMO_PROJECT_SLUG = 'scrum' as const;

export type AdminPathDef = {
  /** Path pattern for React Router (param names match react-router) */
  pattern: string;
  featureLabel: string;
  /** One-line description for the placeholder card */
  description: string;
};

/** Routes under /project/:pslug/... (admin) */
export const projectAdminRoutes: AdminPathDef[] = [
  {
    pattern: 'admin/project-profile/details',
    featureLabel: 'Project details (profile)',
    description: 'Project name, description, and core settings (admin / project profile).',
  },
  {
    pattern: 'admin/project-profile/default-values',
    featureLabel: 'Default values',
    description: 'Default US/task/issue values for the project.',
  },
  {
    pattern: 'admin/project-profile/modules',
    featureLabel: 'Modules',
    description: 'Enable or disable project modules (scrum, issues, wiki, etc.).',
  },
  {
    pattern: 'admin/project-profile/export',
    featureLabel: 'Export & reports (CSV block)',
    description: 'Project CSV export and related export UI.',
  },
  {
    pattern: 'admin/project-profile/reports',
    featureLabel: 'Reports',
    description: 'Project reports section.',
  },
  {
    pattern: 'admin/project-values/status',
    featureLabel: 'Status values',
    description: 'Custom statuses (admin / project values).',
  },
  {
    pattern: 'admin/project-values/points',
    featureLabel: 'Points',
    description: 'Story point scales.',
  },
  {
    pattern: 'admin/project-values/priorities',
    featureLabel: 'Priorities',
    description: 'Issue/story priority values.',
  },
  {
    pattern: 'admin/project-values/severities',
    featureLabel: 'Severities',
    description: 'Issue severity values.',
  },
  {
    pattern: 'admin/project-values/types',
    featureLabel: 'Types',
    description: 'Issue types and related configuration.',
  },
  {
    pattern: 'admin/project-values/custom-fields',
    featureLabel: 'Custom fields',
    description: 'Custom fields for the project.',
  },
  {
    pattern: 'admin/project-values/tags',
    featureLabel: 'Tags',
    description: 'Project tag management.',
  },
  {
    pattern: 'admin/project-values/due-dates',
    featureLabel: 'Due dates',
    description: 'Due date and related value configuration.',
  },
  {
    pattern: 'admin/project-values/kanban-power-ups',
    featureLabel: 'Kanban power-ups',
    description: 'Kanban-specific power-ups and swimlanes (where applicable).',
  },
  {
    pattern: 'admin/memberships',
    featureLabel: 'Members',
    description: 'Project memberships and roles assignment.',
  },
  {
    pattern: 'admin/roles',
    featureLabel: 'Roles & permissions',
    description: 'Custom roles and computed permissions (admin / roles).',
  },
  {
    pattern: 'admin/third-parties/webhooks',
    featureLabel: 'Webhooks (integrations)',
    description: 'Outgoing webhooks configuration.',
  },
  {
    pattern: 'admin/third-parties/github',
    featureLabel: 'GitHub integration',
    description: 'GitHub third-party integration settings.',
  },
  {
    pattern: 'admin/third-parties/gitlab',
    featureLabel: 'GitLab integration',
    description: 'GitLab third-party integration settings.',
  },
  {
    pattern: 'admin/third-parties/bitbucket',
    featureLabel: 'Bitbucket integration',
    description: 'Bitbucket third-party integration settings.',
  },
  {
    pattern: 'admin/third-parties/gogs',
    featureLabel: 'Gogs integration',
    description: 'Gogs third-party integration settings.',
  },
  {
    pattern: 'admin/contrib/:plugin',
    featureLabel: 'Contrib admin plugin',
    description: 'Admin contrib plugin host page (`contrib/main.html` in the reference).',
  },
];

/** User settings (reference: parent URL `/user-settings`, children match app.coffee) */
export const userSettingsRoutes: AdminPathDef[] = [
  {
    pattern: 'user-profile',
    featureLabel: 'User profile (settings)',
    description: 'Edit profile from user settings.',
  },
  {
    pattern: 'user-change-password',
    featureLabel: 'Change password (settings)',
    description: 'Change account password from settings.',
  },
  {
    pattern: 'user-project-settings',
    featureLabel: 'Project settings (per-user)',
    description: 'Per-user project notification/settings matrix.',
  },
  {
    pattern: 'mail-notifications',
    featureLabel: 'Mail notifications',
    description: 'Email notification preferences.',
  },
  {
    pattern: 'live-notifications',
    featureLabel: 'Live notifications',
    description: 'Live notification preferences.',
  },
  {
    pattern: 'web-notifications',
    featureLabel: 'Web notifications',
    description: 'Web notification preferences.',
  },
  {
    pattern: 'contrib/:plugin',
    featureLabel: 'Contrib (user settings)',
    description: 'Contrib plugin pages under user settings.',
  },
];

/** Global auth and profile (needed to reach admin in real app) */
export const globalAuthProfileRoutes: AdminPathDef[] = [
  { pattern: 'login', featureLabel: 'Login', description: 'Sign in to Taiga (reference: auth/login.html).' },
  { pattern: 'register', featureLabel: 'Register', description: 'Self-register when enabled in conf.' },
  { pattern: 'forgot-password', featureLabel: 'Forgot password', description: 'Request password recovery email.' },
  { pattern: 'change-password/:token', featureLabel: 'Change password (token)', description: 'Set password from recovery token.' },
  { pattern: 'invitation/:token', featureLabel: 'Invitation', description: 'Accept a project invitation.' },
  { pattern: 'change-email/:email_token', featureLabel: 'Change email (token)', description: 'Confirm email change (route in app.coffee).' },
  { pattern: 'verify-email/:email_token', featureLabel: 'Verify email', description: 'Verify email address (route in app.coffee).' },
  { pattern: 'cancel-account/:cancel_token', featureLabel: 'Cancel account (token)', description: 'Cancel account flow (route in app.coffee).' },
  { pattern: 'profile', featureLabel: 'My profile (global)', description: 'Current user public profile (requires login in reference).' },
  { pattern: 'profile/:slug', featureLabel: 'Public user profile', description: 'Profile page for a username/slug.' },
  { pattern: 'notifications', featureLabel: 'Notifications', description: 'In-app notifications (requires login).' },
];

export function buildProjectPath(pattern: string) {
  return `/project/${DEMO_PROJECT_SLUG}/${pattern}`;
}
