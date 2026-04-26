import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { AuthGuard } from '@/components/AuthGuard';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import ProjectAdminLayout from '@/layouts/ProjectAdminLayout';
import UserSettingsLayout from '@/layouts/UserSettingsLayout';
import AuthLayout from '@/layouts/AuthLayout';
import ShellLayout from '@/layouts/ShellLayout';
import { globalAuthProfileRoutes, projectAdminRoutes, userSettingsRoutes } from '@/routes/adminRoutePaths';
import type { AdminPathDef } from '@/routes/adminRoutePaths';

const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'));
const HomeDashboardPage = lazy(() => import('@/pages/listing/HomeDashboardPage'));
const ProjectsListingPage = lazy(() => import('@/pages/listing/ProjectsListingPage'));
const AdminMembershipsPage = lazy(() => import('@/pages/listing/AdminMembershipsPage'));
const AdminRolesPage = lazy(() => import('@/pages/listing/AdminRolesPage'));

function Page({ def, pageGroup }: { def: AdminPathDef; pageGroup: string }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <PlaceholderPage def={def} pageGroup={pageGroup} />
    </Suspense>
  );
}

function ProjectAdminElement({ def }: { def: AdminPathDef }) {
  if (def.pattern === 'admin/memberships') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AdminMembershipsPage />
      </Suspense>
    );
  }
  if (def.pattern === 'admin/roles') {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AdminRolesPage />
      </Suspense>
    );
  }
  return <Page def={def} pageGroup="Project administration" />;
}

const projectChildren = projectAdminRoutes.map((d) => ({
  path: d.pattern,
  element: <ProjectAdminElement def={d} />,
}));

const userSettingsChildren = userSettingsRoutes.map((d) => ({
  path: d.pattern,
  element: <Page def={d} pageGroup="User settings" />,
}));

const authDef = (p: string) => globalAuthProfileRoutes.find((d) => d.pattern === p)!;
const withAuth = (d: AdminPathDef) => ({
  path: d.pattern,
  element: <AuthLayout />,
  children: [{ index: true, element: <Page def={d} pageGroup="Authentication" /> }],
});
const withGuardedShell = (d: AdminPathDef) => ({
  path: d.pattern,
  element: (
    <AuthGuard>
      <ShellLayout />
    </AuthGuard>
  ),
  children: [{ index: true, element: <Page def={d} pageGroup="Account & profile" /> }],
});

const authLayoutRoutes = [
  'login',
  'register',
  'forgot-password',
  'change-password/:token',
  'invitation/:token',
  'change-email/:email_token',
  'verify-email/:email_token',
  'cancel-account/:cancel_token',
].map((p) => withAuth(authDef(p)));

const remainingPatterns = new Set(
  [
    'login',
    'register',
    'forgot-password',
    'change-password/:token',
    'invitation/:token',
    'change-email/:email_token',
    'verify-email/:email_token',
    'cancel-account/:cancel_token',
  ],
);
const shellGuardedRoutes = globalAuthProfileRoutes
  .filter((d) => !remainingPatterns.has(d.pattern))
  .map((d) => withGuardedShell(d));

export const adminRouter = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <AuthGuard>
          <ShellLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingScreen />}>
              <HomeDashboardPage />
            </Suspense>
          ),
        },
      ],
    },
    {
      path: '/projects',
      element: (
        <AuthGuard>
          <ShellLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: (
            <Suspense fallback={<LoadingScreen />}>
              <ProjectsListingPage />
            </Suspense>
          ),
        },
      ],
    },
    ...authLayoutRoutes,
    ...shellGuardedRoutes,
    {
      path: '/user-settings',
      element: (
        <AuthGuard>
          <UserSettingsLayout />
        </AuthGuard>
      ),
      children: userSettingsChildren,
    },
    {
      path: '/project/:pslug',
      element: (
        <AuthGuard>
          <ErrorBoundary>
            <ProjectAdminLayout />
          </ErrorBoundary>
        </AuthGuard>
      ),
      children: projectChildren,
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
