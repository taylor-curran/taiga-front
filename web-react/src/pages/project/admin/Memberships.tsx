import { useState, useEffect } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useMemberships,
  useRoles,
  useBulkCreateMemberships,
  useUpdateMembership,
  useDeleteMembership,
  useResendInvitation,
} from '@/services/admin';
import { Avatar } from '@/components/common/Avatar';

export function MembershipsPage() {
  const project = useCurrentProject();
  const { data: memberships = [], isLoading } = useMemberships(project.id);
  const { data: roles = [] } = useRoles(project.id);
  const bulkCreate = useBulkCreateMemberships(project.id);
  const updateMember = useUpdateMembership(project.id);
  const deleteMember = useDeleteMembership(project.id);
  const resend = useResendInvitation();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<number>(0);
  const [inviteText, setInviteText] = useState('');

  useEffect(() => {
    if (roles.length > 0 && inviteRole === 0) setInviteRole(roles[0].id);
  }, [roles, inviteRole]);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const activeMembers = memberships.filter(
    (m) => m.user === null || m.is_user_active !== false,
  );

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    const roleId = inviteRole || roles[0]?.id;
    if (!roleId) return;
    await bulkCreate.mutateAsync({
      project_id: project.id,
      bulk_memberships: [{ role_id: roleId, username: inviteEmail.trim() }],
      invitation_extra_text: inviteText || undefined,
    });
    setInviteEmail('');
    setInviteText('');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Memberships</h1>

      <div className="card p-6">
        <h2 className="font-semibold mb-4">Invite New Member</h2>
        <form onSubmit={handleInvite} className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-medium mb-1">Email or Username</label>
              <input
                className="input w-full"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="user@example.com"
                required
              />
            </div>
            <div className="w-48">
              <label className="block text-xs font-medium mb-1">Role</label>
              <select
                className="input w-full"
                value={inviteRole}
                onChange={(e) => setInviteRole(Number(e.target.value))}
              >
                {roles.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Invitation Message (optional)</label>
            <textarea
              className="input w-full h-16"
              value={inviteText}
              onChange={(e) => setInviteText(e.target.value)}
              placeholder="Add a personal message to the invitation..."
            />
          </div>
          <button type="submit" className="btn-primary" disabled={bulkCreate.isPending}>
            {bulkCreate.isPending ? 'Sending...' : 'Send Invitation'}
          </button>
          {bulkCreate.isSuccess && (
            <span className="text-sm text-taiga-green-dark ml-3">Invitation sent!</span>
          )}
          {bulkCreate.isError && (
            <span className="text-sm text-taiga-red ml-3">Error sending invitation</span>
          )}
        </form>
      </div>

      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-taiga-bg">
          <h2 className="font-semibold">
            Current Members ({activeMembers.length})
          </h2>
        </div>
        {isLoading ? (
          <div className="p-4 text-taiga-grey-light text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taiga-bg bg-taiga-bg/50 text-left">
                <th className="px-4 py-2">Member</th>
                <th className="px-4 py-2 w-40">Role</th>
                <th className="px-4 py-2 w-20">Admin</th>
                <th className="px-4 py-2 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeMembers.map((member) => (
                <tr key={member.id} className="border-b border-taiga-bg last:border-0 hover:bg-taiga-bg/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        name={member.full_name || member.user_email || 'User'}
                        src={member.photo}
                        size={32}
                      />
                      <div>
                        <p className="font-medium">
                          {member.full_name || member.username || member.user_email}
                        </p>
                        {member.user_email && (
                          <p className="text-xs text-taiga-grey-light">{member.user_email}</p>
                        )}
                        {member.user === null && (
                          <span className="text-xs text-taiga-yellow font-medium">Pending invitation</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      className="input w-full text-xs"
                      value={member.role}
                      onChange={(e) =>
                        updateMember.mutate({ id: member.id, role: Number(e.target.value) })
                      }
                    >
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    {member.is_admin && (
                      <span className="text-xs font-semibold text-taiga-green-dark">Yes</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {confirmDeleteId === member.id ? (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="text-taiga-red text-xs"
                          onClick={() => {
                            deleteMember.mutate(member.id);
                            setConfirmDeleteId(null);
                          }}
                        >
                          Confirm
                        </button>
                        <button
                          type="button"
                          className="text-taiga-grey text-xs"
                          onClick={() => setConfirmDeleteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        {member.user === null && (
                          <button
                            type="button"
                            className="text-taiga-link text-xs"
                            onClick={() => resend.mutate(member.id)}
                          >
                            Resend
                          </button>
                        )}
                        {!member.is_owner && (
                          <button
                            type="button"
                            className="text-taiga-red text-xs"
                            onClick={() => setConfirmDeleteId(member.id)}
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
