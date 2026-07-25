import { useParams } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useDeleteMembership, useInviteMembers, useMemberships, useProjectBySlug, useRoles } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { Avatar } from '../../components/Avatar';
import { Modal } from '../../components/Modal';
import { toast } from '../../components/Toast';

export default function Team() {
  const { pslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: memberships, isLoading: lm } = useMemberships(project?.id);
  const { data: roles } = useRoles(project?.id);
  const invite = useInviteMembers();
  const remove = useDeleteMembership();
  const [showInvite, setShowInvite] = useState(false);
  const [emails, setEmails] = useState('');
  const [roleId, setRoleId] = useState<number | undefined>();

  if (lp || lm) return <Loader />;
  if (!project) return null;

  const onInvite = async (e: FormEvent) => {
    e.preventDefault();
    if (!project || !roleId) return;
    const list = emails
      .split(/[,\s]+/)
      .map((e) => e.trim())
      .filter(Boolean)
      .map((email) => ({ email, role_id: roleId }));
    if (!list.length) return;
    await invite.mutateAsync({ project: project.id, bulk_memberships: list });
    setEmails('');
    setShowInvite(false);
    toast.success(`${list.length} invite${list.length === 1 ? '' : 's'} sent`);
  };

  return (
    <div data-testid="team">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Team</h1>
        {project.i_am_admin && (
          <button className="btn-primary" onClick={() => setShowInvite(true)}>Invite members</button>
        )}
      </header>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="team-list">
        {memberships?.map((m) => (
          <li key={m.id} className="card flex items-center gap-3 p-3">
            <Avatar
              user={{
                full_name: m.full_name || m.user_extra_info?.full_name_display,
                photo: m.photo,
                color: m.color,
              }}
              size={40}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-slate-800">
                {m.full_name || m.user_extra_info?.full_name_display || m.email || 'Pending invite'}
              </div>
              <div className="text-xs text-slate-500">
                {m.role_name} {m.is_admin ? '· admin' : ''}
              </div>
            </div>
            {project.i_am_admin && !m.is_owner && (
              <button
                className="text-slate-300 hover:text-red-600"
                onClick={async () => {
                  if (confirm('Remove this member?')) {
                    await remove.mutateAsync(m.id);
                    toast.success('Member removed');
                  }
                }}
                title="Remove member"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>

      <Modal open={showInvite} onClose={() => setShowInvite(false)} title="Invite members">
        <form className="space-y-3" onSubmit={onInvite}>
          <div>
            <label className="label">Emails (comma or newline separated)</label>
            <textarea className="input min-h-[100px]" required value={emails} onChange={(e) => setEmails(e.target.value)} />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" required value={roleId ?? ''} onChange={(e) => setRoleId(Number(e.target.value))}>
              <option value="">Pick a role…</option>
              {roles?.map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={() => setShowInvite(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={invite.isPending}>
              {invite.isPending ? 'Sending…' : 'Send invites'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
