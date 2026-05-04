import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import clsx from 'clsx';
import { Avatar } from '@/components/common/Avatar';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { sanitizeHtml } from '@/lib/sanitize';
import type { HistoryEntry } from '@/types/api';

type ItemType = 'userstory' | 'task' | 'issue' | 'epic';

interface ActivityFeedProps {
  entries: HistoryEntry[];
  itemType: ItemType;
  itemId: number;
  currentUserId?: number;
  members?: { id: number; username: string; full_name?: string }[];
  onAddComment?: (text: string) => void;
  onEditComment?: (entryId: string, text: string) => void;
  onDeleteComment?: (entryId: string) => void;
  loading?: boolean;
  className?: string;
}

function formatChangeValue(val: unknown): string {
  if (val === null || val === undefined) return '\u2014';
  if (typeof val === 'string') return val;
  if (typeof val === 'number') return String(val);
  return JSON.stringify(val);
}

function ChangeItem({ field, from, to }: { field: string; from: unknown; to: unknown }) {
  return (
    <span className="text-xs text-taiga-grey">
      <span className="font-medium text-taiga-text">{field}</span>
      {' changed from '}
      <span className="line-through">{formatChangeValue(from)}</span>
      {' to '}
      <span className="font-medium">{formatChangeValue(to)}</span>
    </span>
  );
}

function ActivityEntry({
  entry,
  currentUserId,
  members,
  onEditComment,
  onDeleteComment,
}: {
  entry: HistoryEntry;
  currentUserId?: number;
  members?: { id: number; username: string; full_name?: string }[];
  onEditComment?: (entryId: string, text: string) => void;
  onDeleteComment?: (entryId: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(entry.comment ?? '');
  const isOwnComment = currentUserId !== undefined && entry.user.pk === currentUserId;
  const isDeleted = !!entry.delete_comment_date;
  const hasComment = !!entry.comment && !isDeleted;
  const hasChanges = entry.values_diff && Object.keys(entry.values_diff).length > 0;

  const handleSaveEdit = (text: string) => {
    onEditComment?.(entry.id, text);
    setEditing(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar
        name={entry.user.name}
        src={entry.user.photo}
        size={28}
        className="shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-taiga-text">{entry.user.name}</span>
          <span className="text-taiga-grey-light">
            {formatDistanceToNow(new Date(entry.created_at), { addSuffix: true })}
          </span>
        </div>

        {/* Field changes */}
        {hasChanges && (
          <div className="mt-1 space-y-0.5">
            {Object.entries(entry.values_diff!).map(([field, [from, to]]) => (
              <div key={field}>
                <ChangeItem field={field} from={from} to={to} />
              </div>
            ))}
          </div>
        )}

        {/* Comment */}
        {hasComment && !editing && (
          <div className="mt-1">
            <div
              className="prose prose-sm max-w-none text-sm"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.comment_html ?? entry.comment ?? '') }}
            />
            {isOwnComment && (
              <div className="mt-1 flex gap-2">
                {onEditComment && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditText(entry.comment ?? '');
                      setEditing(true);
                    }}
                    className="text-xs text-taiga-link hover:underline"
                  >
                    Edit
                  </button>
                )}
                {onDeleteComment && (
                  <button
                    type="button"
                    onClick={() => onDeleteComment(entry.id)}
                    className="text-xs text-taiga-red hover:underline"
                  >
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Edit comment form */}
        {editing && (
          <div className="mt-1">
            <RichTextEditor
              value={editText}
              onChange={setEditText}
              onSubmit={handleSaveEdit}
              members={members}
              minHeight={80}
              submitLabel="Update"
            />
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="text-xs text-taiga-grey mt-1 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Deleted comment notice */}
        {isDeleted && (
          <p className="mt-1 text-xs text-taiga-grey-light italic">Comment deleted</p>
        )}
      </div>
    </div>
  );
}

export function ActivityFeed({
  entries,
  currentUserId,
  members,
  onAddComment,
  onEditComment,
  onDeleteComment,
  loading = false,
  className,
}: ActivityFeedProps) {
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (text: string) => {
    onAddComment?.(text);
    setNewComment('');
  };

  const visibleEntries = entries.filter((e) => !e.is_hidden);

  return (
    <div className={clsx('space-y-4', className)}>
      {/* New comment form */}
      {onAddComment && (
        <RichTextEditor
          value={newComment}
          onChange={setNewComment}
          onSubmit={handleSubmit}
          members={members}
          placeholder="Write a comment..."
          minHeight={80}
          submitLabel="Comment"
        />
      )}

      {loading && (
        <p className="text-sm text-taiga-grey-light">Loading activity...</p>
      )}

      {/* Entries */}
      <div className="space-y-4">
        {visibleEntries.map((entry) => (
          <ActivityEntry
            key={entry.id}
            entry={entry}
            currentUserId={currentUserId}
            members={members}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
          />
        ))}
        {!loading && visibleEntries.length === 0 && (
          <p className="text-sm text-taiga-grey-light italic">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
