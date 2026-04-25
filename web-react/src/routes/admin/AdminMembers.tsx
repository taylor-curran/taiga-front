import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { useDeleteMembership, useMemberships, useProjectBySlug, useRoles, useUpdateMembership } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { Avatar } from '../../components/Avatar';
import { api } from '../../api/client';
import { toast } from '../../components/Toast';
import { useQueryClient } from '@tanstack/react-query';

export function AdminMemberships() {
  const { pslug } = useParams();
  const { data: project, isLoading: lp } = useProjectBySlug(pslug);
  const { data: memberships, isLoading: lm } = useMemberships(project?.id);
  const { data: roles } = useRoles(project?.id);
  const remove = useDeleteMembership();
  const update = useUpdateMembership();
  if (lp || lm) return <Loader />;
  if (!project) return null;

  return (
    <div data-testid="admin-memberships">
      <h2 className="text-lg font-semibold">Memberships</h2>
      <ul className="mt-4 card divide-y divide-slate-100">
        {memberships?.map((m) => (
          <li key={m.id} className="flex items-center gap-3 p-3">
            <Avatar
              user={{
                full_name: m.full_name || m.user_extra_info?.full_name_display,
                photo: m.photo,
                color: m.color,
              }}
              size={36}
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">
                {m.full_name || m.user_extra_info?.full_name_display || m.email || 'Pending'}
              </div>
              <div className="text-xs text-slate-500">{m.email || m.user_extra_info?.username}</div>
            </div>
            <select
              className="input max-w-[180px]"
              value={m.role}
              disabled={!!m.is_owner}
              onChange={async (e) => {
                await update.mutateAsync({ id: m.id, patch: { role: Number(e.target.value) } });
                toast.success('Role updated');
              }}
            >
              {(roles ?? []).map((r) => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
            {!m.is_owner && (
              <button
                className="text-slate-400 hover:text-red-600"
                onClick={async () => {
                  if (confirm('Remove member?')) {
                    await remove.mutateAsync(m.id);
                    toast.success('Removed');
                  }
                }}
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AdminRoles() {
  const { pslug } = useParams();
  const { data: project, isLoading } = useProjectBySlug(pslug);
  const { data: roles, refetch } = useRoles(project?.id);
  const qc = useQueryClient();
  const [name, setName] = useState('');
  if (isLoading || !project) return <Loader />;

  return (
    <div data-testid="admin-roles">
      <h2 className="text-lg font-semibold">Roles & permissions</h2>
      <ul className="mt-4 card divide-y divide-slate-100">
        {(roles ?? []).map((r) => (
          <li key={r.id} className="flex items-center justify-between p-3 text-sm">
            <span>{r.name}</span>
            <button
              className="text-slate-400 hover:text-red-600"
              onClick={async () => {
                if (confirm(`Delete role ${r.name}?`)) {
                  await api().delete(`roles/${r.id}`);
                  refetch();
                  qc.invalidateQueries({ queryKey: ['roles'] });
                }
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <form
        className="mt-4 flex gap-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await api().post('roles', { project: project.id, name });
          setName('');
          refetch();
          qc.invalidateQueries({ queryKey: ['roles'] });
          toast.success('Role created');
        }}
      >
        <input className="input" required value={name} onChange={(e) => setName(e.target.value)} placeholder="New role name" />
        <button className="btn-primary">Add</button>
      </form>
    </div>
  );
}
