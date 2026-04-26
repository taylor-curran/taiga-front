import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router';
import { AuthGuard } from '@/components/AuthGuard';
import { ProjectAdminPermissionGate } from '@/components/ProjectAdminPermissionGate';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingScreen } from '@/components/LoadingScreen';
import ProjectAdminLayout from '@/layouts/ProjectAdminLayout';
import UserSettingsLayout from '@/layouts/UserSettingsLayout';
import ShellLayout from '@/layouts/ShellLayout';
import {
    globalAuthProfileRoutes,
    projectAdminRoutes,
    userSettingsRoutes,
} from '@/routes/adminRoutePaths';
import { AuthPageRouter } from '@/routes/AuthPageRouter';
import type { AdminPathDef } from '@/routes/adminRoutePaths';

const PlaceholderPage = lazy(() => import('@/pages/PlaceholderPage'));

function Page({ def, pageGroup }: { def: AdminPathDef; pageGroup: string }) {
    return (
        <Suspense fallback={<LoadingScreen />}>
            <PlaceholderPage def={def} pageGroup={pageGroup} />
        </Suspense>
    );
}

const projectChildren = projectAdminRoutes.map((d) => ({
    path: d.pattern,
    element: <Page def={d} pageGroup="Project administration" />,
}));

const userSettingsChildren = userSettingsRoutes.map((d) => ({
    path: d.pattern,
    element: <Page def={d} pageGroup="User settings" />,
}));

const withGuardedShell = (d: AdminPathDef) => ({
    path: d.pattern,
    element: (
        <AuthGuard>
            <ShellLayout />
        </AuthGuard>
    ),
    children: [{ index: true, element: <Page def={d} pageGroup="Account & profile" /> }],
});

const tokenPatterns = new Set([
    'login',
    'register',
    'forgot-password',
    'change-password/:token',
    'invitation/:token',
    'change-email/:email_token',
    'verify-email/:email_token',
    'cancel-account/:cancel_token',
]);

const shellGuardedRoutes = globalAuthProfileRoutes
    .filter((d) => !tokenPatterns.has(d.pattern))
    .map((d) => withGuardedShell(d));

const authPathPatterns = [
    'login',
    'register',
    'forgot-password',
    'change-password/:token',
    'invitation/:token',
    'change-email/:email_token',
    'verify-email/:email_token',
    'cancel-account/:cancel_token',
];

function NotFound() {
    return (
        <div className="app-shell" style={{ padding: '2rem' }} data-testid="not-found">
            <h1>Not found</h1>
            <p>The page you requested does not exist in this app.</p>
        </div>
    );
}

export const adminRouter = createBrowserRouter(
    [
        {
            path: '/',
            element: <Navigate to="/project/scrum/admin/project-profile/details" replace />,
        },
        ...authPathPatterns.map((pattern) => ({
            path: pattern,
            element: <AuthPageRouter />,
        })),
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
                        <ProjectAdminPermissionGate>
                            <ProjectAdminLayout />
                        </ProjectAdminPermissionGate>
                    </ErrorBoundary>
                </AuthGuard>
            ),
            children: projectChildren,
        },
        { path: '/not-found', element: <NotFound /> },
        { path: '*', element: <Navigate to="/not-found" replace /> },
    ],
    { basename: import.meta.env.BASE_URL },
);
