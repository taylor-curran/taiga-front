import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { ProjectShell } from './layout/ProjectShell';

import Login from './routes/auth/Login';
import ForgotPassword from './routes/auth/ForgotPassword';
import ChangePassword from './routes/auth/ChangePassword';
import InvitationPage from './routes/auth/Invitation';

import Home from './routes/Home';
import Discover, { DiscoverSearch } from './routes/Discover';

import ProjectsListing from './routes/projects/ProjectsListing';
import CreateProject, { CreateProjectForm, DuplicateProjectPage, ImportProjectPage } from './routes/projects/CreateProject';
import ProjectRouter from './routes/projects/ProjectRouter';
import Backlog from './routes/projects/Backlog';
import Kanban from './routes/projects/Kanban';
import Taskboard from './routes/projects/Taskboard';
import Issues from './routes/projects/Issues';
import { WikiPage, WikiList } from './routes/projects/Wiki';
import Team from './routes/projects/Team';
import ProjectSearch from './routes/projects/Search';
import Epics from './routes/projects/Epics';
import Timeline from './routes/projects/Timeline';
import { EpicDetail, IssueDetail, TaskDetail, UserStoryDetail } from './routes/projects/Detail';
import RefRouter from './routes/projects/RefRouter';

import AdminLayout from './routes/admin/AdminLayout';
import {
  AdminProjectDetails,
  AdminProjectModules,
  AdminProjectDefaultValues,
  AdminProjectExport,
  AdminProjectReports,
} from './routes/admin/AdminProjectProfile';
import {
  AdminCustomFields,
  AdminDueDates,
  AdminIssueTypes,
  AdminKanbanPowerUps,
  AdminPoints,
  AdminPriorities,
  AdminSeverities,
  AdminStatuses,
  AdminTags,
} from './routes/admin/AdminValues';
import { AdminMemberships, AdminRoles } from './routes/admin/AdminMembers';
import {
  AdminBitbucketIntegration,
  AdminGitHubIntegration,
  AdminGitLabIntegration,
  AdminGogsIntegration,
  AdminWebhooks,
} from './routes/admin/AdminThirdParties';

import {
  UserSettingsLayout,
  UserProfileSettings,
  ChangePassword as UserChangePassword,
  ProjectPreferences,
  MailNotifications,
  LiveNotifications,
  WebNotifications,
} from './routes/user/UserSettings';
import Profile from './routes/user/Profile';
import Notifications from './routes/user/Notifications';

import {
  BlockedProject,
  CancelAccount,
  ChangeEmail,
  ExternalApp,
  FeedbackPage,
  GenericError,
  NotFound,
  PermissionDenied,
  VerifyEmail,
} from './routes/Errors';

