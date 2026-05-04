import { useState } from 'react';
import { useHistory, usePostComment } from '@/services/history';
import { Avatar } from '@/components/common/Avatar';
import { sanitizeHtml } from '@/lib/sanitize';
import type { HistoryEntry } from '@/types/api';

interface CommentsSectionProps {
  usId: number;
  version: number;
}

export function CommentsSection({ usId, version }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState('');
  const { data: history, isLoading } = useHistory('userstory', usId);
  const postComment = usePostComment('userstory');

  const comments = (history ?? []).filter(
    (entry: HistoryEntry) => entry.comment && entry.comment.trim().length > 0,
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    postComment.mutate(
      { id: usId, comment: newComment.trim(), version },
      { onSuccess: () => setNewComment('') },
    );
  };

  return (
    <section>
      <h2 className="font-semibold text-taiga-text mb-3">
        Comments & Activity
        {comments.length > 0 && (
          <span className="ml-1 text-xs text-taiga-grey-light">({comments.length})</span>
        )}
      </h2>

      {/* Comment form */}
      <form onSubmit={handleSubmit} className="mb-4">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full border border-taiga-grey-lighter rounded px-3 py-2 text-sm focus:outline-none focus:border-taiga-primary resize-y"
        />
        <div className="flex justify-end mt-1">
          <button
            type="submit"
            disabled={!newComment.trim() || postComment.isPending}
            className="px-3 py-1.5 bg-taiga-primary text-white text-sm rounded disabled:opacity-50 hover:bg-taiga-primary/90"
          >
            {postComment.isPending ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </form>

      {/* Comments list */}
      {isLoading && <p className="text-sm text-taiga-grey-light">Loading activity...</p>}
      {comments.length === 0 && !isLoading && (
        <p className="text-sm text-taiga-grey-light italic">No comments yet.</p>
      )}
      {comments.length > 0 && (
        <ul className="space-y-3">
          {comments.map((entry: HistoryEntry) => (
            <li key={entry.id} className="flex gap-3">
              <Avatar
                name={entry.user?.name ?? 'Unknown'}
                src={entry.user?.photo}
                size={32}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium text-taiga-text">
                    {entry.user?.name ?? entry.user?.username ?? 'Unknown'}
                  </span>
                  {entry.created_at && (
                    <span className="text-xs text-taiga-grey-light">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {entry.comment_html ? (
                  <div
                    className="text-sm text-taiga-text mt-0.5 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.comment_html) }}
                  />
                ) : (
                  <p className="text-sm text-taiga-text mt-0.5 whitespace-pre-wrap">
                    {entry.comment}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
