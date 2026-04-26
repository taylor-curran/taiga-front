import { lazy } from 'react';
import type { ComponentType } from 'react';

function userSettingsPage(title: string): ComponentType {
  return lazy(async () => {
    const { UserSettingsPlaceholderPage } = await import('../pages/UserSettingsPlaceholderPage');
    function RoutePage() {
      return <UserSettingsPlaceholderPage title={title} />;
    }
    return { default: RoutePage };
  });
}

export const UserSettingsProfile = userSettingsPage('User settings — User profile');
export const UserSettingsChangePassword = userSettingsPage('User settings — Change password');
export const UserSettingsProjectSettings = userSettingsPage('User settings — Project settings');
export const UserSettingsMailNotifications = userSettingsPage('User settings — Mail notifications');
export const UserSettingsLiveNotifications = userSettingsPage('User settings — Live notifications');
export const UserSettingsWebNotifications = userSettingsPage('User settings — Web notifications');
export const UserSettingsContribPlugin = userSettingsPage('User settings — Contrib plugin');
