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

import { NotPorted } from '@/components/common/NotPorted';

// `not yet ported` placeholders for the long tail of routes (admin pages,
// new-project flows, contrib plugins, transfer/export). Each gets a unique
// component so a future PR can replace it in-place without touching the route
// table.
const placeholder = (area: string, legacyRoute: string) => () =>
  <NotPorted area={area} legacyRoute={legacyRoute} />;

const NewProject = placeholder('Project · new', '/project/new');
const NewProjectScrum = placeholder('Project · new (Scrum)', '/project/new/scrum');
const NewProjectKanban = placeholder('Project · new (Kanban)', '/project/new/kanban');
const NewProjectDuplicate = placeholder('Project · duplicate', '/project/new/duplicate');
const NewProjectImport = placeholder('Project · import', '/project/new/import/:platform?');
const ProjectTransfer = placeholder('Project · transfer', '/project/:pslug/transfer/:token');
const TaskboardLegacy = placeholder('Project · task by ref (legacy)', '/project/:pslug/t/:ref');

const AdminProjectDetails = placeholder('Admin · project profile · details', '/project/:pslug/admin/project-profile/details');
const AdminProjectDefaults = placeholder('Admin · default values', '/project/:pslug/admin/project-profile/default-values');
const AdminProjectModules = placeholder('Admin · modules', '/project/:pslug/admin/project-profile/modules');
const AdminProjectExport = placeholder('Admin · export', '/project/:pslug/admin/project-profile/export');
const AdminProjectReports = placeholder('Admin · reports', '/project/:pslug/admin/project-profile/reports');

const AdminValuesStatus = placeholder('Admin values · status', '/project/:pslug/admin/project-values/status');
const AdminValuesPoints = placeholder('Admin values · points', '/project/:pslug/admin/project-values/points');
const AdminValuesPriorities = placeholder('Admin values · priorities', '/project/:pslug/admin/project-values/priorities');
const AdminValuesSeverities = placeholder('Admin values · severities', '/project/:pslug/admin/project-values/severities');
const AdminValuesTypes = placeholder('Admin values · types', '/project/:pslug/admin/project-values/types');
const AdminValuesCustomFields = placeholder('Admin values · custom fields', '/project/:pslug/admin/project-values/custom-fields');
const AdminValuesTags = placeholder('Admin values · tags', '/project/:pslug/admin/project-values/tags');
const AdminValuesDueDates = placeholder('Admin values · due dates', '/project/:pslug/admin/project-values/due-dates');
const AdminValuesKanbanPowerUps = placeholder('Admin values · kanban power-ups', '/project/:pslug/admin/project-values/kanban-power-ups');

const AdminMemberships = placeholder('Admin · memberships', '/project/:pslug/admin/memberships');
const AdminRoles = placeholder('Admin · roles', '/project/:pslug/admin/roles');

const AdminThirdPartiesWebhooks = placeholder('Admin · webhooks', '/project/:pslug/admin/third-parties/webhooks');
const AdminThirdPartiesGithub = placeholder('Admin · GitHub integration', '/project/:pslug/admin/third-parties/github');
const AdminThirdPartiesGitlab = placeholder('Admin · GitLab integration', '/project/:pslug/admin/third-parties/gitlab');
const AdminThirdPartiesBitbucket = placeholder('Admin · Bitbucket integration', '/project/:pslug/admin/third-parties/bitbucket');
const AdminThirdPartiesGogs = placeholder('Admin · Gogs integration', '/project/:pslug/admin/third-parties/gogs');
const AdminContribPlugin = placeholder('Admin · contrib plugin', '/project/:pslug/admin/contrib/:plugin');

const UserSettingsChangePassword = placeholder('User settings · change password', '/user-settings/user-change-password');
const UserSettingsProjects = placeholder('User settings · project settings', '/user-settings/user-project-settings');
const UserSettingsMail = placeholder('User settings · mail notifications', '/user-settings/mail-notifications');
const UserSettingsLive = placeholder('User settings · live notifications', '/user-settings/live-notifications');
const UserSettingsWeb = placeholder('User settings · web notifications', '/user-settings/web-notifications');
const UserSettingsContrib = placeholder('User settings · contrib plugin', '/user-settings/contrib/:plugin');

const ExternalApps = placeholder('External apps', '/external-apps');

// All 74 AngularJS routes mapped to React components. Routes without a real
// component show a styled `NotPorted` placeholder so navigation never 404s.
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

      // Token-gated landings — outside auth layout because users may be signed in
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

      // Project routes — all under the project shell layout
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

          // Admin
          { path: 'admin/project-profile/details', element: <AdminProjectDetails /> },
          { path: 'admin/project-profile/default-values', element: <AdminProjectDefaults /> },
          { path: 'admin/project-profile/modules', element: <AdminProjectModules /> },
          { path: 'admin/project-profile/export', element: <AdminProjectExport /> },
          { path: 'admin/project-profile/reports', element: <AdminProjectReports /> },
          { path: 'admin/project-values/status', element: <AdminValuesStatus /> },
          { path: 'admin/project-values/points', element: <AdminValuesPoints /> },
          { path: 'admin/project-values/priorities', element: <AdminValuesPriorities /> },
          { path: 'admin/project-values/severities', element: <AdminValuesSeverities /> },
          { path: 'admin/project-values/types', element: <AdminValuesTypes /> },
          { path: 'admin/project-values/custom-fields', element: <AdminValuesCustomFields /> },
          { path: 'admin/project-values/tags', element: <AdminValuesTags /> },
          { path: 'admin/project-values/due-dates', element: <AdminValuesDueDates /> },
          { path: 'admin/project-values/kanban-power-ups', element: <AdminValuesKanbanPowerUps /> },
          { path: 'admin/memberships', element: <AdminMemberships /> },
          { path: 'admin/roles', element: <AdminRoles /> },
          { path: 'admin/third-parties/webhooks', element: <AdminThirdPartiesWebhooks /> },
          { path: 'admin/third-parties/github', element: <AdminThirdPartiesGithub /> },
          { path: 'admin/third-parties/gitlab', element: <AdminThirdPartiesGitlab /> },
          { path: 'admin/third-parties/bitbucket', element: <AdminThirdPartiesBitbucket /> },
          { path: 'admin/third-parties/gogs', element: <AdminThirdPartiesGogs /> },
          { path: 'admin/contrib/:plugin', element: <AdminContribPlugin /> },

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

  // Catch-all redirect (mirrors AngularJS' otherwise → /not-found)
  { path: '*', element: <Navigate to="/not-found" replace /> },
];

export const router = createBrowserRouter(routes);
