import { useState, useEffect } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useRoles, useCreateRole, useUpdateRole, useDeleteRole } from '@/services/admin';
import { PERMISSION_CATEGORIES } from '@/types/admin';
import type { Role } from '@/types/admin';

export function RolesPage() {
  const project = useCurrentProject();
  const { data: roles = [], isLoading } = useRoles(project.id);
  const createRole = useCreateRole(project.id);
  const updateRole = useUpdateRole();
  const deleteRole = useDeleteRole();

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [moveToId, setMoveToId] = useState<number>(0);

  const selectedRole = roles.find((r) => r.id === selectedRoleId) ?? roles[0] ?? null;

  useEffect(() => {
    if (roles.length > 0 && !selectedRoleId) {
      setSelectedRoleId(roles[0].id);
    }
  }, [roles, selectedRoleId]);

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    const maxOrder = roles.length > 0 ? Math.max(...roles.map((r) => r.order)) + 1 : 1;
    const newRole = await createRole.mutateAsync({
      name: newRoleName.trim(),
      order: maxOrder,
      computable: true,
      permissions: [],
    });
    setNewRoleName('');
    setSelectedRoleId(newRole.id);
  };

  const handleTogglePermission = (perm: string) => {
    if (!selectedRole) return;
    const perms = selectedRole.permissions.includes(perm)
      ? selectedRole.permissions.filter((p) => p !== perm)
      : [...selectedRole.permissions, perm];
    updateRole.mutate({ id: selectedRole.id, permissions: perms, project: project.id });
  };

  const handleToggleComputable = () => {
    if (!selectedRole) return;
    updateRole.mutate({
      id: selectedRole.id,
      computable: !selectedRole.computable,
      project: project.id,
    });
  };

  const handleDelete = () => {
    if (!confirmDeleteId || !moveToId) return;
    deleteRole.mutate(
      { id: confirmDeleteId, moveTo: moveToId, projectId: project.id },
      { onSuccess: () => { setConfirmDeleteId(null); setSelectedRoleId(null); } },
    );
  };

  const allPerms = PERMISSION_CATEGORIES.flatMap((c) => c.perms);
  const allChecked = selectedRole ? allPerms.every((p) => selectedRole.permissions.includes(p)) : false;

  const handleToggleAll = () => {
    if (!selectedRole) return;
    const perms = allChecked ? [] : [...allPerms];
    updateRole.mutate({ id: selectedRole.id, permissions: perms, project: project.id });
  };

  if (isLoading) {
    return <div className="text-taiga-grey-light p-4">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Roles & Permissions</h1>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-4">
          <div className="card p-4 space-y-2">
            <h2 className="font-semibold text-sm mb-2">Roles</h2>
            {roles.map((role) => (
              <RoleItem
                key={role.id}
                role={role}
                isSelected={selectedRole?.id === role.id}
                onSelect={() => setSelectedRoleId(role.id)}
                onDelete={() => {
                  const others = roles.filter((r) => r.id !== role.id);
                  if (others.length === 0) return;
                  setMoveToId(others[0].id);
                  setConfirmDeleteId(role.id);
                }}
                canDelete={roles.length > 1}
              />
            ))}

            <form onSubmit={handleCreateRole} className="flex gap-2 mt-3 pt-3 border-t border-taiga-bg">
              <input
                className="input flex-1 text-sm"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
                placeholder="New role name..."
              />
              <button type="submit" className="btn-primary text-sm" disabled={createRole.isPending}>
                Add
              </button>
            </form>
          </div>
        </div>

        <div className="col-span-12 md:col-span-8">
          {selectedRole ? (
            <div className="card p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-lg">{selectedRole.name}</h2>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedRole.computable}
                      onChange={handleToggleComputable}
                    />
                    Computable (counts for estimation)
                  </label>
                </div>
              </div>

              {selectedRole.members_count != null && (
                <p className="text-xs text-taiga-grey-light mb-4">
                  {selectedRole.members_count} member{selectedRole.members_count !== 1 ? 's' : ''} with this role
                </p>
              )}

              <div className="mb-3">
                <label className="flex items-center gap-2 text-sm font-medium">
                  <input type="checkbox" checked={allChecked} onChange={handleToggleAll} />
                  Select all permissions
                </label>
              </div>

              <div className="space-y-4">
                {PERMISSION_CATEGORIES.map((cat) => (
                  <div key={cat.key} className="border border-taiga-bg rounded p-3">
                    <h3 className="font-semibold text-sm mb-2">{cat.label}</h3>
                    <div className="grid grid-cols-2 gap-1">
                      {cat.perms.map((perm) => (
                        <label key={perm} className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedRole.permissions.includes(perm)}
                            onChange={() => handleTogglePermission(perm)}
                          />
                          {perm.replace(/_/g, ' ')}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-8 text-center text-taiga-grey-light">
              Select a role to edit permissions
            </div>
          )}
        </div>
      </div>

      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card p-6 max-w-md w-full mx-4">
            <h2 className="font-semibold text-lg mb-3">Delete Role</h2>
            <p className="text-sm text-taiga-grey-light mb-4">
              Members with this role will be moved to the replacement role.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Move members to:</label>
              <select
                className="input w-full"
                value={moveToId}
                onChange={(e) => setMoveToId(Number(e.target.value))}
              >
                {roles
                  .filter((r) => r.id !== confirmDeleteId)
                  .map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
              </select>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary bg-taiga-red hover:bg-taiga-red/80"
                onClick={handleDelete}
                disabled={deleteRole.isPending}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RoleItem({
  role,
  isSelected,
  onSelect,
  onDelete,
  canDelete,
}: {
  role: Role;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  canDelete: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-3 py-2 rounded cursor-pointer transition-colors ${
        isSelected ? 'bg-taiga-green-dark/10 text-taiga-green-dark' : 'hover:bg-taiga-bg'
      }`}
      onClick={onSelect}
    >
      <div>
        <span className="text-sm font-medium">{role.name}</span>
        {role.members_count != null && (
          <span className="text-xs text-taiga-grey-light ml-2">({role.members_count})</span>
        )}
      </div>
      {canDelete && (
        <button
          type="button"
          className="text-taiga-red text-xs opacity-0 group-hover:opacity-100 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete role"
        >
          x
        </button>
      )}
    </div>
  );
}
