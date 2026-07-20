import { Link, useOutletContext, useSearchParams } from 'react-router-dom';
import { useMembershipsList } from '../hooks/useMembershipsList';
import type { AdminProject } from '../hooks/useProjectBySlug';

export function AdminMembershipsPage() {
  const { project } = useOutletContext<{ project: AdminProject }>();
  const [sp] = useSearchParams();
  const page = Math.max(1, parseInt(sp.get('page') ?? '1', 10) || 1);
  const { rows, pagination, loading, error } = useMembershipsList(project.id, page);

  const canAdd = project.max_memberships == null || project.max_memberships > (project.total_memberships ?? 0);

  if (loading) return <p className="centered">Loading…</p>;
  if (error) return <p className="centered">{error}</p>;

  const totalPages =
    pagination && pagination.paginatedBy > 0 ? Math.max(1, Math.ceil(pagination.count / pagination.paginatedBy)) : 1;

  return (
    <section className="main admin-membership admin-common">
      <div className="header-with-actions">
        <header>
          <h1>Members</h1>
          <p className="admin-subtitle">{project.name}</p>
          {!canAdd && <div className="header-message">This project has reached its member limit.</div>}
        </header>
      </div>

      <section className="admin-membership-table basic-table">
        <div className="row title">
          <div className="header-member">Member</div>
          <div className="header-admin">Admin</div>
          <div className="header-role">Role</div>
          <div className="header-status">Status</div>
        </div>
        {rows.map((member) => (
          <div key={member.id} className="row">
            <div className="row-member">
              <div className="avatar">
                {member.photo ? <img src={member.photo} alt="" /> : <div className="avatar-placeholder" />}
                <div className="user-data">
                  <div className="name">
                    {member.user ? member.full_name_display || member.username : member.user_email}
                    {member.is_owner && <span className="badge">Owner</span>}
                  </div>
                  <div className="data">{member.user ? member.user_email : null}</div>
                  {!member.user && <span className="pending">(pending)</span>}
                </div>
              </div>
            </div>
            <div className="row-admin">
              <label>
                <input type="checkbox" checked={member.is_admin} readOnly /> Admin
              </label>
            </div>
            <div className="row-role">{member.role_name}</div>
            <div className="row-status">
              <span className={`status-pill${member.user ? ' active' : ' pending'}`}>{member.user ? 'Active' : 'Pending'}</span>
            </div>
          </div>
        ))}
      </section>

      <div className="paginator memberships-paginator">
        {page > 1 && (
          <Link to={`?page=${page - 1}`} replace>
            Previous
          </Link>
        )}
        <span>
          Page {pagination?.current ?? page} of {totalPages}
        </span>
        {page < totalPages && (
          <Link to={`?page=${page + 1}`} replace>
            Next
          </Link>
        )}
      </div>
    </section>
  );
}
