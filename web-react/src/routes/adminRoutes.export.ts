import { projectAdminRoutes, userSettingsRoutes, globalAuthProfileRoutes } from './adminRoutePaths';

const adminRelatedPaths: string[] = [
  '/',
  '/projects',
  ...projectAdminRoutes.map((r) => `/project/:pslug/${r.pattern}`),
  ...userSettingsRoutes.map((r) => `/user-settings/${r.pattern}`),
  ...globalAuthProfileRoutes.map((r) => `/${r.pattern}`),
];

export { adminRelatedPaths, projectAdminRoutes, userSettingsRoutes, globalAuthProfileRoutes };
