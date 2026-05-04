import { useRef } from 'react';
import { useAttachments, useUploadAttachment, useDeleteAttachment } from '@/services/attachments';
import type { Attachment } from '@/types/api';

interface AttachmentsSectionProps {
  usId: number;
  projectId: number;
}

function formatSize(bytes?: number): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AttachmentsSection({ usId, projectId }: AttachmentsSectionProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const { data: attachments, isLoading } = useAttachments('userstory', usId, projectId);
  const uploadMutation = useUploadAttachment('userstory');
  const deleteMutation = useDeleteAttachment('userstory');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      uploadMutation.mutate({ objectId: usId, projectId, file: files[i] });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-taiga-text">
          Attachments
          {attachments && attachments.length > 0 && (
            <span className="ml-1 text-xs text-taiga-grey-light">({attachments.length})</span>
          )}
        </h2>
        <button
          onClick={() => fileRef.current?.click()}
          className="text-sm text-taiga-primary hover:underline"
        >
          + Upload
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      {isLoading && <p className="text-sm text-taiga-grey-light">Loading...</p>}
      {attachments && attachments.length === 0 && (
        <p className="text-sm text-taiga-grey-light italic">No attachments.</p>
      )}
      {attachments && attachments.length > 0 && (
        <ul className="space-y-1">
          {attachments.map((a: Attachment) => (
            <li
              key={a.id}
              className="flex items-center gap-2 px-3 py-2 rounded hover:bg-taiga-bg/60 border border-taiga-grey-lighter/40"
            >
              {a.thumbnail_card_url ? (
                <img
                  src={a.thumbnail_card_url}
                  alt={a.name}
                  className="w-8 h-8 rounded object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded bg-taiga-grey-lighter/60 flex items-center justify-center text-xs text-taiga-grey-light">
                  {a.name.split('.').pop()?.toUpperCase().slice(0, 3)}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <a
                  href={a.url || a.attached_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-taiga-text hover:text-taiga-primary truncate block"
                >
                  {a.name}
                </a>
                <span className="text-xs text-taiga-grey-light">{formatSize(a.size)}</span>
              </div>
              <button
                onClick={() => deleteMutation.mutate(a.id)}
                className="text-xs text-red-400 hover:text-red-600 px-1"
                title="Delete"
              >
                \u2715
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
