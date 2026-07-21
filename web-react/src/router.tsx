import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { getConfig } from "./config";

import AuthGuard from "./auth/AuthGuard";
import AppLayout from "./layouts/AppLayout";

// Public pages
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import InvitationPage from "./pages/InvitationPage";
import ExternalAppsPage from "./pages/ExternalAppsPage";
import ErrorPage from "./pages/ErrorPage";
import NotFoundPage from "./pages/NotFoundPage";
import PermissionDeniedPage from "./pages/PermissionDeniedPage";
import BlockedProjectPage from "./pages/BlockedProjectPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ChangeEmailPage from "./pages/ChangeEmailPage";
import CancelAccountPage from "./pages/CancelAccountPage";

// Authenticated pages
import HomePage from "./pages/HomePage";
import DiscoverPage from "./pages/DiscoverPage";
import DiscoverSearchPage from "./pages/DiscoverSearchPage";
import ProjectsListingPage from "./pages/ProjectsListingPage";
import CreateProjectPage from "./pages/CreateProjectPage";
import CreateProjectScrumPage from "./pages/CreateProjectScrumPage";
import CreateProjectKanbanPage from "./pages/CreateProjectKanbanPage";
import DuplicateProjectPage from "./pages/DuplicateProjectPage";
import ImportProjectPage from "./pages/ImportProjectPage";
import ProjectRouterPage from "./pages/ProjectRouterPage";
import ProjectTimelinePage from "./pages/ProjectTimelinePage";
import DetailRedirectPage from "./pages/DetailRedirectPage";
import SearchPage from "./pages/SearchPage";
import EpicsDashboardPage from "./pages/EpicsDashboardPage";
import EpicDetailPage from "./pages/EpicDetailPage";
import BacklogPage from "./pages/BacklogPage";
import KanbanPage from "./pages/KanbanPage";
import TaskboardPage from "./pages/TaskboardPage";
import UserStoryDetailPage from "./pages/UserStoryDetailPage";
import TaskDetailPage from "./pages/TaskDetailPage";
import WikiRedirectPage from "./pages/WikiRedirectPage";
import WikiListPage from "./pages/WikiListPage";
import WikiPage from "./pages/WikiPage";
import TeamPage from "./pages/TeamPage";
import IssuesPage from "./pages/IssuesPage";
import IssueDetailPage from "./pages/IssueDetailPage";
import AdminPage from "./pages/AdminPage";
import TransferProjectPage from "./pages/TransferProjectPage";
import UserSettingsPage from "./pages/UserSettingsPage";
import ProfilePage from "./pages/ProfilePage";
import NotificationsPage from "./pages/NotificationsPage";

export function buildRouter() {
  const config = getConfig();

  const publicRoutes: RouteObject[] = [
    { path: "/login", element: <LoginPage /> },
    { path: "/forgot-password", element: <ForgotPasswordPage /> },
    { path: "/change-password/:token", element: <ChangePasswordPage /> },
    { path: "/invitation/:token", element: <InvitationPage /> },
    { path: "/external-apps", element: <ExternalAppsPage /> },
    { path: "/error", element: <ErrorPage /> },
    { path: "/not-found", element: <NotFoundPage /> },
    { path: "/permission-denied", element: <PermissionDeniedPage /> },
    { path: "/blocked-project/:pslug", element: <BlockedProjectPage /> },
    { path: "/verify-email/:email_token", element: <VerifyEmailPage /> },
    { path: "/change-email/:email_token", element: <ChangeEmailPage /> },
    { path: "/cancel-account/:cancel_token", element: <CancelAccountPage /> },
  ];

  if (config.publicRegisterEnabled) {
    publicRoutes.push({ path: "/register", element: <RegisterPage /> });
  }

  const authenticatedRoutes: RouteObject[] = [
    {
      element: <AuthGuard />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true, element: <HomePage /> },
            { path: "discover", element: <DiscoverPage /> },
            { path: "discover/search", element: <DiscoverSearchPage /> },
            { path: "projects", element: <ProjectsListingPage /> },
            { path: "project/new", element: <CreateProjectPage /> },
            { path: "project/new/scrum", element: <CreateProjectScrumPage /> },
            { path: "project/new/kanban", element: <CreateProjectKanbanPage /> },
            { path: "project/new/duplicate", element: <DuplicateProjectPage /> },
            { path: "project/new/import/:platform?", element: <ImportProjectPage /> },
            { path: "project/:pslug", element: <ProjectRouterPage /> },
            { path: "project/:pslug/timeline", element: <ProjectTimelinePage /> },
            { path: "project/:pslug/t/:ref", element: <DetailRedirectPage /> },
            { path: "project/:pslug/search", element: <SearchPage /> },
            { path: "project/:pslug/epics", element: <EpicsDashboardPage /> },
            { path: "project/:pslug/epic/:epicref", element: <EpicDetailPage /> },
            { path: "project/:pslug/backlog", element: <BacklogPage /> },
            { path: "project/:pslug/kanban", element: <KanbanPage /> },
            { path: "project/:pslug/taskboard/:sslug", element: <TaskboardPage /> },
            { path: "project/:pslug/us/:usref", element: <UserStoryDetailPage /> },
            { path: "project/:pslug/task/:taskref", element: <TaskDetailPage /> },
            { path: "project/:pslug/wiki", element: <WikiRedirectPage /> },
            { path: "project/:pslug/wiki-list", element: <WikiListPage /> },
            { path: "project/:pslug/wiki/:slug", element: <WikiPage /> },
            { path: "project/:pslug/team", element: <TeamPage /> },
            { path: "project/:pslug/issues", element: <IssuesPage /> },
            { path: "project/:pslug/issue/:issueref", element: <IssueDetailPage /> },
            { path: "project/:pslug/admin/*", element: <AdminPage /> },
            { path: "project/:pslug/transfer/:token", element: <TransferProjectPage /> },
            { path: "user-settings/*", element: <UserSettingsPage /> },
            { path: "profile", element: <ProfilePage /> },
            { path: "profile/:slug", element: <ProfilePage /> },
            { path: "notifications", element: <NotificationsPage /> },
          ],
        },
      ],
    },
  ];

  return createBrowserRouter([
    ...publicRoutes,
    ...authenticatedRoutes,
    { path: "*", element: <NotFoundPage /> },
  ]);
}
