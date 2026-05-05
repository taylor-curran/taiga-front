import { useNotifyPolicies } from '@/services/users';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { Link } from 'react-router-dom';

export function NotificationsPage() {
  const { data, isLoading, error } = useNotifyPolicies();

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No notification policies configured" />;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Notifications</h1>
      <p className="text-sm text-taiga-grey-light">
        Overview of your notification settings. Edit them in{' '}
        <Link to="/user-settings/mail-notifications" className="text-taiga-link hover:underline">
          settings
        </Link>
        .
      </p>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-taiga-grey-lighter text-left">
              <th className="py-2 px-4 font-medium">Project</th>
              <th className="py-2 px-4 font-medium">Mail</th>
              <th className="py-2 px-4 font-medium">Live</th>
              <th className="py-2 px-4 font-medium">Web</th>
            </tr>
          </thead>
          <tbody>
            {data.map((policy) => (
              <tr key={policy.id} className="border-b border-taiga-grey-lighter/40">
                <td className="py-2 px-4">{policy.project_name}</td>
                <td className="py-2 px-4">
                  <LevelBadge level={policy.notify_level} />
                </td>
                <td className="py-2 px-4">
                  <LevelBadge level={policy.live_notify_level} />
                </td>
                <td className="py-2 px-4">
                  <span className={policy.web_notify_level ? 'text-taiga-green-dark' : 'text-taiga-grey-light'}>
                    {policy.web_notify_level ? 'On' : 'Off'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LevelBadge({ level }: { level: number }) {
  const labels: Record<number, string> = { 1: 'Involved', 2: 'All', 3: 'None' };
  const colors: Record<number, string> = {
    1: 'text-taiga-link',
    2: 'text-taiga-green-dark',
    3: 'text-taiga-grey-light',
  };
  return <span className={colors[level] || 'text-taiga-grey'}>{labels[level] || `Level ${level}`}</span>;
}
