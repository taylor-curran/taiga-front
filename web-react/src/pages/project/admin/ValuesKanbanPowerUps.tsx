import { useState } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useSwimlanes, useCreateSwimlane, useDeleteSwimlane } from '@/services/admin';

export function ValuesKanbanPowerUpsPage() {
  const project = useCurrentProject();
  const { data: swimlanes = [], isLoading } = useSwimlanes(project.id);
  const createSwimlane = useCreateSwimlane(project.id);
  const deleteSwimlane = useDeleteSwimlane(project.id);

  const [newName, setNewName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    createSwimlane.mutate(newName.trim());
    setNewName('');
  };

  const sorted = [...swimlanes].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Kanban Power-Ups</h1>
        <p className="text-sm text-taiga-grey-light mt-1">
          Manage swimlanes for your Kanban board. Swimlanes help organize stories into horizontal
          groupings.
        </p>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-taiga-grey-light text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taiga-bg bg-taiga-bg/50 text-left">
                <th className="px-4 py-2">Swimlane Name</th>
                <th className="px-4 py-2 w-16">Order</th>
                <th className="px-4 py-2 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((sw) => (
                <tr key={sw.id} className="border-b border-taiga-bg last:border-0 hover:bg-taiga-bg/30">
                  <td className="px-4 py-2">{sw.name}</td>
                  <td className="px-4 py-2 text-taiga-grey-light">{sw.order}</td>
                  <td className="px-4 py-2 text-right">
                    {confirmDeleteId === sw.id ? (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="text-taiga-red text-xs"
                          onClick={() => {
                            deleteSwimlane.mutate(sw.id);
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
                      <button
                        type="button"
                        className="text-taiga-red text-xs"
                        onClick={() => setConfirmDeleteId(sw.id)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-taiga-grey-light">
                    No swimlanes defined. The Kanban board uses a single default lane.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-2">Add Swimlane</h3>
        <form onSubmit={handleAdd} className="flex items-end gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Name</label>
            <input
              className="input w-full"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Enter swimlane name..."
            />
          </div>
          <button type="submit" className="btn-primary shrink-0" disabled={createSwimlane.isPending}>
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
