import clsx from 'clsx';
import { format } from 'date-fns';
import type { Attachment } from '@/types/api';

function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext)) return '\uD83D\uDDBC\uFE0F';
  if (['pdf'].includes(ext)) return '\uD83D\uDCC4';
  if (['zip', 'tar', 'gz', 'rar'].includes(ext)) return '\uD83D\uDCE6';
  if (['doc', 'docx', 'odt', 'txt', 'md'].includes(ext)) return '\uD83D\uDCC3';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return '\uD83D\uDCCA';
  return '\uD83D\uDCCE';
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete?: (id: number) => void;
  onPreview?: (attachment: Attachment) => void;
  view?: 'list' | 'grid';
  className?: string;
}

export function AttachmentList({
  attachments,
  onDelete,
  onPreview,
  view = 'list',
  className,
}: AttachmentListProps) {
  if (!attachments.length) {
    return <p className="text-sm text-taiga-grey-light italic">No attachments.</p>;
  }

  if (view === 'grid') {
    return (
      <div className={clsx('grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3', className)}>
        {attachments.map((a) => {
          const isImage = !!a.thumbnail_card_url;
          return (
            <div
              key={a.id}
              className="card p-2 flex flex-col items-center gap-1 group cursor-pointer"
              onClick={() => onPreview?.(a)}
            >
              {isImage ? (
                <img
                  src={a.thumbnail_card_url!}
                  alt={a.name}
                  className="w-full h-24 object-cover rounded"
                />
              ) : (
                <span className="text-3xl">{fileIcon(a.name)}</span>
              )}
              <span className="text-xs truncate w-full text-center" title={a.name}>
                {a.name}
              </span>
              <span className="text-xs text-taiga-grey-light">{formatSize(a.size)}</span>
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(a.id);
                  }}
                  className="text-xs text-taiga-red opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Delete
                </button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <ul className={clsx('divide-y divide-taiga-grey-lighter/40 border border-taiga-grey-lighter/40 rounded', className)}>
      {attachments.map((a) => (
        <li
          key={a.id}
          className="px-3 py-2 flex items-center gap-3 hover:bg-taiga-bg/60 group"
        >
          <span className="text-lg shrink-0">{fileIcon(a.name)}</span>
          <button
            type="button"
            onClick={() => onPreview?.(a)}
            className="flex-1 truncate text-sm text-taiga-text text-left hover:text-taiga-link"
          >
            {a.name}
          </button>
          <span className="text-xs text-taiga-grey-light shrink-0">
            {formatSize(a.size)}
          </span>
          <span className="text-xs text-taiga-grey-light shrink-0">
            {format(new Date(a.created_date), 'MMM d, yyyy')}
          </span>
          <a
            href={a.url}
            download
            className="text-xs text-taiga-link shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            Download
          </a>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(a.id)}
              className="text-xs text-taiga-red opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
