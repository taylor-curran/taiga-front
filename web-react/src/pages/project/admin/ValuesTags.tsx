import { useState } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useProjectTags, useCreateTag, useEditTag, useDeleteTag } from '@/services/admin';

export function ValuesTagsPage() {
  const project = useCurrentProject();
  const { data: tags = [], isLoading } = useProjectTags(project.id);
  const createTag = useCreateTag(project.id);
  const editTag = useEditTag(project.id);
  const deleteTag = useDeleteTag(project.id);

  const [newTag, setNewTag] = useState('');
  const [newColor, setNewColor] = useState('#A9AABC');
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    createTag.mutate({ tag: newTag.trim(), color: newColor });
    setNewTag('');
  };

  const startEdit = (tag: { name: string; color: string | null }) => {
    setEditingTag(tag.name);
    setEditName(tag.name);
    setEditColor(tag.color ?? '#A9AABC');
  };

  const saveEdit = () => {
    if (editingTag === null) return;
    editTag.mutate({ from_tag: editingTag, to_tag: editName, color: editColor });
    setEditingTag(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tags</h1>
        <p className="text-sm text-taiga-grey-light mt-1">
          Manage project-level tags and their colors.
        </p>
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-4 text-taiga-grey-light text-sm">Loading...</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-taiga-bg bg-taiga-bg/50 text-left">
                <th className="px-4 py-2 w-8" />
                <th className="px-4 py-2">Tag</th>
                <th className="px-4 py-2 w-24 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((tag) => (
                <tr key={tag.name} className="border-b border-taiga-bg last:border-0 hover:bg-taiga-bg/30">
                  <td className="px-4 py-2">
                    {editingTag === tag.name ? (
                      <input
                        type="color"
                        value={editColor}
                        onChange={(e) => setEditColor(e.target.value)}
                        className="w-6 h-6 p-0 border-0"
                      />
                    ) : (
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: tag.color ?? '#A9AABC' }}
                      />
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {editingTag === tag.name ? (
                      <input
                        className="input w-full"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                    ) : (
                      tag.name
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {editingTag === tag.name ? (
                      <div className="flex justify-end gap-1">
                        <button type="button" className="text-taiga-green-dark text-xs" onClick={saveEdit}>Save</button>
                        <button type="button" className="text-taiga-grey text-xs" onClick={() => setEditingTag(null)}>Cancel</button>
                      </div>
                    ) : confirmDelete === tag.name ? (
                      <div className="flex justify-end gap-1">
                        <button type="button" className="text-taiga-red text-xs" onClick={() => { deleteTag.mutate(tag.name); setConfirmDelete(null); }}>Confirm</button>
                        <button type="button" className="text-taiga-grey text-xs" onClick={() => setConfirmDelete(null)}>Cancel</button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <button type="button" className="text-taiga-link text-xs" onClick={() => startEdit(tag)}>Edit</button>
                        <button type="button" className="text-taiga-red text-xs" onClick={() => setConfirmDelete(tag.name)}>Delete</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {tags.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-taiga-grey-light">
                    No tags defined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="card p-4">
        <h3 className="text-sm font-semibold mb-2">Add Tag</h3>
        <form onSubmit={handleAdd} className="flex items-end gap-3">
          <div>
            <label className="block text-xs font-medium mb-1">Color</label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="w-8 h-8 p-0 border-0 cursor-pointer"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium mb-1">Tag Name</label>
            <input
              className="input w-full"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name..."
            />
          </div>
          <button type="submit" className="btn-primary shrink-0" disabled={createTag.isPending}>
            Add
          </button>
        </form>
      </div>
    </div>
  );
}
