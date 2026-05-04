import { useNotifications } from '@/services/users';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { formatDistanceToNow } from 'date-fns';

export function NotificationsPage() {
  const { data, isLoading, error } = useNotifications();
  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No notifications" />;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <ul className="card divide-y divide-taiga-grey-lighter/40">
        {data.map((n) => (
          <li
            key={n.id}
            className={`px-4 py-3 ${n.read ? '' : 'bg-taiga-bg/40'}`}
          >
            <p className="text-sm">
              {n.changer?.full_name ?? `User #${n.changer?.id ?? '?'}`} ·{' '}
              <span className="text-taiga-grey-light">
                {n.created
                  ? `${formatDistanceToNow(new Date(n.created))} ago`
                  : ''}
              </span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
