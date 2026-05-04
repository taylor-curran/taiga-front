import { useEffect, useCallback } from 'react';
import type { Attachment } from '@/types/api';

interface AttachmentPreviewProps {
  attachment: Attachment | null;
  onClose: () => void;
}

function isImage(name: string): boolean {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(ext);
}

export function AttachmentPreview({ attachment, onClose }: AttachmentPreviewProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (!attachment) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [attachment, handleKeyDown]);

  if (!attachment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-2 border-b border-taiga-grey-lighter">
          <span className="text-sm font-medium truncate">{attachment.name}</span>
          <div className="flex items-center gap-2">
            <a
              href={attachment.url}
              download
              className="text-xs text-taiga-link"
            >
              Download
            </a>
            <button
              type="button"
              onClick={onClose}
              className="text-taiga-grey hover:text-taiga-text text-lg leading-none"
            >
              {'\u00D7'}
            </button>
          </div>
        </div>
        <div className="p-4 flex items-center justify-center min-h-[300px]">
          {isImage(attachment.name) ? (
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-full max-h-[80vh] object-contain"
            />
          ) : (
            <div className="text-center space-y-2">
              <p className="text-4xl">{'\uD83D\uDCCE'}</p>
              <p className="text-sm text-taiga-grey">{attachment.name}</p>
              <a
                href={attachment.url}
                download
                className="btn-primary text-xs"
              >
                Download file
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
