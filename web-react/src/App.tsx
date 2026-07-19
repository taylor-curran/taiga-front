// Main app with all ~50 routes ported from app.coffee
// Uses React Router with lazy-loaded route components for code splitting

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './auth/AuthProvider';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layouts/AppLayout';
import { Loader } from './components/Loader';
import { ErrorBoundary } from './components/ErrorBoundary';
import './i18n';
import './styles/global.scss';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

// ─── Lazy route components ──────────────────────────────────────────
// Auth (headerless)
const LoginPage = lazy(() => import('./features/auth/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./features/auth/ForgotPasswordPage'));
const ChangePasswordPage = lazy(() => import('./features/auth/ChangePasswordPage'));
const InvitationPage = lazy(() => import('./features/auth/InvitationPage'));

// Home
const HomePage = lazy(() => import('./features/home/HomePage'));

// Discover
const DiscoverHomePage = lazy(() => import('./features/discover/DiscoverHomePage'));
const DiscoverSearchPage = lazy(() => import('./features/discover/DiscoverSearchPage'));

// Projects
const ProjectsListingPage = lazy(() => import('./features/projects/ProjectsListingPage'));
const CreateProjectPage = lazy(() => import('./features/projects/CreateProjectPage'));
const CreateProjectFormPage = lazy(() => import('./features/projects/CreateProjectFormPage'));
const DuplicateProjectPage = lazy(() => import('./features/projects/DuplicateProjectPage'));
const ImportProjectPage = lazy(() => import('./features/projects/ImportProjectPage'));
const ProjectRouterPage = lazy(() => import('./features/projects/ProjectRouterPage'));
const ProjectTimelinePage = lazy(() => import('./features/projects/ProjectTimelinePage'));
const TransferProjectPage = lazy(() => import('./features/projects/TransferProjectPage'));
const BlockedProjectPage = lazy(() => import('./features/projects/BlockedProjectPage'));

// Backlog
const BacklogPage = lazy(() => import('./features/backlog/BacklogPage'));

// Kanban
const KanbanPage = lazy(() => import('./features/kanban/KanbanPage'));

// Taskboard
const TaskboardPage = lazy(() => import('./features/taskboard/TaskboardPage'));

// Epics
const EpicsDashboardPage = lazy(() => import('./features/epics/EpicsDashboardPage'));
const EpicDetailPage = lazy(() => import('./features/epics/EpicDetailPage'));

// Detail pages
const UserStoryDetailPage = lazy(() => import('./features/userstories/UserStoryDetailPage'));
const TaskDetailPage = lazy(() => import('./features/tasks/TaskDetailPage'));
const IssuesListPage = lazy(() => import('./features/issues/IssuesListPage'));
const IssueDetailPage = lazy(() => import('./features/issues/IssueDetailPage'));

// Wiki
const WikiPage = lazy(() => import('./features/wiki/WikiPage'));
const WikiListPage = lazy(() => import('./features/wiki/WikiListPage'));

// Team
const TeamPage = lazy(() => import('./features/team/TeamPage'));

// Search
const SearchPage = lazy(() => import('./features/search/SearchPage'));

// Admin
const AdminProjectProfilePage = lazy(() => import('./features/admin/AdminProjectProfilePage'));
const AdminDefaultValuesPage = lazy(() => import('./features/admin/AdminDefaultValuesPage'));
const AdminModulesPage = lazy(() => import('./features/admin/AdminModulesPage'));
const AdminExportPage = lazy(() => import('./features/admin/AdminExportPage'));
const AdminReportsPage = lazy(() => import('./features/admin/AdminReportsPage'));
const AdminStatusPage = lazy(() => import('./features/admin/AdminStatusPage'));
const AdminPointsPage = lazy(() => import('./features/admin/AdminPointsPage'));
const AdminPrioritiesPage = lazy(() => import('./features/admin/AdminPrioritiesPage'));
const AdminSeveritiesPage = lazy(() => import('./features/admin/AdminSeveritiesPage'));
const AdminTypesPage = lazy(() => import('./features/admin/AdminTypesPage'));
const AdminCustomFieldsPage = lazy(() => import('./features/admin/AdminCustomFieldsPage'));
const AdminTagsPage = lazy(() => import('./features/admin/AdminTagsPage'));
const AdminDueDatesPage = lazy(() => import('./features/admin/AdminDueDatesPage'));
const AdminKanbanPowerUpsPage = lazy(() => import('./features/admin/AdminKanbanPowerUpsPage'));
const AdminMembershipsPage = lazy(() => import('./features/admin/AdminMembershipsPage'));
const AdminRolesPage = lazy(() => import('./features/admin/AdminRolesPage'));
const AdminWebhooksPage = lazy(() => import('./features/admin/AdminWebhooksPage'));
const AdminGithubPage = lazy(() => import('./features/admin/AdminGithubPage'));
const AdminGitlabPage = lazy(() => import('./features/admin/AdminGitlabPage'));
const AdminBitbucketPage = lazy(() => import('./features/admin/AdminBitbucketPage'));
const AdminGogsPage = lazy(() => import('./features/admin/AdminGogsPage'));

