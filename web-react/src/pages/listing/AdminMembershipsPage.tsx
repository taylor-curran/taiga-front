import { en } from '@/i18n/en';
import { useParams, useSearchParams } from 'react-router';
import { useCallback, useMemo } from 'react';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { getProjectBySlug, listMembers } from '@/api/adminProject';
import { membershipAvatarSrc } from './avatarUrl';
import type { TaigaMembership, TaigaProjectSlight, Paginated } from '@/api/types';
import { LoadingScreen } from '@/components/LoadingScreen';
import './listing.css';

function MemberRow({ m, projectRoles }: { m: TaigaMembership; projectRoles: { id: number; name: string }[] }) {
  const displayName = m.full_name || m.user_email || m.email || '—';
  const role = projectRoles.find((r) => r.id === m.role);
  const isPending = m.user == null;
  return (
    <div className="tg-row" data-testid="membership-row" data-member-id={m.id}>
      <div className="tg-col--member">
        <div className="tg-mship-avatar">
          <img src={membershipAvatarSrc(m)} alt="" />
          <div className="tg-mship-avatar__text">
            <span className="tg-mship-avatar__name">{displayName}</span>
            {isPending ? <span className="tg-mship-avatar__pending">({en.admin.membership.statusPending})</span> : null}
          </div>
        </div>
      </div>
      <div className="tg-col--admin">
        {m.is_owner ? (
          <span className="tg-mship-bool" aria-label="Project owner" title="Project owner">
            —
          </span>
        ) : (
          <label className={`tg-mship-bool${m.is_admin ? ' is-checked' : ''}`} title="Read-only port">
            <input type="checkbox" checked={m.is_admin} readOnly tabIndex={-1} disabled className="tg-cb-ghost" />
            <span className="sr-only">admin</span>
          </label>
        )}
      </div>
      <div className="tg-col--role">
        <div className="tg-mship-select" title="Read-only port">
          <span className="tg-mship-select__mock">{role?.name ?? '—'}</span>
        </div>
      </div>
      <div className="tg-col--status">
        {isPending ? <div className="tg-mship-pending">{en.admin.membership.statusPending}</div> : <div className="tg-mship-status">{en.admin.membership.statusActive}</div>}
      </div>
    </div>
  );
}

export default function AdminMembershipsPage() {
  const { pslug } = useParams();
  const [sp] = useSearchParams();
  const page = Math.max(1, parseInt(sp.get('page') || '1', 10) || 1);

  const key = `members-${pslug ?? 'x'}-${page}`;

  const load = useCallback(async () => {
    if (!pslug) {
      throw new Error('Missing project slug');
    }
    const project = await getProjectBySlug(pslug);
    if (!project.i_am_admin) {
      throw new Error('You do not have permission to see this project.');
    }
    const members = await listMembers(project.id, page);
    const rows = members.models.filter((m) => m.user == null || m.is_user_active);
    return { project, members, rows } as {
      project: TaigaProjectSlight;
      members: Paginated<TaigaMembership>;
      rows: TaigaMembership[];
    };
  }, [pslug, page]);

  const { data, error, loading } = useAsyncResource(key, load, [pslug, page]);

  if (loading) {
    return <LoadingScreen />;
  }
  if (error || !data) {
    return (
      <div className="tg-admin-section">
        <p className="tg-listing-error" data-testid="memberships-error">
          {error}
        </p>
      </div>
    );
  }

  const projectRoles = useMemo(
    () => (data.project.roles as { id: number; name: string }[] | undefined) ?? [],
    [data.project.roles],
  );
  const roleOpts = projectRoles.map((r) => ({ id: r.id, name: r.name }));
  const perPage = data.members.paginatedBy && data.members.paginatedBy > 0 ? data.members.paginatedBy : 1;
  const totalPages = data.members.count > 0 ? Math.max(1, Math.ceil(data.members.count / perPage)) : 1;

  return (
    <div className="tg-admin-section tg-mship" data-testid="admin-memberships">
      <header className="tg-admin-header">
        <h1 data-testid="admin-members-title">{en.admin.menu.members}</h1>
        <div className="tg-header-actions">
          <p className="tg-listing-error" style={{ background: 'transparent', border: 0, padding: 0, color: 'var(--color-text-muted)' }}>
            {data.project.name}
          </p>
          <span className="tg-btn-small" title="Add members (port pending)">
            {en.admin.memberships.addButton}
          </span>
        </div>
      </header>
      <section className="admin-membership-table tg-basic-table">
        <div className="tg-row tg-row--head">
          <div className="tg-col--h-member">{en.admin.membership.columnMember}</div>
          <div className="tg-col--h-admin">{en.admin.membership.columnAdmin}</div>
          <div className="tg-col--h-role">{en.admin.membership.columnRole}</div>
          <div className="tg-col--h-status">{en.admin.membership.columnStatus}</div>
        </div>
        {data.rows.map((m) => (
          <MemberRow key={m.id} m={m} projectRoles={roleOpts} />
        ))}
      </section>
      {totalPages > 1 ? (
        <div className="tg-paginator" data-testid="membership-paginator">
          <span>
            {en.pagination.previous} / {en.pagination.next} ({page}/{totalPages})
          </span>
        </div>
      ) : null}
    </div>
  );
}