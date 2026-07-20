import { lazy } from 'react';
import type { ComponentType } from 'react';
import type { AdminPlaceholderPageProps } from '../pages/AdminPlaceholderPage';

function adminPage(title: AdminPlaceholderPageProps['title']): ComponentType {
  return lazy(async () => {
    const { AdminPlaceholderPage } = await import('../pages/AdminPlaceholderPage');
    function RoutePage() {
      return <AdminPlaceholderPage title={title} />;
    }
    return { default: RoutePage };
  });
}

export const AdminProjectProfileDetails = adminPage('Admin — Project profile — Details');
export const AdminProjectProfileDefaultValues = adminPage('Admin — Project profile — Default values');
export const AdminProjectProfileModules = adminPage('Admin — Project profile — Modules');
export const AdminProjectProfileExport = adminPage('Admin — Project profile — Export');
export const AdminProjectProfileReports = adminPage('Admin — Project profile — Reports');

export const AdminProjectValuesStatus = adminPage('Admin — Project values — Status');
export const AdminProjectValuesPoints = adminPage('Admin — Project values — Points');
export const AdminProjectValuesPriorities = adminPage('Admin — Project values — Priorities');
export const AdminProjectValuesSeverities = adminPage('Admin — Project values — Severities');
export const AdminProjectValuesTypes = adminPage('Admin — Project values — Types');
export const AdminProjectValuesCustomFields = adminPage('Admin — Project values — Custom fields');
export const AdminProjectValuesTags = adminPage('Admin — Project values — Tags');
export const AdminProjectValuesDueDates = adminPage('Admin — Project values — Due dates');
export const AdminProjectValuesKanbanPowerUps = adminPage('Admin — Project values — Kanban power-ups');

export const AdminMemberships = adminPage('Admin — Memberships');
export const AdminRoles = adminPage('Admin — Roles & permissions');

export const AdminThirdPartiesWebhooks = adminPage('Admin — Integrations — Webhooks');
export const AdminThirdPartiesGithub = adminPage('Admin — Integrations — GitHub');
export const AdminThirdPartiesGitlab = adminPage('Admin — Integrations — GitLab');
export const AdminThirdPartiesBitbucket = adminPage('Admin — Integrations — Bitbucket');
export const AdminThirdPartiesGogs = adminPage('Admin — Integrations — Gogs');

export const AdminContribPlugin = adminPage('Admin — Contrib plugin');
