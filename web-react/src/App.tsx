import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Topbar } from '@/components/Topbar';
import { RequireAuth } from '@/components/RequireAuth';
import { ProjectShell } from '@/components/ProjectShell';

import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import ForgotPassword from '@/pages/auth/ForgotPassword';
import ChangePasswordFromRecovery from '@/pages/auth/ChangePasswordFromRecovery';
import Invitation from '@/pages/auth/Invitation';

import Home from '@/pages/Home';
import Discover from '@/pages/Discover';
import ProjectsListing from '@/pages/projects/ProjectsListing';
import CreateProject, {
  CreateProjectForm,
  DuplicateProject,
  ImportProject,
} from '@/pages/projects/CreateProject';

import Backlog from '@/pages/project/Backlog';
import Kanban from '@/pages/project/Kanban';
import Issues from '@/pages/project/Issues';
import Team from '@/pages/project/Team';
import Timeline from '@/pages/project/Timeline';
import { WikiList, WikiPageView } from '@/pages/project/Wiki';
import Epics from '@/pages/project/Epics';
import Taskboard from '@/pages/project/Taskboard';
import ItemDetail from '@/pages/project/ItemDetail';
import ProjectSearch from '@/pages/project/Search';
import {
  AdminShell,
  AdminProjectDetails,
  AdminDefaultValues,
  AdminModules,
  AdminUsStatus,
  AdminPoints,
  AdminPriorities,
  AdminSeverities,
  AdminTypes,
  AdminTags,
  AdminMemberships,
  AdminRoles,
  AdminPlaceholder,
} from '@/pages/project/Admin';

import Profile from '@/pages/Profile';
import Notifications from '@/pages/Notifications';
import {
  UserSettingsShell,
  UserProfile,
  ChangePassword,
  ProjectSettings,
  MailNotifications,
  LiveNotifications,
  WebNotifications,
  ChangeEmail,
  VerifyEmail,
  CancelAccount,
} from '@/pages/UserSettings';

import {
  NotFound,
  PermissionDenied,
  GenericError,
  BlockedProject,
  ExternalApp,
  TransferProject,
} from '@/pages/Errors';

const HEADERLESS = new Set([
  '/login',
  '/register',
  '/forgot-password',
  '/external-apps',
]);

function isHeaderless(pathname: string): boolean {
  if (HEADERLESS.has(pathname)) return true;
  return /^\/(change-password|invitation|change-email|verify-email|cancel-account)\//.test(pathname);
}

