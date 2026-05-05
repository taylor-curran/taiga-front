import { useState, useRef } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useUpdateProject, useUploadProjectLogo, useRemoveProjectLogo } from '@/services/admin';

export function ProjectDetailsPage() {
  const project = useCurrentProject();
  const update = useUpdateProject();
  const uploadLogo = useUploadProjectLogo();
  const removeLogo = useRemoveProjectLogo();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [isPrivate, setIsPrivate] = useState(project.is_private ?? false);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({ id: project.id, name, description, is_private: isPrivate });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadLogo.mutate({ id: project.id, file });
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Project Details</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded bg-taiga-bg flex items-center justify-center overflow-hidden shrink-0">
            {project.logo_big_url ? (
              <img src={project.logo_big_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl text-taiga-grey-light">{project.name.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => fileRef.current?.click()}
            >
              Change logo
            </button>
            {project.logo_big_url && (
              <button
                type="button"
                className="btn-secondary text-sm text-taiga-red"
                onClick={() => removeLogo.mutate(project.id)}
              >
                Remove
              </button>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              className="input w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="input w-full h-32"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              id="is-private"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            <label htmlFor="is-private" className="text-sm">
              Private project (only visible to members)
            </label>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save'}
            </button>
            {saved && <span className="text-sm text-taiga-green-dark">Settings saved!</span>}
            {update.isError && (
              <span className="text-sm text-taiga-red">Error saving settings</span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
