import { createBrowserRouter, Navigate, RouteObject } from 'react-router-dom';
import { AppShell } from '@/components/Layout/AppShell';
import { AuthLayout } from '@/components/Layout/AuthLayout';
import { ProjectShell } from '@/components/Layout/ProjectShell';
import { RequireAuth } from '@/components/RequireAuth';

import { HomePage } from '@/pages/Home';
import { DiscoverPage } from '@/pages/Discover';
import { DiscoverSearchPage } from '@/pages/DiscoverSearch';
import { ProjectsListPage } from '@/pages/ProjectsList';
import { ProfilePage } from '@/pages/Profile';
import { NotificationsPage } from '@/pages/Notifications';
import { UserSettingsLayout, UserProfileSettings } from '@/pages/UserSettings';
import { ErrorPage, NotFoundPage, BlockedProjectPage } from '@/pages/Errors';

import { LoginPage } from '@/pages/auth/Login';
import { RegisterPage } from '@/pages/auth/Register';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPassword';
import { ChangePasswordPage } from '@/pages/auth/ChangePassword';
import { TokenLandingPage } from '@/pages/auth/TokenLanding';

import { ProjectHomePage } from '@/pages/project/ProjectHome';
import { BacklogPage } from '@/pages/project/Backlog';
import { KanbanPage } from '@/pages/project/Kanban';
import { TaskboardPage } from '@/pages/project/Taskboard';
import { IssuesPage } from '@/pages/project/Issues';
import { IssueDetailPage } from '@/pages/project/IssueDetail';
import { USDetailPage } from '@/pages/project/USDetail';
import { TaskDetailPage } from '@/pages/project/TaskDetail';
import { EpicsPage } from '@/pages/project/Epics';
import { EpicDetailPage } from '@/pages/project/EpicDetail';
import { WikiPage } from '@/pages/project/Wiki';
import { WikiListPage } from '@/pages/project/WikiList';
import { WikiPageView } from '@/pages/project/WikiPage';
import { TeamPage } from '@/pages/project/Team';
import { TimelinePage } from '@/pages/project/Timeline';
import { SearchPage } from '@/pages/project/Search';

import {
  AdminLayout,
  ProjectDetailsPage,
  DefaultValuesPage,
  ProjectModulesPage,
  ProjectExportPage,
  ProjectReportsPage,
  ValuesStatusPage,
  ValuesPointsPage,
  ValuesPrioritiesPage,
  ValuesSeveritiesPage,
  ValuesTypesPage,
  ValuesCustomFieldsPage,
  ValuesTagsPage,
  ValuesDueDatesPage,
  ValuesKanbanPowerUpsPage,
  MembershipsPage,
  RolesPage,
  WebhooksPage,
  GitHubIntegrationPage,
  GitLabIntegrationPage,
  BitbucketIntegrationPage,
  GogsIntegrationPage,
  ContribPluginPage,
} from '@/pages/project/admin';

import { NotPorted } from '@/components/common/NotPorted';

// `not yet ported` placeholders for the long tail of routes (new-project
// flows, contrib plugins, transfer/export). Each gets a unique component so a
// future PR can replace it in-place without touching the route table.
const placeholder = (area: string, legacyRoute: string) => () =>
  <NotPorted area={area} legacyRoute={legacyRoute} />;

const NewProject = placeholder('Project \u00b7 new', '/project/new');
const NewProjectScrum = placeholder('Project \u00b7 new (Scrum)', '/project/new/scrum');
const NewProjectKanban = placeholder('Project \u00b7 new (Kanban)', '/project/new/kanban');
const NewProjectDuplicate = placeholder('Project \u00b7 duplicate', '/project/new/duplicate');
const NewProjectImport = placeholder('Project \u00b7 import', '/project/new/import/:platform?');
const ProjectTransfer = placeholder('Project \u00b7 transfer', '/project/:pslug/transfer/:token');
const TaskboardLegacy = placeholder('Project \u00b7 task by ref (legacy)', '/project/:pslug/t/:ref');

const UserSettingsChangePassword = placeholder('User settings \u00b7 change password', '/user-settings/user-change-password');
const UserSettingsProjects = placeholder('User settings \u00b7 project settings', '/user-settings/user-project-settings');
const UserSettingsMail = placeholder('User settings \u00b7 mail notifications', '/user-settings/mail-notifications');
const UserSettingsLive = placeholder('User settings \u00b7 live notifications', '/user-settings/live-notifications');
const UserSettingsWeb = placeholder('User settings \u00b7 web notifications', '/user-settings/web-notifications');
const UserSettingsContrib = placeholder('User settings \u00b7 contrib plugin', '/user-settings/contrib/:plugin');

const ExternalApps = placeholder('External apps', '/external-apps');

