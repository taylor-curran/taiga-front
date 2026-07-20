import { useEffect, useState } from 'react';
import { fetchCommentHistory } from '../../api/historyApi';
import type { HistoryContentType } from '../../api/historyTypes';
import { useHistoryStore } from '../historyStore';

type Props = {
  open: boolean;
  onClose: () => void;
  activityId: number;
};

export function CommentHistoryLightbox({ open, onClose, activityId }: Props) {
  const token = useHistoryStore((s) => s.token);
  const contentType = useHistoryStore((s) => s.contentType);
  const objectId = useHistoryStore((s) => s.objectId);
  const [entries, setEntries] = useState<unknown[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setErr(null);
    void (async () => {
      try {
        const data = await fetchCommentHistory(
          token,
          contentType as HistoryContentType,
          objectId,
          activityId,
        );
        if (!cancelled) setEntries(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, token, contentType, objectId, activityId]);

  if (!open) return null;

  return (
    <div
      className="comment-history-lightbox-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="comment-history-title"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="comment-history-lightbox">
        <button type="button" className="lb-close" onClick={onClose} aria-label="Close">
          ×
        </button>
        <h2 id="comment-history-title">Comment history</h2>
        {err ? <p role="alert">{err}</p> : null}
        <div className="history-wrapper">
          {entries.map((entry, i) => (
            <div key={i} className="history-entry-row">
              <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(entry, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
