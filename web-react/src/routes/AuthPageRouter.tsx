import { lazy, Suspense, type ReactNode } from 'react';
import { useLocation, matchPath } from 'react-router';
import { LoadingScreen } from '@/components/LoadingScreen';

const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const ChangePasswordFromRecoveryPage = lazy(
    () => import('@/pages/auth/ChangePasswordFromRecoveryPage'),
);
const InvitationPage = lazy(() => import('@/pages/auth/InvitationPage'));
const ChangeEmailTokenPage = lazy(() => import('@/pages/auth/ChangeEmailTokenPage'));
const VerifyEmailPage = lazy(() => import('@/pages/auth/VerifyEmailPage'));
const CancelAccountPage = lazy(() => import('@/pages/auth/CancelAccountPage'));

/**
 * Picks the auth / token static page to render from the current path (replaces per-route lazy map in the router object).
 */
export function AuthPageRouter() {
    const { pathname } = useLocation();

    let page: ReactNode;
    if (matchPath({ path: '/login', end: true }, pathname)) {
        page = <LoginPage />;
    } else if (matchPath({ path: '/register', end: true }, pathname)) {
        page = <RegisterPage />;
    } else if (matchPath({ path: '/forgot-password', end: true }, pathname)) {
        page = <ForgotPasswordPage />;
    } else if (matchPath({ path: '/change-password/:token', end: true }, pathname)) {
        page = <ChangePasswordFromRecoveryPage />;
    } else if (matchPath({ path: '/invitation/:token', end: true }, pathname)) {
        page = <InvitationPage />;
    } else if (matchPath({ path: '/change-email/:email_token', end: true }, pathname)) {
        page = <ChangeEmailTokenPage />;
    } else if (matchPath({ path: '/verify-email/:email_token', end: true }, pathname)) {
        page = <VerifyEmailPage />;
    } else if (matchPath({ path: '/cancel-account/:cancel_token', end: true }, pathname)) {
        page = <CancelAccountPage />;
    } else {
        page = <p className="auth-missing">Unknown auth route</p>;
    }

    return (
        <div className="auth-layout--fullscreen" data-testid="auth-page-fullscreen">
            <Suspense fallback={<LoadingScreen />}>{page}</Suspense>
        </div>
    );
}