export default function App() {
  const location = useLocation();
  const showHeader = !isHeaderless(location.pathname);
  return (
    <div className="app-shell">
      {showHeader && <Topbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/change-password/:token" element={<ChangePasswordFromRecovery />} />
        <Route path="/invitation/:token" element={<Invitation />} />
        <Route path="/external-apps" element={<ExternalApp />} />

        <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
        <Route path="/discover" element={<Discover />} />
        <Route path="/discover/search" element={<Discover />} />

        <Route path="/projects/" element={<RequireAuth><ProjectsListing /></RequireAuth>} />
        <Route path="/projects" element={<Navigate to="/projects/" replace />} />

        <Route path="/project/new" element={<RequireAuth><CreateProject /></RequireAuth>} />
        <Route path="/project/new/scrum" element={<RequireAuth><CreateProjectForm type="scrum" /></RequireAuth>} />
        <Route path="/project/new/kanban" element={<RequireAuth><CreateProjectForm type="kanban" /></RequireAuth>} />
        <Route path="/project/new/duplicate" element={<RequireAuth><DuplicateProject /></RequireAuth>} />
        <Route path="/project/new/import" element={<RequireAuth><ImportProject /></RequireAuth>} />
        <Route path="/project/new/import/:platform" element={<RequireAuth><ImportProject /></RequireAuth>} />

        <Route path="/project/:pslug" element={<ProjectShell />}>
          <Route index element={<Navigate to="timeline" replace />} />
          <Route path="timeline" element={<Timeline />} />
          <Route path="search" element={<ProjectSearch />} />
          <Route path="epics" element={<Epics />} />
          <Route path="epic/:epicref" element={<ItemDetail type="epic" />} />
          <Route path="backlog" element={<Backlog />} />
          <Route path="kanban" element={<Kanban />} />
          <Route path="taskboard/:sslug" element={<Taskboard />} />
          <Route path="us/:usref" element={<ItemDetail type="userstory" />} />
          <Route path="task/:taskref" element={<ItemDetail type="task" />} />
          <Route path="issues" element={<Issues />} />
          <Route path="issue/:issueref" element={<ItemDetail type="issue" />} />
          <Route path="t/:ref" element={<ItemDetail type="userstory" />} />
          <Route path="team" element={<Team />} />
          <Route path="wiki" element={<Navigate to="wiki/home" replace />} />
          <Route path="wiki-list" element={<WikiList />} />
          <Route path="wiki/:slug" element={<WikiPageView />} />
          <Route path="admin" element={<AdminShell />}>
            <Route index element={<Navigate to="project-profile/details" replace />} />
            <Route path="project-profile/details" element={<AdminProjectDetails />} />
            <Route path="project-profile/default-values" element={<AdminDefaultValues />} />
            <Route path="project-profile/modules" element={<AdminModules />} />
            <Route path="project-profile/export" element={<AdminPlaceholder title="Export project" />} />
            <Route path="project-profile/reports" element={<AdminPlaceholder title="Reports" />} />
            <Route path="project-values/status" element={<AdminUsStatus />} />
            <Route path="project-values/points" element={<AdminPoints />} />
            <Route path="project-values/priorities" element={<AdminPriorities />} />
            <Route path="project-values/severities" element={<AdminSeverities />} />
            <Route path="project-values/types" element={<AdminTypes />} />
            <Route path="project-values/custom-fields" element={<AdminPlaceholder title="Custom fields" />} />
            <Route path="project-values/tags" element={<AdminTags />} />
            <Route path="project-values/due-dates" element={<AdminPlaceholder title="Due dates" />} />
            <Route path="project-values/kanban-power-ups" element={<AdminPlaceholder title="Kanban power-ups" />} />
            <Route path="memberships" element={<AdminMemberships />} />
            <Route path="roles" element={<AdminRoles />} />
            <Route path="third-parties/webhooks" element={<AdminPlaceholder title="Webhooks" />} />
            <Route path="third-parties/github" element={<AdminPlaceholder title="GitHub integration" />} />
            <Route path="third-parties/gitlab" element={<AdminPlaceholder title="GitLab integration" />} />
            <Route path="third-parties/bitbucket" element={<AdminPlaceholder title="Bitbucket integration" />} />
            <Route path="third-parties/gogs" element={<AdminPlaceholder title="Gogs integration" />} />
            <Route path="contrib/:plugin" element={<AdminPlaceholder title="Plugin" />} />
          </Route>
          <Route path="transfer/:token" element={<TransferProject />} />
        </Route>

        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
        <Route path="/profile/:slug" element={<Profile />} />
        <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />

        <Route path="/user-settings" element={<RequireAuth><UserSettingsShell /></RequireAuth>}>
          <Route index element={<Navigate to="user-profile" replace />} />
          <Route path="user-profile" element={<UserProfile />} />
          <Route path="user-change-password" element={<ChangePassword />} />
          <Route path="user-project-settings" element={<ProjectSettings />} />
          <Route path="mail-notifications" element={<MailNotifications />} />
          <Route path="live-notifications" element={<LiveNotifications />} />
          <Route path="web-notifications" element={<WebNotifications />} />
          <Route path="contrib/:plugin" element={<AdminPlaceholder title="User plugin" />} />
        </Route>

        <Route path="/change-email/:email_token" element={<ChangeEmail />} />
        <Route path="/verify-email/:email_token" element={<VerifyEmail />} />
        <Route path="/cancel-account/:cancel_token" element={<CancelAccount />} />

        <Route path="/blocked-project/:pslug" element={<BlockedProject />} />
        <Route path="/error" element={<GenericError />} />
        <Route path="/permission-denied" element={<PermissionDenied />} />
        <Route path="/not-found" element={<NotFound />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
