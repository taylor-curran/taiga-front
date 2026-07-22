import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';

interface NotificationItem {
  id: number;
  read: string | null;
  created: string;
  event_type: string;
  data: { project?: { name?: string }; subject?: string; user?: { name?: string } };
}

export default function Notifications() {
  const { data: notifications, isPending } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<NotificationItem[]>('web-notifications'),
  });

  return (
    <main className="page" data-testid="notifications-page">
      <h1>Notifications</h1>
      {isPending && <p className="muted">Loading…</p>}
      {notifications && notifications.length === 0 && (
        <div className="empty">No notifications.</div>
      )}
      {notifications && notifications.length > 0 && (
        <ul className="list card" data-testid="notifications-list">
          {notifications.map((n) => (
            <li key={n.id}>
              <span className="grow">
                <strong>{n.data.user?.name ?? 'Someone'}</strong>{' '}
                <span className="muted">{n.event_type}</span>{' '}
                {n.data.subject && <em>“{n.data.subject}”</em>}
              </span>
              <span className="muted">{new Date(n.created).toLocaleString()}</span>
              {n.read && <span className="tag">read</span>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
