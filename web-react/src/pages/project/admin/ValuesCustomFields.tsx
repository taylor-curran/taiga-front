import { useState } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useCustomAttributes,
  useCreateCustomAttribute,
  useUpdateCustomAttribute,
  useDeleteCustomAttribute,
} from '@/services/admin';
import type { CustomAttribute } from '@/types/admin';

const ENTITY_TYPES = [
  { key: 'epic' as const, label: 'Epics' },
  { key: 'userstory' as const, label: 'User Stories' },
  { key: 'task' as const, label: 'Tasks' },
  { key: 'issue' as const, label: 'Issues' },
];

const FIELD_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'multiline', label: 'Multi-line Text' },
  { value: 'richtext', label: 'Rich Text' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'number', label: 'Number' },
];

function CustomFieldSection({
  entity,
  label,
  projectId,
}: {
  entity: (typeof ENTITY_TYPES)[number]['key'];
  label: string;
  projectId: number;
}) {
  const { data: attrs = [], isLoading } = useCustomAttributes(projectId, entity);
  const create = useCreateCustomAttribute(projectId, entity);
  const update = useUpdateCustomAttribute(entity);
  const del = useDeleteCustomAttribute(entity);

  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('text');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState({ name: '', description: '', type: 'text' });
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const sorted = [...attrs].sort((a, b) => a.order - b.order);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const maxOrder = attrs.length > 0 ? Math.max(...attrs.map((a) => a.order)) + 1 : 1;
    create.mutate({ name: newName.trim(), description: newDesc, type: newType, order: maxOrder });
    setNewName('');
    setNewDesc('');
    setNewType('text');
  };

  const startEdit = (attr: CustomAttribute) => {
    setEditingId(attr.id);
    setEditData({ name: attr.name, description: attr.description ?? '', type: attr.type });
  };

  const saveEdit = () => {
    if (editingId === null) return;
    update.mutate({ id: editingId, ...editData });
    setEditingId(null);
  };

  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">{label}</h3>

      {isLoading ? (
        <p className="text-taiga-grey-light text-sm">Loading...</p>
      ) : (
        <div className="card overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taiga-bg bg-taiga-bg/50 text-left">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2 w-28">Type</th>
                <th className="px-4 py-2 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((attr) => (
                <tr key={attr.id} className="border-b border-taiga-bg last:border-0 hover:bg-taiga-bg/30">
                  <td className="px-4 py-2">
                    {editingId === attr.id ? (
                      <input
                        className="input w-full"
                        value={editData.name}
                        onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                        autoFocus
                      />
                    ) : (
                      attr.name
                    )}
                  </td>
                  <td className="px-4 py-2 text-taiga-grey-light text-xs">
                    {editingId === attr.id ? (
                      <input
                        className="input w-full"
                        value={editData.description}
                        onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
                      />
                    ) : (
                      attr.description || '-'
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs">
                    {editingId === attr.id ? (
                      <select
                        className="input w-full"
                        value={editData.type}
                        onChange={(e) => setEditData((d) => ({ ...d, type: e.target.value }))}
                      >
                        {FIELD_TYPES.map((ft) => (
                          <option key={ft.value} value={ft.value}>{ft.label}</option>
                        ))}
                      </select>
                    ) : (
                      FIELD_TYPES.find((ft) => ft.value === attr.type)?.label ?? attr.type
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingId === attr.id ? (
                      <div className="flex justify-end gap-1">
                        <button type="button" className="text-taiga-green-dark text-xs" onClick={saveEdit}>Save</button>
                        <button type="button" className="text-taiga-grey text-xs" onClick={() => setEditingId(null)}>Cancel</button>
                      </div>
                    ) : confirmDeleteId === attr.id ? (
                      <div className="flex justify-end gap-1">
                        <button type="button" className="text-taiga-red text-xs" onClick={() => { del.mutate(attr.id); setConfirmDeleteId(null); }}>Confirm</button>
                        <button type="button" className="text-taiga-grey text-xs" onClick={() => setConfirmDeleteId(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button type="button" className="text-taiga-link text-xs" onClick={() => startEdit(attr)}>Edit</button>
                        <button type="button" className="text-taiga-red text-xs" onClick={() => setConfirmDeleteId(attr.id)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-taiga-grey-light">
                    No custom fields defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <form onSubmit={handleAdd} className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Name</label>
          <input className="input w-full" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Field name..." />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium mb-1">Description</label>
          <input className="input w-full" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Optional..." />
        </div>
        <div className="w-32">
          <label className="block text-xs font-medium mb-1">Type</label>
          <select className="input w-full" value={newType} onChange={(e) => setNewType(e.target.value)}>
            {FIELD_TYPES.map((ft) => (
              <option key={ft.value} value={ft.value}>{ft.label}</option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-primary shrink-0" disabled={create.isPending}>
          Add
        </button>
      </form>
    </div>
  );
}

export function ValuesCustomFieldsPage() {
  const project = useCurrentProject();

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Custom Fields</h1>
      <p className="text-sm text-taiga-grey-light">
        Define custom attributes for each entity type in your project.
      </p>
      {ENTITY_TYPES.map((et) => (
        <CustomFieldSection key={et.key} entity={et.key} label={et.label} projectId={project.id} />
      ))}
    </div>
  );
}
