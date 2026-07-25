import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { FormEvent, useEffect, useState } from 'react';
import { useAuth } from '../../api/auth';
import { useMe, useMyProjects, useNotificationsPolicies, useUpdateMe } from '../../api/resources';
import { Avatar } from '../../components/Avatar';
import { Loader } from '../../components/Loader';
import { api } from '../../api/client';
import { toast } from '../../components/Toast';

const SECTIONS = [
  { to: '/user-settings/user-profile', label: 'Profile' },
  { to: '/user-settings/user-change-password', label: 'Password' },
  { to: '/user-settings/user-project-settings', label: 'Project preferences' },
  { to: '/user-settings/mail-notifications', label: 'Email notifications' },
  { to: '/user-settings/live-notifications', label: 'Live notifications' },
  { to: '/user-settings/web-notifications', label: 'Web notifications' },
];

export function UserSettingsLayout() {
  const loc = useLocation();
  return (
    <div className="mx-auto max-w-5xl p-6" data-testid="user-settings">
      <h1 className="text-2xl font-semibold text-slate-800">Account settings</h1>
      <div className="mt-4 grid gap-6 lg:grid-cols-[200px_1fr]">
        <aside className="card p-2">
          <nav className="flex flex-col text-sm">
            {SECTIONS.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                className={({ isActive }) =>
                  `rounded px-3 py-2 ${isActive || loc.pathname === s.to ? 'bg-taiga-100 text-taiga-800 font-semibold' : 'text-slate-600 hover:bg-slate-50'}`
                }
              >
                {s.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <section className="card p-5">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export function UserProfileSettings() {
  const { data: me, isLoading, refetch } = useMe();
  const { setUser } = useAuth();
  const update = useUpdateMe();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [lang, setLang] = useState('');
  const [theme, setTheme] = useState('');

  useEffect(() => {
    if (me) {
      setFullName(me.full_name || '');
      setEmail(me.email || '');
      setBio(me.bio || '');
      setLang(me.lang || '');
      setTheme(me.theme || '');
    }
  }, [me]);

  if (isLoading || !me) return <Loader />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const updated = await update.mutateAsync({ full_name: fullName, email, bio, lang, theme });
    setUser({ ...me, ...updated });
    await refetch();
    toast.success('Profile saved');
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar user={me} size={64} />
        <div>
          <h2 className="text-lg font-semibold">{me.full_name_display || me.username}</h2>
          <p className="text-sm text-slate-500">@{me.username}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Full name</label>
          <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
        </div>
        <div>
          <label className="label">Language</label>
          <input className="input" placeholder="en" value={lang} onChange={(e) => setLang(e.target.value)} />
        </div>
        <div>
          <label className="label">Theme</label>
          <input className="input" placeholder="taiga" value={theme} onChange={(e) => setTheme(e.target.value)} />
        </div>
      </div>
      <div>
        <label className="label">Bio</label>
        <textarea className="input min-h-[100px]" value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>
      <button className="btn-primary" disabled={update.isPending}>{update.isPending ? 'Saving…' : 'Save profile'}</button>
    </form>
  );
}

export function ChangePassword() {
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api().post('users/change_password', { current_password: current, password: next });
      toast.success('Password changed');
      setCurrent('');
      setNext('');
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { _error_message?: string } } };
      setError(ax?.response?.data?._error_message || 'Could not change password');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <h2 className="text-lg font-semibold">Change password</h2>
      <div>
        <label className="label">Current password</label>
        <input className="input" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} />
      </div>
      <div>
        <label className="label">New password</label>
        <input className="input" type="password" required value={next} onChange={(e) => setNext(e.target.value)} />
      </div>
      {error && <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      <button className="btn-primary" disabled={busy}>{busy ? 'Updating…' : 'Update password'}</button>
    </form>
  );
}

export function ProjectPreferences() {
  const { data: projects, isLoading } = useMyProjects();
  if (isLoading) return <Loader />;
  return (
    <div>
      <h2 className="text-lg font-semibold">Project preferences</h2>
      <p className="mt-1 text-sm text-slate-500">Per-project settings (membership-based).</p>
      <ul className="mt-4 divide-y divide-slate-100 card">
        {(projects ?? []).map((p) => (
          <li key={p.id} className="flex items-center justify-between p-3">
            <div className="text-sm">
              <Link to={`/project/${p.slug}/`} className="font-semibold text-slate-800 hover:text-taiga-700">{p.name}</Link>
              <p className="text-xs text-slate-500">{p.is_private ? 'Private' : 'Public'}</p>
            </div>
            <Link to={`/project/${p.slug}/admin/project-profile/details`} className="text-xs text-taiga-700 hover:underline">
              Manage →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function MailNotifications() {
  return <NotificationPolicies title="Email notifications" description="When should we send you an email?" />;
}
export function LiveNotifications() {
  return <NotificationPolicies title="Live notifications" description="In-product live notifications." />;
}
export function WebNotifications() {
  return <NotificationPolicies title="Web notifications" description="Browser desktop notifications." />;
}

function NotificationPolicies({ title, description }: { title: string; description: string }) {
  const { data: projects } = useMyProjects();
  const projectId = projects?.[0]?.id;
  const { data: policies, isLoading } = useNotificationsPolicies(projectId);
  return (
    <div>
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
      {isLoading ? (
        <Loader />
      ) : (
        <ul className="mt-4 divide-y divide-slate-100 card text-sm">
          {((policies as Array<Record<string, unknown>>) ?? []).map((p, i) => (
            <li key={i} className="p-3">
              {String((p as { project_name?: string }).project_name ?? '')} —{' '}
              {String((p as { notify_level?: number }).notify_level ?? '')}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
