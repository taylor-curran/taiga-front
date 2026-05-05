import { FormEvent, useRef, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth';
import { Avatar } from '@/components/common/Avatar';
import { Empty } from '@/components/common/Empty';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import {
  useLocales,
  usePatchProfile,
  useChangeAvatar,
  useNotifyPolicies,
  usePatchNotifyPolicy,
  useUserProjectSettings,
  usePatchUserProjectSettings,
  changePassword,
  removeAvatar,
  sendVerificationEmail,
} from '@/services/users';

const NAV: { label: string; to: string }[] = [
  { label: 'Profile', to: '/user-settings/user-profile' },
  { label: 'Change password', to: '/user-settings/user-change-password' },
  { label: 'Project settings', to: '/user-settings/user-project-settings' },
  { label: 'Mail notifications', to: '/user-settings/mail-notifications' },
  { label: 'Live notifications', to: '/user-settings/live-notifications' },
  { label: 'Web notifications', to: '/user-settings/web-notifications' },
];

/* ================================================================== */
/*  Layout                                                             */
/* ================================================================== */

export function UserSettingsLayout() {
  const user = useAuth((s) => s.user);
  if (!user) return <Empty title="Sign in to access user settings" />;

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-12 md:col-span-3">
        <nav className="card p-2 space-y-1 sticky top-4">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx('nav-link', isActive && 'nav-link-active')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <section className="col-span-12 md:col-span-9">
        <Outlet />
      </section>
    </div>
  );
}

/* ================================================================== */
/*  Profile editing                                                    */
/* ================================================================== */

