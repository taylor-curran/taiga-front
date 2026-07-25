import { useQueryClient } from '@tanstack/react-query';
import { useNotifications } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { Avatar } from '../../components/Avatar';
import { useEvents } from '../../api/useEvents';
import { useAuth } from '../../api/auth';
import { formatRelative } from '../../utils/dates';
import { api } from '../../api/client';

export default function Notifications() {
  const { user } = useAuth();
  const { data, isLoading, refetch } = useNotifications();
  const qc = useQueryClient();
  useEvents(user ? `live_notifications.${user.id}` : null, () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
  });
  useEvents(user ? `web_notifications.${user.id}` : null, () => {
    qc.invalidateQueries({ queryKey: ['notifications'] });
  });

  if (isLoading) return <Loader />;
  const items = data?.objects ?? [];

  const markAllRead = async () => {
    await api().post('notifications/set_notifications_as_read', {});
    refetch();
  };

  return (
    <div className="mx-auto max-w-3xl p-6" data-testid="notifications">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800">Notifications</h1>
        {items.some((n) => !n.read) && (
          <button className="btn-secondary" onClick={markAllRead}>Mark all as read</button>
        )}
      </header>
      {items.length === 0 ? (
        <p className="mt-6 text-sm text-slate-500">No notifications.</p>
      ) : (
        <ul className="mt-5 divide-y divide-slate-100 card">
          {items.map((n) => (
            <li key={n.id} className={`flex gap-3 p-3 ${n.read ? '' : 'bg-taiga-50/50'}`}>
              <Avatar
                user={{
                  full_name: n.user.name,
                  photo: n.user.photo,
                  username: n.user.username,
                }}
                size={36}
              />
              <div className="flex-1">
                <div className="text-sm text-slate-700">
                  <strong>{n.changer_pretty_name || n.user.name}</strong>{' '}
                  {(n.events ?? []).join(', ')}
                </div>
                <div className="text-xs text-slate-400">{formatRelative(n.created)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
