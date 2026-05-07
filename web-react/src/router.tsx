/**
 * Top-level React Router definitions for the migrated frontend.
 *
 * Mirrors the routes declared in `app/coffee/app.coffee` (lines 72-588).
 * Page components are wrapped in `lazy()` so each page group is split into
 * its own bundle.
 */
import { lazy, ReactNode, Suspense } from "react";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import AppShell from "./layouts/AppShell";
import AuthShell from "./layouts/AuthShell";
import { useAuth } from "./contexts/auth";
import Placeholder from "./pages/Placeholder";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("./pages/auth/ForgotPasswordPage"),
);
const ChangePasswordFromRecoveryPage = lazy(
  () => import("./pages/auth/ChangePasswordFromRecoveryPage"),
);

function PageFallback() {
  return <div className="page-loading">Loading…</div>;
}

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  if (isLoading) return <PageFallback />;
  if (!isAuthenticated) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return <>{children}</>;
}

function withSuspense(node: ReactNode) {
  return <Suspense fallback={<PageFallback />}>{node}</Suspense>;
}

function placeholder(title: string, description?: string) {
  return <Placeholder title={title} description={description} />;
}

export const router = createBrowserRouter([
  /* ----- Auth (no shell) ----- */
  {
    element: <AuthShell />,
    children: [
      { path: "login", element: withSuspense(<LoginPage />) },
      { path: "register", element: withSuspense(<RegisterPage />) },
      {
        path: "forgot-password",
        element: withSuspense(<ForgotPasswordPage />),
      },
      {
        path: "change-password/:token",
        element: withSuspense(<ChangePasswordFromRecoveryPage />),
      },
      {
        path: "invitation/:token",
        element: placeholder("Invitation", "Accept project invitation"),
      },
      {
        path: "external-apps",
        element: placeholder("External apps", "Authorize external app"),
      },
    ],
  },

  /* ----- Authenticated shell ----- */
  {
    element: <AppShell />,
    children: [
      { index: true, element: placeholder("Home") },
      { path: "discover", element: placeholder("Discover") },
      { path: "discover/search", element: placeholder("Discover Search") },
      {
        path: "projects",
        element: (
          <RequireAuth>{placeholder("Projects listing")}</RequireAuth>
        ),
      },

      /* Project creation */
      { path: "project/new", element: placeholder("Create project") },
      {
        path: "project/new/scrum",
        element: placeholder("Create project — Scrum"),
      },
      {
        path: "project/new/kanban",
        element: placeholder("Create project — Kanban"),
      },
      {
        path: "project/new/duplicate",
        element: placeholder("Duplicate project"),
      },
      {
        path: "project/new/import/:platform?",
        element: placeholder("Import project"),
      },

      /* Project pages — all under /:pslug/* */
      {
        path: "project/:pslug",
        element: <Outlet />,
        children: [
          { index: true, element: placeholder("Project router") },
          { path: "timeline", element: placeholder("Project timeline") },
          { path: "search", element: placeholder("Project search") },
          { path: "epics", element: placeholder("Epics dashboard") },
          { path: "epic/:epicref", element: placeholder("Epic detail") },
          { path: "backlog", element: placeholder("Backlog") },
          { path: "kanban", element: placeholder("Kanban") },
          { path: "taskboard/:sslug", element: placeholder("Taskboard") },
          { path: "us/:usref", element: placeholder("User story detail") },
          { path: "task/:taskref", element: placeholder("Task detail") },
          {
            path: "wiki",
            element: <Navigate to="home" replace />,
          },
          { path: "wiki-list", element: placeholder("Wiki list") },
          { path: "wiki/:slug", element: placeholder("Wiki page") },
          { path: "team", element: placeholder("Team") },
          { path: "issues", element: placeholder("Issues") },
          {
            path: "issue/:issueref",
            element: placeholder("Issue detail"),
          },
          { path: "t/:ref", element: placeholder("Reference router") },

          /* Admin */
          {
            path: "admin/project-profile/details",
            element: placeholder("Admin — Project details"),
          },
          {
            path: "admin/project-profile/default-values",
            element: placeholder("Admin — Default values"),
          },
          {
            path: "admin/project-profile/modules",
            element: placeholder("Admin — Modules"),
          },
          {
            path: "admin/project-profile/export",
            element: placeholder("Admin — Export"),
          },
          {
            path: "admin/project-profile/reports",
            element: placeholder("Admin — Reports"),
          },
          {
            path: "admin/project-values/status",
            element: placeholder("Admin — Statuses"),
          },
          {
            path: "admin/project-values/points",
            element: placeholder("Admin — Points"),
          },
          {
            path: "admin/project-values/priorities",
            element: placeholder("Admin — Priorities"),
          },
          {
            path: "admin/project-values/severities",
            element: placeholder("Admin — Severities"),
          },
          {
            path: "admin/project-values/types",
            element: placeholder("Admin — Types"),
          },
          {
            path: "admin/project-values/custom-fields",
            element: placeholder("Admin — Custom fields"),
          },
          {
            path: "admin/project-values/tags",
            element: placeholder("Admin — Tags"),
          },
          {
            path: "admin/project-values/due-dates",
            element: placeholder("Admin — Due dates"),
          },
          {
            path: "admin/project-values/kanban-power-ups",
            element: placeholder("Admin — Kanban power-ups"),
          },
          {
            path: "admin/memberships",
            element: placeholder("Admin — Memberships"),
          },
          { path: "admin/roles", element: placeholder("Admin — Roles") },
          {
            path: "admin/third-parties/webhooks",
            element: placeholder("Admin — Webhooks"),
          },
          {
            path: "admin/third-parties/github",
            element: placeholder("Admin — GitHub"),
          },
          {
            path: "admin/third-parties/gitlab",
            element: placeholder("Admin — GitLab"),
          },
          {
            path: "admin/third-parties/bitbucket",
            element: placeholder("Admin — Bitbucket"),
          },
          {
            path: "admin/third-parties/gogs",
            element: placeholder("Admin — Gogs"),
          },
          {
            path: "admin/contrib/:plugin",
            element: placeholder("Admin — Contrib plugin"),
          },
          { path: "transfer/:token", element: placeholder("Transfer project") },
        ],
      },

      /* User settings */
      {
        path: "user-settings/user-profile",
        element: placeholder("User profile"),
      },
      {
        path: "user-settings/user-change-password",
        element: placeholder("Change password"),
      },
      {
        path: "user-settings/user-project-settings",
        element: placeholder("User project settings"),
      },
      {
        path: "user-settings/mail-notifications",
        element: placeholder("Mail notifications"),
      },
      {
        path: "user-settings/live-notifications",
        element: placeholder("Live notifications"),
      },
      {
        path: "user-settings/web-notifications",
        element: placeholder("Web notifications"),
      },
      {
        path: "user-settings/contrib/:plugin",
        element: placeholder("User settings — Contrib plugin"),
      },
      {
        path: "change-email/:email_token",
        element: placeholder("Change email"),
      },
      {
        path: "verify-email/:email_token",
        element: placeholder("Verify email"),
      },
      {
        path: "cancel-account/:cancel_token",
        element: placeholder("Cancel account"),
      },

      /* Profile / notifications */
      {
        path: "profile",
        element: <RequireAuth>{placeholder("My profile")}</RequireAuth>,
      },
      { path: "profile/:slug", element: placeholder("User profile") },
      {
        path: "notifications",
        element: <RequireAuth>{placeholder("Notifications")}</RequireAuth>,
      },

      /* Errors */
      {
        path: "blocked-project/:pslug",
        element: placeholder("Blocked project"),
      },
      { path: "error", element: placeholder("Error") },
      { path: "permission-denied", element: placeholder("Permission denied") },
      { path: "not-found", element: placeholder("Not found") },
      { path: "*", element: placeholder("Not found") },
    ],
  },
]);

export default router;