export function UserProfileSettings() {
  const user = useAuth((s) => s.user);
  const { data: locales } = useLocales();
  const patchProfile = usePatchProfile();
  const avatarMutation = useChangeAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<{
    username: string;
    email: string;
    full_name: string;
    bio: string;
    lang: string;
    theme: string;
  }>({
    username: user?.username ?? '',
    email: user?.email ?? '',
    full_name: user?.full_name ?? '',
    bio: user?.bio ?? '',
    lang: user?.lang ?? '',
    theme: user?.theme ?? '',
  });

  const [success, setSuccess] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  if (!user) return null;

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSuccess(null);
    try {
      const { full_name, bio, lang, theme } = form;
      await patchProfile.mutateAsync({ full_name, bio, lang, theme });
      setSuccess('Profile saved successfully.');
    } catch {
      // error is in patchProfile.error
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await avatarMutation.mutateAsync(file);
  }

  async function handleRemoveAvatar() {
    setRemoveError(null);
    try {
      await removeAvatar();
      const refreshMe = useAuth.getState().refreshMe;
      await refreshMe();
    } catch {
      setRemoveError('Failed to remove avatar.');
    }
  }

  async function handleVerifyEmail() {
    try {
      await sendVerificationEmail();
      setSuccess('Verification email sent.');
    } catch {
      // Ignore
    }
  }

  return (
    <article className="card p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Edit profile</h1>

      {patchProfile.error && <ErrorBox error={patchProfile.error} />}
      {avatarMutation.error && <ErrorBox error={avatarMutation.error} />}
      {removeError && <ErrorBox message={removeError} />}
      {success && (
        <div className="border border-taiga-green-dark/40 bg-taiga-green-dark/10 text-taiga-green-dark rounded p-3 text-sm">
          {success}
        </div>
      )}

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar
          name={user.full_name_display || user.full_name || user.username}
          src={user.photo}
          size={72}
        />
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarMutation.isPending}
          >
            {avatarMutation.isPending ? 'Uploading...' : 'Change photo'}
          </button>
          <button
            type="button"
            className="btn-ghost text-sm ml-2"
            onClick={handleRemoveAvatar}
          >
            Use Gravatar
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Username</span>
          <input
            className="input"
            value={form.username}
            onChange={(e) => handleChange('username', e.target.value)}
            required
            maxLength={255}
            pattern="[\w.\-]+"
            autoComplete="username"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">
            Email
            {user.verified_email === false && (
              <button
                type="button"
                className="ml-2 text-xs text-taiga-link hover:underline"
                onClick={handleVerifyEmail}
              >
                Verify email
              </button>
            )}
          </span>
          <input
            className="input"
            type="email"
            value={form.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
            maxLength={255}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Full name</span>
          <input
            className="input"
            value={form.full_name}
            onChange={(e) => handleChange('full_name', e.target.value)}
            required
            maxLength={256}
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Language</span>
          <select
            className="input"
            value={form.lang}
            onChange={(e) => handleChange('lang', e.target.value)}
          >
            <option value="">Default</option>
            {locales?.map((loc) => (
              <option key={loc.code} value={loc.code}>
                {loc.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Theme</span>
          <select
            className="input"
            value={form.theme}
            onChange={(e) => handleChange('theme', e.target.value)}
          >
            <option value="">Default</option>
            <option value="taiga">taiga</option>
            <option value="material-design">material-design</option>
            <option value="high-contrast">high-contrast</option>
          </select>
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Bio</span>
          <textarea
            className="input min-h-[80px]"
            value={form.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            maxLength={210}
          />
        </label>

        <button
          className="btn-primary"
          type="submit"
          disabled={patchProfile.isPending}
        >
          {patchProfile.isPending ? 'Saving...' : 'Save'}
        </button>
      </form>
    </article>
  );
}

/* ================================================================== */
/*  Change password                                                    */
/* ================================================================== */

export function ChangePasswordSettings() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword1, setNewPassword1] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword1 !== newPassword2) {
      setError('New passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword1);
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword1('');
      setNewPassword2('');
    } catch (err) {
      const detail =
        (err as { response?: { data?: { _error_message?: string } } })?.response?.data
          ?._error_message || 'Failed to change password.';
      setError(detail);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <article className="card p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Change password</h1>

      {error && <ErrorBox message={error} />}
      {success && (
        <div className="border border-taiga-green-dark/40 bg-taiga-green-dark/10 text-taiga-green-dark rounded p-3 text-sm">
          Password changed successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <label className="block">
          <span className="block text-sm font-medium mb-1">Current password</span>
          <input
            className="input"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">New password</span>
          <input
            className="input"
            type="password"
            value={newPassword1}
            onChange={(e) => setNewPassword1(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        <label className="block">
          <span className="block text-sm font-medium mb-1">Retype new password</span>
          <input
            className="input"
            type="password"
            value={newPassword2}
            onChange={(e) => setNewPassword2(e.target.value)}
            required
            autoComplete="new-password"
          />
        </label>

        <button className="btn-primary" type="submit" disabled={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </button>
      </form>
    </article>
  );
}

/* ================================================================== */
/*  Project settings (homepage per project)                            */
/* ================================================================== */

const SECTIONS: { id: number; title: string }[] = [
  { id: 1, title: 'Timeline' },
  { id: 2, title: 'Backlog' },
  { id: 3, title: 'Kanban' },
  { id: 4, title: 'Issues' },
  { id: 5, title: 'Wiki' },
];

export function ProjectSettings() {
  const { data, isLoading, error } = useUserProjectSettings();
  const patchSettings = usePatchUserProjectSettings();

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No project settings available" />;

  return (
    <article className="card p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Project settings</h1>
      <p className="text-sm text-taiga-grey-light">
        Set the start page for each project.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-taiga-grey-lighter text-left">
              <th className="py-2 px-3 font-medium">Project</th>
              <th className="py-2 px-3 font-medium">Start page</th>
            </tr>
          </thead>
          <tbody>
            {data.map((ps) => {
              const filteredSections = SECTIONS.filter(
                (s) => !ps.allowed_sections || ps.allowed_sections.includes(s.id),
              );
              return (
                <tr key={ps.id} className="border-b border-taiga-grey-lighter/40">
                  <td className="py-2 px-3">{ps.project_name}</td>
                  <td className="py-2 px-3">
                    <select
                      className="input text-sm py-1"
                      value={ps.homepage}
                      onChange={(e) =>
                        patchSettings.mutate({
                          id: ps.id,
                          homepage: Number(e.target.value),
                        })
                      }
                    >
                      {filteredSections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

/* ================================================================== */
/*  Mail notifications                                                 */
/* ================================================================== */

export function MailNotifications() {
  const { data, isLoading, error } = useNotifyPolicies();
  const patchPolicy = usePatchNotifyPolicy();

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No notification policies" />;

  return (
    <article className="card p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Mail notifications</h1>
      <p className="text-sm text-taiga-grey-light">
        Configure email notification level per project.
      </p>
      <NotifyPolicyTable
        policies={data}
        field="notify_level"
        onLevelChange={(id, level) =>
          patchPolicy.mutate({ id, notify_level: level })
        }
      />
    </article>
  );
}

/* ================================================================== */
/*  Live notifications                                                 */
/* ================================================================== */

export function LiveNotifications() {
  const { data, isLoading, error } = useNotifyPolicies();
  const patchPolicy = usePatchNotifyPolicy();

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No notification policies" />;

  return (
    <article className="card p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Live notifications</h1>
      <p className="text-sm text-taiga-grey-light">
        Configure real-time notification level per project.
      </p>
      <NotifyPolicyTable
        policies={data}
        field="live_notify_level"
        onLevelChange={(id, level) =>
          patchPolicy.mutate({ id, live_notify_level: level })
        }
      />
    </article>
  );
}

/* ================================================================== */
/*  Web notifications                                                  */
/* ================================================================== */

export function WebNotifications() {
  const { data, isLoading, error } = useNotifyPolicies();
  const patchPolicy = usePatchNotifyPolicy();

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No notification policies" />;

  return (
    <article className="card p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Web notifications</h1>
      <p className="text-sm text-taiga-grey-light">
        Enable or disable web push notifications per project.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-taiga-grey-lighter text-left">
              <th className="py-2 px-3 font-medium">Project</th>
              <th className="py-2 px-3 font-medium">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {data.map((policy) => (
              <tr key={policy.id} className="border-b border-taiga-grey-lighter/40">
                <td className="py-2 px-3">{policy.project_name}</td>
                <td className="py-2 px-3">
                  <label className="inline-flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={policy.web_notify_level}
                      onChange={() =>
                        patchPolicy.mutate({
                          id: policy.id,
                          web_notify_level: !policy.web_notify_level,
                        })
                      }
                      className="w-4 h-4 rounded border-taiga-grey-lighter accent-taiga-green-dark"
                    />
                    <span>{policy.web_notify_level ? 'Yes' : 'No'}</span>
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

/* ================================================================== */
/*  Shared notify policy table (mail & live)                           */
/* ================================================================== */

const NOTIFY_LEVELS: { value: number; label: string }[] = [
  { value: 2, label: 'All' },
  { value: 1, label: 'Only involved' },
  { value: 3, label: 'None' },
];

function NotifyPolicyTable({
  policies,
  field,
  onLevelChange,
}: {
  policies: import('@/types/api').NotifyPolicy[];
  field: 'notify_level' | 'live_notify_level';
  onLevelChange: (id: number, level: number) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-taiga-grey-lighter text-left">
            <th className="py-2 px-3 font-medium">Project</th>
            {NOTIFY_LEVELS.map((nl) => (
              <th key={nl.value} className="py-2 px-3 font-medium text-center">
                {nl.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {policies.map((policy) => (
            <tr key={policy.id} className="border-b border-taiga-grey-lighter/40">
              <td className="py-2 px-3">{policy.project_name}</td>
              {NOTIFY_LEVELS.map((nl) => (
                <td key={nl.value} className="py-2 px-3 text-center">
                  <input
                    type="radio"
                    name={`policy-${field}-${policy.id}`}
                    checked={policy[field] === nl.value}
                    onChange={() => onLevelChange(policy.id, nl.value)}
                    className="w-4 h-4 accent-taiga-green-dark"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
