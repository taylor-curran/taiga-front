import { useOutletContext } from 'react-router-dom';
import { useMemberships } from '@/projects/queries';
import { Avatar } from '@/components/Avatar';
import type { ProjectDetail } from '@/api/types';

export default function Team() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { data: memberships } = useMemberships(project.id);

  const active = (memberships ?? []).filter((m) => m.is_user_active);

  return (
    <div data-testid="team">
      <h1>Team</h1>
      {active.length === 0 ? (
        <div className="empty">No members.</div>
      ) : (
        <table className="tg-table" data-testid="team-table">
          <thead>
            <tr>
              <th></th>
              <th>Member</th>
              <th>Role</th>
              <th>Admin</th>
            </tr>
          </thead>
          <tbody>
            {active.map((m) => (
              <tr key={m.id} data-testid={`member-${m.id}`}>
                <td>
                  <Avatar
                    user={{ photo: m.photo, gravatar_id: m.gravatar_id, full_name_display: m.full_name }}
                    size={28}
                  />
                </td>
                <td>{m.full_name}</td>
                <td>{m.role_name}</td>
                <td>{m.is_admin ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
