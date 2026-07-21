import { useQuery } from '@tanstack/react-query';
import { useOutletContext, Link } from 'react-router-dom';
import { memberships } from '../api/resources';
import type { Project, Membership } from '../types';
import Loader from '../components/common/Loader';
import { getAvatarUrl } from '../utils/gravatar';

export default function TeamPage() {
  const { project } = useOutletContext<{ project: Project }>();

  const { data: membersList, isLoading } = useQuery({
    queryKey: ['memberships', project.id],
    queryFn: async () => {
      const res = await memberships.list(project.id);
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="team-page">
      <h1>Team</h1>
      <div className="team-grid">
        {membersList?.map((member: Membership) => (
          <div key={member.id} className="team-card">
            <img
              src={getAvatarUrl(member)}
              alt={member.full_name}
              className="team-avatar"
            />
            <div className="team-info">
              <Link to={`/profile/${member.user}`} className="team-name">
                {member.full_name || member.email}
              </Link>
              <span className="team-role">{member.role_name}</span>
              {member.is_admin && <span className="badge badge-admin">Admin</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
