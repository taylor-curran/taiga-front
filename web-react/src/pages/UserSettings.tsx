import { type ReactNode, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/auth/store';
import { api, ApiError } from '@/api/client';

const SECTIONS: Array<{ to: string; label: string }> = [
  { to: '/user-settings/user-profile', label: 'Profile' },
  { to: '/user-settings/user-change-password', label: 'Change password' },
  { to: '/user-settings/user-project-settings', label: 'Project settings' },
  { to: '/user-settings/mail-notifications', label: 'Mail notifications' },
  { to: '/user-settings/live-notifications', label: 'Live notifications' },
  { to: '/user-settings/web-notifications', label: 'Web notifications' },
];

export function UserSettingsShell() {
  return (
    <main className="page" data-testid="user-settings-shell">
      <h1>Settings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '1.5rem' }}>
        <aside className="card" style={{ padding: 0 }}>
          <nav style={{ display: 'flex', flexDirection: 'column' }}>
            {SECTIONS.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                style={({ isActive }) => ({
                  padding: '0.5rem 0.9rem',
                  background: isActive ? 'var(--bg)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-strong)' : '3px solid transparent',
                  color: 'var(--fg)',
                })}
              >
                {s.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section><Outlet /></section>
      </div>
    </main>
  );
}

function Banner({ children, kind }: { children: ReactNode; kind: 'error' | 'info' }) {
  return <div className={`banner banner-${kind}`}>{children}</div>;
}

export function UserProfile() {
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit } = useForm({
    defaultValues: {
      full_name: user?.full_name ?? '',
      email: user?.email ?? '',
      bio: user?.bio ?? '',
      lang: user?.lang ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setMsg(null); setErr(null);
    if (!user) return;
    try {
      const updated = await api.patch(`users/${user.id}`, values);
      setUser({ ...user, ...(updated as Record<string, unknown>) } as never);
      setMsg('Profile updated.');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not update profile.');
    }
  });

  return (
    <div data-testid="user-profile-form">
      <h2>Profile</h2>
      {msg && <Banner kind="info">{msg}</Banner>}
      {err && <Banner kind="error">{err}</Banner>}
      <form onSubmit={onSubmit}>
        <fieldset><label>Full name</label><input {...register('full_name')} /></fieldset>
        <fieldset><label>Email</label><input type="email" {...register('email')} /></fieldset>
        <fieldset><label>Language</label><input {...register('lang')} placeholder="en" /></fieldset>
        <fieldset><label>Bio</label><textarea {...register('bio')} /></fieldset>
        <fieldset className="end" style={{ marginTop: '0.6rem' }}>
          <button className="btn" type="submit">Save</button>
        </fieldset>
      </form>
    </div>
  );
}

export function ChangePassword() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, watch, reset } = useForm({
    defaultValues: { current_password: '', password: '', passwordConfirm: '' },
  });
  const pwd = watch('password');

  const mutation = useMutation({
    mutationFn: (data: { current_password: string; password: string }) =>
      api.post('users/change_password', data),
  });

  const onSubmit = handleSubmit(async (values) => {
    setMsg(null); setErr(null);
    if (values.password !== values.passwordConfirm) {
      setErr('Passwords do not match.');
      return;
    }
    try {
      await mutation.mutateAsync({ current_password: values.current_password, password: values.password });
      setMsg('Password updated.');
      reset();
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not change password.');
    }
  });

  return (
    <div data-testid="user-change-password">
      <h2>Change password</h2>
      {msg && <Banner kind="info">{msg}</Banner>}
      {err && <Banner kind="error">{err}</Banner>}
      <form onSubmit={onSubmit}>
        <fieldset><label>Current password</label><input type="password" {...register('current_password', { required: true })} /></fieldset>
        <fieldset><label>New password</label><input type="password" {...register('password', { required: true, minLength: 6 })} /></fieldset>
        <fieldset><label>Confirm</label><input type="password" {...register('passwordConfirm', { required: true, validate: (v) => v === pwd || 'Mismatch' })} /></fieldset>
        <fieldset className="end" style={{ marginTop: '0.6rem' }}>
          <button className="btn" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Change password'}
          </button>
        </fieldset>
      </form>
    </div>
  );
}

export function MailNotifications() {
  return (
    <div data-testid="user-mail-notifications">
      <h2>Mail notifications</h2>
      <p className="muted">Configure mail-notification preferences for each project from its admin section.</p>
    </div>
  );
}

export function LiveNotifications() {
  const user = useAuth((s) => s.user);
  return (
    <div data-testid="user-live-notifications">
      <h2>Live notifications</h2>
      <p className="muted">In-browser desktop notifications are toggled by your browser.</p>
      <p className="muted">Signed in as {user?.username}.</p>
    </div>
  );
}

export function WebNotifications() {
  return (
    <div data-testid="user-web-notifications">
      <h2>Web notifications</h2>
      <p className="muted">Web notifications appear in the bell at the top right.</p>
    </div>
  );
}

export function ProjectSettings() {
  return (
    <div data-testid="user-project-settings">
      <h2>Project settings</h2>
      <p className="muted">No per-user project preferences to set right now.</p>
    </div>
  );
}

export function ChangeEmail() {
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async () => {
    const token = window.location.pathname.split('/').pop()!;
    try {
      await api.post('users/change_email', { email_token: token });
      setMsg('Email updated.');
      navigate('/');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not change email.');
    }
  };

  return (
    <main className="page" data-testid="change-email-page">
      <h1>Confirm new email</h1>
      {msg && <Banner kind="info">{msg}</Banner>}
      {err && <Banner kind="error">{err}</Banner>}
      <button className="btn" type="button" onClick={onSubmit}>Confirm change</button>
    </main>
  );
}
export function VerifyEmail() {
  return <ChangeEmail />;
}
export function CancelAccount() {
  const navigate = useNavigate();
  const logout = useAuth((s) => s.logout);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async () => {
    const token = window.location.pathname.split('/').pop()!;
    try {
      await api.post('users/cancel', { cancel_token: token });
      logout();
      navigate('/');
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : 'Could not cancel account.');
    }
  };

  return (
    <main className="page" data-testid="cancel-account-page">
      <h1>Cancel account</h1>
      {err && <Banner kind="error">{err}</Banner>}
      <p className="muted">This action permanently disables your account.</p>
      <button className="btn btn-danger" type="button" onClick={onSubmit}>Cancel my account</button>
    </main>
  );
}
