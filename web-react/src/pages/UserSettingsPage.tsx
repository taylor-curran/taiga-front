import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { users } from '../api/resources';
import { useAuthStore } from '../stores/auth';

function UserProfileSettings() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [lang, setLang] = useState(user?.lang || 'en');

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const res = await users.update(user.id, { full_name: fullName, bio, lang } as Record<string, unknown>);
      return res.data;
    },
    onSuccess: (data) => {
      if (data) setUser(data);
    },
  });

  return (
    <div className="settings-form">
      <h2>User Profile</h2>
      <div className="form-field">
        <label>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="form-field">
        <label>Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />
      </div>
      <div className="form-field">
        <label>Language</label>
        <select value={lang} onChange={(e) => setLang(e.target.value)}>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="ja">Japanese</option>
        </select>
      </div>
      <button className="btn btn-primary" onClick={() => updateMutation.mutate()}>
        Save
      </button>
    </div>
  );
}

function ChangePasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const changeMutation = useMutation({
    mutationFn: () => users.changePassword({ current_password: currentPassword, password: newPassword }),
    onSuccess: () => {
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setError('');
    },
    onError: () => setError('Failed to change password'),
  });

  return (
    <div className="settings-form">
      <h2>Change Password</h2>
      {error && <div className="auth-error">{error}</div>}
      {success && <div className="success-message">Password changed successfully</div>}
      <div className="form-field">
        <label>Current password</label>
        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
      </div>
      <div className="form-field">
        <label>New password</label>
        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <button className="btn btn-primary" onClick={() => changeMutation.mutate()} disabled={!currentPassword || !newPassword}>
        Change password
      </button>
    </div>
  );
}

function MailNotificationsSettings() {
  return (
    <div className="settings-form">
      <h2>Email Notifications</h2>
      <p>Configure your email notification preferences for each project.</p>
    </div>
  );
}

export default function UserSettingsPage() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <div className="user-settings-page">
      <div className="settings-sidebar">
        <h2>Settings</h2>
        <nav>
          <NavLink to="/user-settings/user-profile" className={({ isActive }) => isActive ? 'active' : ''}>
            Profile
          </NavLink>
          <NavLink to="/user-settings/user-change-password" className={({ isActive }) => isActive ? 'active' : ''}>
            Change password
          </NavLink>
          <NavLink to="/user-settings/mail-notifications" className={({ isActive }) => isActive ? 'active' : ''}>
            Email notifications
          </NavLink>
          <NavLink to="/user-settings/live-notifications" className={({ isActive }) => isActive ? 'active' : ''}>
            Live notifications
          </NavLink>
        </nav>
      </div>
      <div className="settings-content">
        {path.endsWith('user-profile') && <UserProfileSettings />}
        {path.endsWith('user-change-password') && <ChangePasswordSettings />}
        {path.endsWith('mail-notifications') && <MailNotificationsSettings />}
        {path.endsWith('live-notifications') && <MailNotificationsSettings />}
        {path.endsWith('web-notifications') && <MailNotificationsSettings />}
        <Outlet />
      </div>
    </div>
  );
}
