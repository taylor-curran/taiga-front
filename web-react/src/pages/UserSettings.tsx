import { NavLink, Outlet } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/lib/auth';
import { Empty } from '@/components/common/Empty';

const NAV: { label: string; to: string }[] = [
  { label: 'Profile', to: '/user-settings/user-profile' },
  { label: 'Change password', to: '/user-settings/user-change-password' },
  { label: 'Project settings', to: '/user-settings/user-project-settings' },
  { label: 'Mail notifications', to: '/user-settings/mail-notifications' },
  { label: 'Live notifications', to: '/user-settings/live-notifications' },
  { label: 'Web notifications', to: '/user-settings/web-notifications' },
];

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

export function UserProfileSettings() {
  const user = useAuth((s) => s.user);
  if (!user) return null;
  return (
    <article className="card p-6 space-y-3">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <Field label="Username" value={user.username} />
        <Field label="Email" value={user.email} />
        <Field label="Full name" value={user.full_name_display || user.full_name} />
        <Field label="Language" value={user.lang} />
        <Field label="Theme" value={user.theme} />
      </dl>
      <p className="text-xs text-taiga-grey-light">
        Read-only in the React port. Editing lives in the legacy AngularJS app
        for now.
      </p>
    </article>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-taiga-grey-light">{label}</dt>
      <dd className="font-medium">{value || '—'}</dd>
    </div>
  );
}
