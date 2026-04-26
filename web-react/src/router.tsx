import { type ReactNode, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthGuard } from './components/AuthGuard';
import { LoadingSpinner } from './components/LoadingSpinner';
import { AdminShellLayout } from './layout/AdminShellLayout';
import {
  AdminContribPlugin,
  AdminMemberships,
  AdminProjectProfileDefaultValues,
  AdminProjectProfileDetails,
  AdminProjectProfileExport,
  AdminProjectProfileModules,
  AdminProjectProfileReports,
  AdminProjectValuesCustomFields,
  AdminProjectValuesDueDates,
  AdminProjectValuesKanbanPowerUps,
  AdminProjectValuesPoints,
  AdminProjectValuesPriorities,
  AdminProjectValuesSeverities,
  AdminProjectValuesStatus,
  AdminProjectValuesTags,
  AdminProjectValuesTypes,
  AdminRoles,
  AdminThirdPartiesBitbucket,
  AdminThirdPartiesGithub,
  AdminThirdPartiesGitlab,
  AdminThirdPartiesGogs,
  AdminThirdPartiesWebhooks,
} from './routes/adminLazyRoutes';
import {
  UserSettingsChangePassword,
  UserSettingsContribPlugin,
  UserSettingsLiveNotifications,
  UserSettingsMailNotifications,
  UserSettingsProfile,
  UserSettingsProjectSettings,
  UserSettingsWebNotifications,
} from './routes/userSettingsLazyRoutes';
import { SimplePlaceholderPage } from './pages/SimplePlaceholderPage';

function SuspenseWrap({ children }: { children: ReactNode }) {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={<SimplePlaceholderPage title="Taiga React port — home" />}
      />
      <Route path="/permission-denied" element={<SimplePlaceholderPage title="Permission denied" />} />

      <Route path="/user-settings" element={<Navigate to="/user-settings/user-profile" replace />} />
      <Route
        path="/user-settings/user-profile"
        element={
          <AuthGuard>
            <SuspenseWrap>
              <UserSettingsProfile />
            </SuspenseWrap>
          </AuthGuard>
        }
      />
      <Route
        path="/user-settings/user-change-password"
        element={
          <AuthGuard>
            <SuspenseWrap>
              <UserSettingsChangePassword />
            </SuspenseWrap>
          </AuthGuard>
        }
      />
      <Route
        path="/user-settings/user-project-settings"
        element={
          <AuthGuard>
            <SuspenseWrap>
              <UserSettingsProjectSettings />
            </SuspenseWrap>
          </AuthGuard>
        }
      />
      <Route
        path="/user-settings/mail-notifications"
        element={
          <AuthGuard>
            <SuspenseWrap>
              <UserSettingsMailNotifications />
            </SuspenseWrap>
          </AuthGuard>
        }
      />
      <Route
        path="/user-settings/live-notifications"
        element={
          <AuthGuard>
            <SuspenseWrap>
              <UserSettingsLiveNotifications />
            </SuspenseWrap>
          </AuthGuard>
        }
      />
      <Route
        path="/user-settings/web-notifications"
        element={
          <AuthGuard>
            <SuspenseWrap>
              <UserSettingsWebNotifications />
            </SuspenseWrap>
          </AuthGuard>
        }
      />
      <Route
        path="/user-settings/contrib/:plugin"
        element={
          <AuthGuard>
            <SuspenseWrap>
              <UserSettingsContribPlugin />
            </SuspenseWrap>
          </AuthGuard>
        }
      />

      <Route
        path="/project/:projectSlug/admin"
        element={
          <AuthGuard>
            <AdminShellLayout />
          </AuthGuard>
        }
      >
        <Route index element={<Navigate to="project-profile/details" replace />} />
        <Route
          path="project-profile/details"
          element={
            <SuspenseWrap>
              <AdminProjectProfileDetails />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-profile/default-values"
          element={
            <SuspenseWrap>
              <AdminProjectProfileDefaultValues />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-profile/modules"
          element={
            <SuspenseWrap>
              <AdminProjectProfileModules />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-profile/export"
          element={
            <SuspenseWrap>
              <AdminProjectProfileExport />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-profile/reports"
          element={
            <SuspenseWrap>
              <AdminProjectProfileReports />
            </SuspenseWrap>
          }
        />

        <Route
          path="project-values/status"
          element={
            <SuspenseWrap>
              <AdminProjectValuesStatus />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/points"
          element={
            <SuspenseWrap>
              <AdminProjectValuesPoints />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/priorities"
          element={
            <SuspenseWrap>
              <AdminProjectValuesPriorities />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/severities"
          element={
            <SuspenseWrap>
              <AdminProjectValuesSeverities />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/types"
          element={
            <SuspenseWrap>
              <AdminProjectValuesTypes />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/custom-fields"
          element={
            <SuspenseWrap>
              <AdminProjectValuesCustomFields />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/tags"
          element={
            <SuspenseWrap>
              <AdminProjectValuesTags />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/due-dates"
          element={
            <SuspenseWrap>
              <AdminProjectValuesDueDates />
            </SuspenseWrap>
          }
        />
        <Route
          path="project-values/kanban-power-ups"
          element={
            <SuspenseWrap>
              <AdminProjectValuesKanbanPowerUps />
            </SuspenseWrap>
          }
        />

        <Route
          path="memberships"
          element={
            <SuspenseWrap>
              <AdminMemberships />
            </SuspenseWrap>
          }
        />
        <Route
          path="roles"
          element={
            <SuspenseWrap>
              <AdminRoles />
            </SuspenseWrap>
          }
        />

        <Route
          path="third-parties/webhooks"
          element={
            <SuspenseWrap>
              <AdminThirdPartiesWebhooks />
            </SuspenseWrap>
          }
        />
        <Route
          path="third-parties/github"
          element={
            <SuspenseWrap>
              <AdminThirdPartiesGithub />
            </SuspenseWrap>
          }
        />
        <Route
          path="third-parties/gitlab"
          element={
            <SuspenseWrap>
              <AdminThirdPartiesGitlab />
            </SuspenseWrap>
          }
        />
        <Route
          path="third-parties/bitbucket"
          element={
            <SuspenseWrap>
              <AdminThirdPartiesBitbucket />
            </SuspenseWrap>
          }
        />
        <Route
          path="third-parties/gogs"
          element={
            <SuspenseWrap>
              <AdminThirdPartiesGogs />
            </SuspenseWrap>
          }
        />

        <Route
          path="contrib/:plugin"
          element={
            <SuspenseWrap>
              <AdminContribPlugin />
            </SuspenseWrap>
          }
        />
      </Route>

      <Route path="*" element={<SimplePlaceholderPage title="Not found" />} />
    </Routes>
  );
}
