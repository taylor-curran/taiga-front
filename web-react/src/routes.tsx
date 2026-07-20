import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { HomeGate } from './pages/home/HomeGate';
import { DiscoverHomePage } from './pages/discover/DiscoverHomePage';
import { DiscoverSearchPage } from './pages/discover/DiscoverSearchPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterGate } from './pages/auth/RegisterGate';
import { PlaceholderPage } from './pages/PlaceholderPage';
import { ProjectRootRedirect } from './pages/project/ProjectRootRedirect';
import { WikiHomeRedirect } from './pages/project/WikiHomeRedirect';
import type { TaigaUser } from './api/types';

function ErrorPage({ titleKey }: { titleKey: string }) {
  return <PlaceholderPage titleKey={titleKey} />;
}

export function AppRoutes({ user }: { user: TaigaUser | null }) {
  return (
    <Routes>
      <Route element={<AppLayout user={user} />}>
        <Route index element={<HomeGate user={user} />} />
        <Route path="discover" element={<DiscoverHomePage />} />
        <Route path="discover/search" element={<DiscoverSearchPage />} />
        <Route path="projects" element={<PlaceholderPage titleKey="PROJECTS.PAGE_TITLE" />} />

        <Route path="project/new" element={<PlaceholderPage titleKey="PROJECT.CREATE.TITLE" />} />
        <Route path="project/new/scrum" element={<PlaceholderPage titleKey="PROJECT.CREATE.TITLE" />} />
        <Route path="project/new/kanban" element={<PlaceholderPage titleKey="PROJECT.CREATE.TITLE" />} />
        <Route path="project/new/duplicate" element={<PlaceholderPage titleKey="PROJECT.CREATE.TITLE" />} />
        <Route path="project/new/import" element={<PlaceholderPage titleKey="PROJECT.CREATE.TITLE" />} />
        <Route path="project/new/import/:platform" element={<PlaceholderPage titleKey="PROJECT.CREATE.TITLE" />} />

        <Route path="project/:pslug" element={<ProjectRootRedirect />} />
        <Route path="project/:pslug/timeline" element={<PlaceholderPage />} />
        <Route path="project/:pslug/t/:ref" element={<PlaceholderPage />} />
        <Route path="project/:pslug/search" element={<PlaceholderPage />} />
        <Route path="project/:pslug/epics" element={<PlaceholderPage />} />
        <Route path="project/:pslug/epic/:epicref" element={<PlaceholderPage />} />
        <Route path="project/:pslug/backlog" element={<PlaceholderPage />} />
        <Route path="project/:pslug/kanban" element={<PlaceholderPage />} />
        <Route path="project/:pslug/taskboard/:sslug" element={<PlaceholderPage />} />
        <Route path="project/:pslug/us/:usref" element={<PlaceholderPage />} />
        <Route path="project/:pslug/task/:taskref" element={<PlaceholderPage />} />
        <Route path="project/:pslug/wiki" element={<WikiHomeRedirect />} />
        <Route path="project/:pslug/wiki-list" element={<PlaceholderPage />} />
        <Route path="project/:pslug/wiki/:slug" element={<PlaceholderPage />} />
        <Route path="project/:pslug/team" element={<PlaceholderPage />} />
        <Route path="project/:pslug/issues" element={<PlaceholderPage />} />
        <Route path="project/:pslug/issue/:issueref" element={<PlaceholderPage />} />

        <Route path="project/:pslug/admin/project-profile/details" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-profile/default-values" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-profile/modules" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-profile/export" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-profile/reports" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/status" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/points" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/priorities" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/severities" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/types" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/custom-fields" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/tags" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/due-dates" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/project-values/kanban-power-ups" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/memberships" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/roles" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/third-parties/webhooks" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/third-parties/github" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/third-parties/gitlab" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/third-parties/bitbucket" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/third-parties/gogs" element={<PlaceholderPage />} />
        <Route path="project/:pslug/admin/contrib/:plugin" element={<PlaceholderPage />} />
        <Route path="project/:pslug/transfer/:token" element={<PlaceholderPage />} />

        <Route path="user-settings/user-profile" element={<PlaceholderPage />} />
        <Route path="user-settings/user-change-password" element={<PlaceholderPage />} />
        <Route path="user-settings/user-project-settings" element={<PlaceholderPage />} />
        <Route path="user-settings/mail-notifications" element={<PlaceholderPage />} />
        <Route path="user-settings/live-notifications" element={<PlaceholderPage />} />
        <Route path="user-settings/web-notifications" element={<PlaceholderPage />} />
        <Route path="change-email/:email_token" element={<PlaceholderPage />} />
        <Route path="verify-email/:email_token" element={<PlaceholderPage />} />
        <Route path="cancel-account/:cancel_token" element={<PlaceholderPage />} />
        <Route path="user-settings/contrib/:plugin" element={<PlaceholderPage />} />

        <Route path="profile" element={<PlaceholderPage />} />
        <Route path="notifications" element={<PlaceholderPage />} />
        <Route path="profile/:slug" element={<PlaceholderPage />} />

        <Route path="external-apps" element={<PlaceholderPage titleKey="EXTERNAL_APP.PAGE_TITLE" />} />
        <Route path="blocked-project/:pslug" element={<PlaceholderPage />} />

        <Route path="error" element={<ErrorPage titleKey="COMMON.GO_HOME" />} />
        <Route path="not-found" element={<ErrorPage titleKey="COMMON.GO_HOME" />} />
        <Route path="permission-denied" element={<ErrorPage titleKey="COMMON.GO_HOME" />} />
        <Route path="*" element={<Navigate to="/not-found" replace />} />
      </Route>

      <Route element={<AppLayout user={user} hideHeader />}>
        <Route path="login" element={<LoginPage user={user} />} />
        <Route path="register" element={<RegisterGate />} />
        <Route path="forgot-password" element={<PlaceholderPage titleKey="FORGOT_PASSWORD.PAGE_TITLE" />} />
        <Route path="change-password/:token" element={<PlaceholderPage titleKey="CHANGE_PASSWORD.PAGE_TITLE" />} />
        <Route path="invitation/:token" element={<PlaceholderPage titleKey="INVITATION.PAGE_TITLE" />} />
      </Route>
    </Routes>
  );
}
