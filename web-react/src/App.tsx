import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminSectionPlaceholder } from './pages/admin/AdminSectionPlaceholder';
import { ForgotPasswordPlaceholder } from './pages/auth/ForgotPasswordPlaceholder';
import { LoginPage } from './pages/auth/LoginPage';
import { PermissionDeniedPage } from './pages/auth/PermissionDeniedPage';
import { HomePlaceholder } from './pages/HomePlaceholder';
import { ProjectIndexPlaceholder } from './pages/project/ProjectIndexPlaceholder';
import { ProjectShell } from './pages/project/ProjectShell';
import { RequireAuth } from './routes/RequireAuth';

const ADMIN_SECTIONS: { path: string; title: string }[] = [
  { path: 'project-profile/details', title: 'Project profile — Details' },
  { path: 'project-profile/default-values', title: 'Project profile — Default values' },
  { path: 'project-profile/modules', title: 'Project profile — Modules' },
  { path: 'project-profile/export', title: 'Project profile — Export' },
  { path: 'project-profile/reports', title: 'Project profile — Reports' },
  { path: 'project-values/status', title: 'Values — Status' },
  { path: 'project-values/points', title: 'Values — Points' },
  { path: 'project-values/priorities', title: 'Values — Priorities' },
  { path: 'project-values/severities', title: 'Values — Severities' },
  { path: 'project-values/types', title: 'Values — Types' },
  { path: 'project-values/custom-fields', title: 'Values — Custom fields' },
  { path: 'project-values/tags', title: 'Values — Tags' },
  { path: 'project-values/due-dates', title: 'Values — Due dates' },
  { path: 'project-values/kanban-power-ups', title: 'Values — Kanban power-ups' },
  { path: 'memberships', title: 'Memberships' },
  { path: 'roles', title: 'Roles' },
  { path: 'third-parties/webhooks', title: 'Third parties — Webhooks' },
  { path: 'third-parties/github', title: 'Third parties — GitHub' },
  { path: 'third-parties/gitlab', title: 'Third parties — GitLab' },
  { path: 'third-parties/bitbucket', title: 'Third parties — Bitbucket' },
  { path: 'third-parties/gogs', title: 'Third parties — Gogs' },
  { path: 'contrib/:plugin', title: 'Contrib plugin' },
];

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePlaceholder />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPlaceholder />} />
        <Route path="/permission-denied" element={<PermissionDeniedPage />} />

        <Route element={<RequireAuth />}>
          <Route path="/project/:slug" element={<ProjectShell />}>
            <Route index element={<ProjectIndexPlaceholder />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<Navigate to="project-profile/details" replace />} />
              {ADMIN_SECTIONS.map(({ path, title }) => (
                <Route
                  key={path}
                  path={path}
                  element={<AdminSectionPlaceholder title={title} />}
                />
              ))}
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