// User Settings
const UserProfileSettingsPage = lazy(() => import('./features/user-settings/UserProfileSettingsPage'));
const UserChangePasswordSettingsPage = lazy(() => import('./features/user-settings/UserChangePasswordSettingsPage'));
const UserProjectSettingsPage = lazy(() => import('./features/user-settings/UserProjectSettingsPage'));
const MailNotificationsPage = lazy(() => import('./features/user-settings/MailNotificationsPage'));
const LiveNotificationsPage = lazy(() => import('./features/user-settings/LiveNotificationsPage'));
const WebNotificationsPage = lazy(() => import('./features/user-settings/WebNotificationsPage'));
const ChangeEmailPage = lazy(() => import('./features/user-settings/ChangeEmailPage'));
const VerifyEmailPage = lazy(() => import('./features/user-settings/VerifyEmailPage'));
const CancelAccountPage = lazy(() => import('./features/user-settings/CancelAccountPage'));

// Profile
const ProfilePage = lazy(() => import('./features/profile/ProfilePage'));

// Notifications
const NotificationsPage = lazy(() => import('./features/notifications/NotificationsPage'));

// Errors
const ErrorPage = lazy(() => import('./features/errors/ErrorPage'));
const NotFoundPage = lazy(() => import('./features/errors/NotFoundPage'));
const PermissionDeniedPage = lazy(() => import('./features/errors/PermissionDeniedPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <Suspense fallback={<Loader />}>
              <Routes>
                {/* Auth routes — no header */}
                <Route element={<AppLayout hideHeader />}>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/change-password/:token" element={<ChangePasswordPage />} />
                  <Route path="/invitation/:token" element={<InvitationPage />} />
                </Route>

                {/* Main app routes — with header */}
                <Route element={<AppLayout />}>
                  {/* Home (requires login) */}
                  <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />

                  {/* Discover */}
                  <Route path="/discover" element={<DiscoverHomePage />} />
                  <Route path="/discover/search" element={<DiscoverSearchPage />} />

                  {/* Projects */}
                  <Route path="/projects/" element={<RequireAuth><ProjectsListingPage /></RequireAuth>} />
                  <Route path="/project/new" element={<CreateProjectPage />} />
                  <Route path="/project/new/scrum" element={<CreateProjectFormPage />} />
                  <Route path="/project/new/kanban" element={<CreateProjectFormPage />} />
                  <Route path="/project/new/duplicate" element={<DuplicateProjectPage />} />
                  <Route path="/project/new/import/:platform?" element={<ImportProjectPage />} />

                  {/* Project detail & sub-routes */}
                  <Route path="/project/:pslug/" element={<ProjectRouterPage />} />
                  <Route path="/project/:pslug/timeline" element={<ProjectTimelinePage />} />
                  <Route path="/project/:pslug/search" element={<SearchPage />} />

                  {/* Epics */}
                  <Route path="/project/:pslug/epics" element={<EpicsDashboardPage />} />
                  <Route path="/project/:pslug/epic/:epicref" element={<EpicDetailPage />} />

                  {/* Backlog */}
                  <Route path="/project/:pslug/backlog" element={<BacklogPage />} />

                  {/* Kanban */}
                  <Route path="/project/:pslug/kanban" element={<KanbanPage />} />

                  {/* Taskboard */}
                  <Route path="/project/:pslug/taskboard/:sslug" element={<TaskboardPage />} />

                  {/* User Stories */}
                  <Route path="/project/:pslug/us/:usref" element={<UserStoryDetailPage />} />

                  {/* Tasks */}
                  <Route path="/project/:pslug/task/:taskref" element={<TaskDetailPage />} />

                  {/* Wiki */}
                  <Route path="/project/:pslug/wiki" element={<Navigate to="home" replace />} />
                  <Route path="/project/:pslug/wiki-list" element={<WikiListPage />} />
                  <Route path="/project/:pslug/wiki/:slug" element={<WikiPage />} />

                  {/* Team */}
                  <Route path="/project/:pslug/team" element={<TeamPage />} />

                  {/* Issues */}
                  <Route path="/project/:pslug/issues" element={<IssuesListPage />} />
                  <Route path="/project/:pslug/issue/:issueref" element={<IssueDetailPage />} />

                  {/* Admin - Project Profile */}
                  <Route path="/project/:pslug/admin/project-profile/details" element={<AdminProjectProfilePage />} />
                  <Route path="/project/:pslug/admin/project-profile/default-values" element={<AdminDefaultValuesPage />} />
                  <Route path="/project/:pslug/admin/project-profile/modules" element={<AdminModulesPage />} />
                  <Route path="/project/:pslug/admin/project-profile/export" element={<AdminExportPage />} />
                  <Route path="/project/:pslug/admin/project-profile/reports" element={<AdminReportsPage />} />

                  {/* Admin - Project Values */}
                  <Route path="/project/:pslug/admin/project-values/status" element={<AdminStatusPage />} />
                  <Route path="/project/:pslug/admin/project-values/points" element={<AdminPointsPage />} />
                  <Route path="/project/:pslug/admin/project-values/priorities" element={<AdminPrioritiesPage />} />
                  <Route path="/project/:pslug/admin/project-values/severities" element={<AdminSeveritiesPage />} />
                  <Route path="/project/:pslug/admin/project-values/types" element={<AdminTypesPage />} />
                  <Route path="/project/:pslug/admin/project-values/custom-fields" element={<AdminCustomFieldsPage />} />
                  <Route path="/project/:pslug/admin/project-values/tags" element={<AdminTagsPage />} />
                  <Route path="/project/:pslug/admin/project-values/due-dates" element={<AdminDueDatesPage />} />
                  <Route path="/project/:pslug/admin/project-values/kanban-power-ups" element={<AdminKanbanPowerUpsPage />} />

                  {/* Admin - Memberships & Roles */}
                  <Route path="/project/:pslug/admin/memberships" element={<AdminMembershipsPage />} />
                  <Route path="/project/:pslug/admin/roles" element={<AdminRolesPage />} />

                  {/* Admin - Third Parties */}
                  <Route path="/project/:pslug/admin/third-parties/webhooks" element={<AdminWebhooksPage />} />
                  <Route path="/project/:pslug/admin/third-parties/github" element={<AdminGithubPage />} />
                  <Route path="/project/:pslug/admin/third-parties/gitlab" element={<AdminGitlabPage />} />
                  <Route path="/project/:pslug/admin/third-parties/bitbucket" element={<AdminBitbucketPage />} />
                  <Route path="/project/:pslug/admin/third-parties/gogs" element={<AdminGogsPage />} />

                  {/* Transfer project */}
                  <Route path="/project/:pslug/transfer/:token" element={<TransferProjectPage />} />
                  <Route path="/blocked-project/:pslug/" element={<BlockedProjectPage />} />

                  {/* User Settings */}
                  <Route path="/user-settings/user-profile" element={<UserProfileSettingsPage />} />
                  <Route path="/user-settings/user-change-password" element={<UserChangePasswordSettingsPage />} />
                  <Route path="/user-settings/user-project-settings" element={<UserProjectSettingsPage />} />
                  <Route path="/user-settings/mail-notifications" element={<MailNotificationsPage />} />
                  <Route path="/user-settings/live-notifications" element={<LiveNotificationsPage />} />
                  <Route path="/user-settings/web-notifications" element={<WebNotificationsPage />} />
                  <Route path="/change-email/:email_token" element={<ChangeEmailPage />} />
                  <Route path="/verify-email/:email_token" element={<VerifyEmailPage />} />
                  <Route path="/cancel-account/:cancel_token" element={<CancelAccountPage />} />

                  {/* Profile */}
                  <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                  <Route path="/profile/:slug" element={<ProfilePage />} />

                  {/* Notifications */}
                  <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />

                  {/* Errors */}
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="/not-found" element={<NotFoundPage />} />
                  <Route path="/permission-denied" element={<PermissionDeniedPage />} />

                  {/* Catch-all */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
