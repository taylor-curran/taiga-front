import { useState, useCallback } from 'react';
import clsx from 'clsx';
import type { Attachment } from '@/types/api';

interface AttachmentSortableProps {
  attachments: Attachment[];
  onReorder: (reordered: Attachment[]) => void;
  onDelete?: (id: number) => void;
  className?: string;
}

export function AttachmentSortable({
  attachments,
  onReorder,
  onDelete,
  className,
}: AttachmentSortableProps) {
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  const handleDragStart = useCallback((_e: React.DragEvent, idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setOverIdx(idx);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIdx: number) => {
      e.preventDefault();
      if (dragIdx === null || dragIdx === dropIdx) {
        setDragIdx(null);
        setOverIdx(null);
        return;
      }
      const items = [...attachments];
      const [moved] = items.splice(dragIdx, 1);
      items.splice(dropIdx, 0, moved);
      onReorder(items);
      setDragIdx(null);
      setOverIdx(null);
    },
    [dragIdx, attachments, onReorder],
  );

  if (!attachments.length) {
    return <p className="text-sm text-taiga-grey-light italic">No attachments.</p>;
  }

  return (
    <ul className={clsx('space-y-1', className)}>
      {attachments.map((a, idx) => (
        <li
          key={a.id}
          draggable
          onDragStart={(e) => handleDragStart(e, idx)}
          onDragOver={(e) => handleDragOver(e, idx)}
          onDrop={(e) => handleDrop(e, idx)}
          onDragEnd={() => {
            setDragIdx(null);
            setOverIdx(null);
          }}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded border cursor-grab transition-colors',
            overIdx === idx && dragIdx !== idx
              ? 'border-taiga-green-dark bg-taiga-green/10'
              : 'border-taiga-grey-lighter/40 hover:bg-taiga-bg/60',
            dragIdx === idx && 'opacity-50',
          )}
        >
          <span className="text-taiga-grey-light cursor-grab" title="Drag to reorder">
            {'\u2630'}
          </span>
          <span className="flex-1 text-sm truncate">{a.name}</span>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(a.id)}
              className="text-xs text-taiga-red hover:underline"
            >
              Delete
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}