import { useAuth } from './api/auth';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user, initialized } = useAuth();
  if (!initialized) return null;
  if (!user) {
    const next = encodeURIComponent(window.location.pathname + window.location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return children;
}

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Public auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password/:token" element={<ChangePassword />} />
        <Route path="/invitation/:token" element={<InvitationPage />} />
        <Route path="/external-apps" element={<ExternalApp />} />
        <Route path="/feedback" element={<FeedbackPage />} />

        {/* Discover */}
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/search" element={<DiscoverSearch />} />

        {/* Home */}
        <Route path="/" element={<Home />} />

        {/* Projects index */}
        <Route path="/projects/" element={<RequireAuth><ProjectsListing /></RequireAuth>} />
        <Route path="/project/new" element={<RequireAuth><CreateProject /></RequireAuth>} />
        <Route path="/project/new/scrum" element={<RequireAuth><CreateProjectForm /></RequireAuth>} />
        <Route path="/project/new/kanban" element={<RequireAuth><CreateProjectForm /></RequireAuth>} />
        <Route path="/project/new/duplicate" element={<RequireAuth><DuplicateProjectPage /></RequireAuth>} />
        <Route path="/project/new/import/:platform?" element={<RequireAuth><ImportProjectPage /></RequireAuth>} />

        {/* Per-project workspace */}
        <Route path="/project/:pslug" element={<ProjectShell />}>
          <Route index element={<ProjectRouter />} />
          <Route path="" element={<ProjectRouter />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="epics" element={<Epics />} />
          <Route path="epic/:epicref" element={<EpicDetail />} />
          <Route path="backlog" element={<Backlog />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="taskboard/:sslug" element={<Taskboard />} />
          <Route path="us/:usref" element={<UserStoryDetail />} />
          <Route path="task/:taskref" element={<TaskDetail />} />
          <Route path="issues" element={<Issues />} />
          <Route path="issue/:issueref" element={<IssueDetail />} />
          <Route path="t/:ref" element={<RefRouter />} />
          <Route path="search" element={<ProjectSearch />} />
          <Route path="wiki" element={<Navigate to="home" replace />} />
          <Route path="wiki-list" element={<WikiList />} />
          <Route path="wiki/:slug" element={<WikiPage />} />
          <Route path="team" element={<Team />} />

          {/* Admin */}
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="project-profile/details" replace />} />
            <Route path="project-profile/details" element={<AdminProjectDetails />} />
            <Route path="project-profile/default-values" element={<AdminProjectDefaultValues />} />
            <Route path="project-profile/modules" element={<AdminProjectModules />} />
            <Route path="project-profile/export" element={<AdminProjectExport />} />
            <Route path="project-profile/reports" element={<AdminProjectReports />} />

            <Route path="project-values/status" element={<AdminStatuses />} />
            <Route path="project-values/points" element={<AdminPoints />} />
            <Route path="project-values/priorities" element={<AdminPriorities />} />
            <Route path="project-values/severities" element={<AdminSeverities />} />
            <Route path="project-values/types" element={<AdminIssueTypes />} />
            <Route path="project-values/custom-fields" element={<AdminCustomFields />} />
            <Route path="project-values/tags" element={<AdminTags />} />
            <Route path="project-values/due-dates" element={<AdminDueDates />} />
            <Route path="project-values/kanban-power-ups" element={<AdminKanbanPowerUps />} />

            <Route path="memberships" element={<AdminMemberships />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="third-parties/webhooks" element={<AdminWebhooks />} />
            <Route path="third-parties/github" element={<AdminGitHubIntegration />} />
            <Route path="third-parties/gitlab" element={<AdminGitLabIntegration />} />
            <Route path="third-parties/bitbucket" element={<AdminBitbucketIntegration />} />
            <Route path="third-parties/gogs" element={<AdminGogsIntegration />} />
          </Route>

          <Route path="transfer/:token" element={<div className="p-8 text-center text-slate-500">Project transfer page</div>} />
        </Route>

        {/* Blocked + project errors */}
        <Route path="/blocked-project/:pslug/" element={<BlockedProject />} />

        {/* User settings */}
        <Route path="/user-settings" element={<RequireAuth><UserSettingsLayout /></RequireAuth>}>
          <Route index element={<Navigate to="user-profile" replace />} />
          <Route path="user-profile" element={<UserProfileSettings />} />
          <Route path="user-change-password" element={<UserChangePassword />} />
          <Route path="user-project-settings" element={<ProjectPreferences />} />
          <Route path="mail-notifications" element={<MailNotifications />} />
          <Route path="live-notifications" element={<LiveNotifications />} />
          <Route path="web-notifications" element={<WebNotifications />} />
          <Route path="contrib/:plugin" element={<div>Contributed plugin settings</div>} />
        </Route>

        <Route path="/change-email/:email_token" element={<ChangeEmail />} />
        <Route path="/verify-email/:email_token" element={<VerifyEmail />} />
        <Route path="/cancel-account/:cancel_token" element={<CancelAccount />} />

        {/* Profile */}
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/profile/:slug" element={<Profile />} />

        {/* Notifications */}
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

        {/* Errors */}
        <Route path="/error" element={<GenericError />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="/permission-denied" element={<PermissionDenied />} />

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
