import { useRef } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useWikiAttachments,
  useUploadWikiAttachment,
  useDeleteWikiAttachment,
} from '@/services/wiki';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function WikiAttachments({ wikiId }: { wikiId: number | undefined }) {
  const project = useCurrentProject();
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: attachments } = useWikiAttachments(project.id, wikiId);
  const upload = useUploadWikiAttachment(project.id, wikiId);
  const remove = useDeleteWikiAttachment(project.id, wikiId);

  const canModify = project.my_permissions?.includes('modify_wiki_page');

  if (!wikiId) return null;

  const handleUpload = () => {
    const files = fileRef.current?.files;
    if (!files) return;
    Array.from(files).forEach((f) => upload.mutate(f));
    if (fileRef.current) fileRef.current.value = '';
  };

  const handleDelete = (id: number, name: string) => {
    if (!window.confirm(`Delete attachment "${name}"?`)) return;
    remove.mutate(id);
  };

  return (
    <div className="card mt-4 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">
          Attachments{attachments && attachments.length > 0 ? ` (${attachments.length})` : ''}
        </h3>
        {canModify && (
          <label className="btn-primary text-xs cursor-pointer">
            Upload
            <input
              ref={fileRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleUpload}
            />
          </label>
        )}
      </div>

      {upload.isPending && (
        <p className="text-xs text-taiga-grey-light mb-2">Uploading…</p>
      )}

      {attachments && attachments.length > 0 ? (
        <ul className="divide-y divide-taiga-grey-lighter/40">
          {attachments.map((att) => (
            <li key={att.id} className="py-2 flex items-center justify-between text-sm">
              <a
                href={att.url}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate max-w-[70%]"
              >
                {att.name}
              </a>
              <div className="flex items-center gap-3 text-xs text-taiga-grey-light">
                <span>{formatBytes(att.size)}</span>
                <span>{new Date(att.created_date).toLocaleDateString()}</span>
                {canModify && (
                  <button
                    type="button"
                    onClick={() => handleDelete(att.id, att.name)}
                    className="text-taiga-red hover:text-taiga-red/80"
                    title="Delete"
                  >
                    &times;
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-taiga-grey-light">No attachments yet.</p>
      )}
    </div>
  );
}
