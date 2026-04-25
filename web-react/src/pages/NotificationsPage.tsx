import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notifications as notificationsApi } from '../api/resources';
import type { WebNotification } from '../types';
import Loader from '../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifs, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationsApi.list();
      return res.data;
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.setAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <button className="btn btn-secondary" onClick={() => markAllReadMutation.mutate()}>
          Mark all as read
        </button>
      </div>
      <div className="notifications-list">
        {notifs?.map((n: WebNotification) => (
          <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
            <div className="notification-content">
              <span className="notification-type">Event #{n.event_type}</span>
              <span className="notification-date">
                {formatDistanceToNow(new Date(n.created), { addSuffix: true })}
              </span>
            </div>
          </div>
        ))}
        {(!notifs || notifs.length === 0) && (
          <div className="empty-state"><p>No notifications</p></div>
        )}
      </div>
    </div>
  );
}
