import { useState } from 'react';
import { useWikiHistory } from '@/services/wiki';
import { sanitizeHtml } from '@/lib/sanitize';
import type { HistoryEntry } from '@/types/api';

function HistoryEntryRow({ entry }: { entry: HistoryEntry }) {
  const date = new Date(entry.created_at);
  const diffs = entry.values_diff ?? {};

  return (
    <div className="flex gap-3 py-3 border-b border-taiga-grey-lighter/40 last:border-0">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-taiga-green-dark text-white flex items-center justify-center text-xs font-bold">
        {entry.user.name?.charAt(0)?.toUpperCase() ?? '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-medium text-taiga-text">
            {entry.user.name ?? 'Unknown'}
          </span>
          <span className="text-xs text-taiga-grey-light">
            {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Content diff */}
        {Array.isArray(diffs.content_diff) && (
          <div className="mt-1 text-xs space-y-1">
            {(diffs.content_diff as string[]).map((chunk, i) => (
              <div
                key={i}
                className="bg-taiga-bg rounded p-2 overflow-x-auto prose prose-xs max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(chunk) }}
              />
            ))}
          </div>
        )}

        {/* Attachment changes */}
        {diffs.attachments != null && (
          <div className="mt-1 text-xs text-taiga-grey">
            Attachments changed
          </div>
        )}

        {/* Comment */}
        {entry.comment_html && (
          <div
            className="mt-1 text-sm bg-taiga-bg rounded p-2 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.comment_html) }}
          />
        )}
      </div>
    </div>
  );
}

export function WikiHistory({ wikiId }: { wikiId: number | undefined }) {
  const [expanded, setExpanded] = useState(false);
  const { data: entries, isLoading } = useWikiHistory(wikiId);

  if (!wikiId) return null;
  if (!isLoading && (!entries || entries.length === 0)) return null;

  return (
    <div className="card mt-4">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 text-left text-sm font-semibold flex items-center justify-between hover:bg-taiga-bg/60 rounded"
      >
        <span>Activity{entries ? ` (${entries.length})` : ''}</span>
        <span className="text-taiga-grey-light text-xs">
          {expanded ? '▲ Collapse' : '▼ Expand'}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          {isLoading ? (
            <p className="text-sm text-taiga-grey-light">Loading history…</p>
          ) : (
            entries!.map((entry: HistoryEntry) => (
              <HistoryEntryRow key={entry.id} entry={entry} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