// All 74 AngularJS routes mapped to React components. Admin routes now use
// a nested AdminLayout with a settings sidebar.
const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      // Top-level
      { index: true, element: <HomePage /> },
      { path: 'discover', element: <DiscoverPage /> },
      { path: 'discover/search', element: <DiscoverSearchPage /> },
      { path: 'projects/', element: <ProjectsListPage /> },

      // New project flows
      { path: 'project/new', element: <NewProject /> },
      { path: 'project/new/scrum', element: <NewProjectScrum /> },
      { path: 'project/new/kanban', element: <NewProjectKanban /> },
      { path: 'project/new/duplicate', element: <NewProjectDuplicate /> },
      { path: 'project/new/import/:platform?', element: <NewProjectImport /> },

      // Profile / notifications
      { path: 'profile', element: <RequireAuth><ProfilePage /></RequireAuth> },
      { path: 'profile/:slug', element: <ProfilePage /> },
      { path: 'notifications', element: <RequireAuth><NotificationsPage /></RequireAuth> },

      // User settings (single-page nested layout)
      {
        element: <RequireAuth><UserSettingsLayout /></RequireAuth>,
        children: [
          { path: 'user-settings/user-profile', element: <UserProfileSettings /> },
          { path: 'user-settings/user-change-password', element: <UserSettingsChangePassword /> },
          { path: 'user-settings/user-project-settings', element: <UserSettingsProjects /> },
          { path: 'user-settings/mail-notifications', element: <UserSettingsMail /> },
          { path: 'user-settings/live-notifications', element: <UserSettingsLive /> },
          { path: 'user-settings/web-notifications', element: <UserSettingsWeb /> },
          { path: 'user-settings/contrib/:plugin', element: <UserSettingsContrib /> },
        ],
      },

      // Token-gated landings
      {
        path: 'change-email/:email_token',
        element: (
          <TokenLandingPage
            endpoint="users/change_email"
            paramKey="email_token"
            successTitle="Email changed"
            successMessage="Your email has been updated."
          />
        ),
      },
      {
        path: 'verify-email/:email_token',
        element: (
          <TokenLandingPage
            endpoint="users/verify_email"
            paramKey="email_token"
            successTitle="Email verified"
            successMessage="Your account is ready."
          />
        ),
      },
      {
        path: 'cancel-account/:cancel_token',
        element: (
          <TokenLandingPage
            endpoint="users/cancel"
            paramKey="cancel_token"
            successTitle="Account cancelled"
            successMessage="Your account has been deleted."
          />
        ),
      },

      // External apps
      { path: 'external-apps', element: <ExternalApps /> },

      // Project routes
      {
        path: 'project/:pslug',
        element: <ProjectShell />,
        children: [
          { path: '', element: <ProjectHomePage /> },
          { path: 'timeline', element: <TimelinePage /> },
          { path: 't/:ref', element: <TaskboardLegacy /> },
          { path: 'search', element: <SearchPage /> },
          { path: 'epics', element: <EpicsPage /> },
          { path: 'epic/:epicref', element: <EpicDetailPage /> },
          { path: 'backlog', element: <BacklogPage /> },
          { path: 'kanban', element: <KanbanPage /> },
          { path: 'taskboard/:sslug', element: <TaskboardPage /> },
          { path: 'us/:usref', element: <USDetailPage /> },
          { path: 'task/:taskref', element: <TaskDetailPage /> },
          { path: 'wiki', element: <WikiPage /> },
          { path: 'wiki-list', element: <WikiListPage /> },
          { path: 'wiki/:slug', element: <WikiPageView /> },
          { path: 'team', element: <TeamPage /> },
          { path: 'issues', element: <IssuesPage /> },
          { path: 'issue/:issueref', element: <IssueDetailPage /> },

          // Admin — nested layout with settings sidebar
          {
            path: 'admin',
            element: <AdminLayout />,
            children: [
              { path: 'project-profile/details', element: <ProjectDetailsPage /> },
              { path: 'project-profile/default-values', element: <DefaultValuesPage /> },
              { path: 'project-profile/modules', element: <ProjectModulesPage /> },
              { path: 'project-profile/export', element: <ProjectExportPage /> },
              { path: 'project-profile/reports', element: <ProjectReportsPage /> },
              { path: 'project-values/status', element: <ValuesStatusPage /> },
              { path: 'project-values/points', element: <ValuesPointsPage /> },
              { path: 'project-values/priorities', element: <ValuesPrioritiesPage /> },
              { path: 'project-values/severities', element: <ValuesSeveritiesPage /> },
              { path: 'project-values/types', element: <ValuesTypesPage /> },
              { path: 'project-values/custom-fields', element: <ValuesCustomFieldsPage /> },
              { path: 'project-values/tags', element: <ValuesTagsPage /> },
              { path: 'project-values/due-dates', element: <ValuesDueDatesPage /> },
              { path: 'project-values/kanban-power-ups', element: <ValuesKanbanPowerUpsPage /> },
              { path: 'memberships', element: <MembershipsPage /> },
              { path: 'roles', element: <RolesPage /> },
              { path: 'third-parties/webhooks', element: <WebhooksPage /> },
              { path: 'third-parties/github', element: <GitHubIntegrationPage /> },
              { path: 'third-parties/gitlab', element: <GitLabIntegrationPage /> },
              { path: 'third-parties/bitbucket', element: <BitbucketIntegrationPage /> },
              { path: 'third-parties/gogs', element: <GogsIntegrationPage /> },
              { path: 'contrib/:plugin', element: <ContribPluginPage /> },
            ],
          },

          { path: 'transfer/:token', element: <ProjectTransfer /> },
        ],
      },

      // Blocked / errors
      { path: 'blocked-project/:pslug/', element: <BlockedProjectPage /> },
      { path: 'error', element: <ErrorPage /> },
      { path: 'not-found', element: <NotFoundPage /> },
    ],
  },

  // Auth shell (login, register, forgot, change password, invitation)
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/change-password/:token', element: <ChangePasswordPage /> },
      {
        path: '/invitation/:token',
        element: (
          <TokenLandingPage
            endpoint="invitations/accept"
            paramKey="token"
            successTitle="Invitation accepted"
            successMessage="You're now a member of the project."
          />
        ),
      },
    ],
  },

  // Catch-all redirect (mirrors AngularJS' otherwise -> /not-found)
  { path: '*', element: <Navigate to="/not-found" replace /> },
];

export const router = createBrowserRouter(routes);
