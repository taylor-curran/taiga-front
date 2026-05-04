import { useCurrentProject } from '@/hooks/useCurrentProject';
import { Avatar } from '@/components/common/Avatar';
import { Empty } from '@/components/common/Empty';

export function TeamPage() {
  const project = useCurrentProject();
  const members = project.members ?? [];
  if (members.length === 0) {
    return <Empty title="No members yet" />;
  }
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Team ({members.length})</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {members.map((m) => (
          <div key={m.id} className="card p-4 flex items-center gap-3">
            <Avatar
              name={m.full_name || m.username}
              src={m.photo}
              size={48}
              className="shrink-0"
            />
            <div className="min-w-0">
              <p className="font-semibold truncate">
                {m.full_name || m.username || `User #${m.user ?? m.id}`}
              </p>
              {m.role_name && (
                <p className="text-xs text-taiga-grey-light">{m.role_name}</p>
              )}
              {m.is_admin && <span className="badge mt-1 inline-block">Admin</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
