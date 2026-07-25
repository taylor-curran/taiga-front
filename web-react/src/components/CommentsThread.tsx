import { FormEvent, useState } from 'react';
import { useHistory, usePostComment, type HistoryRecord } from '../api/resources';
import { Avatar } from './Avatar';
import { Markdown } from './Markdown';
import { formatRelative } from '../utils/dates';

interface Props {
  kind: 'us' | 'task' | 'issue' | 'epic' | 'wiki';
  itemId: number;
  version?: number;
}

export function CommentsThread({ kind, itemId, version }: Props) {
  const { data: history, isLoading, refetch } = useHistory(kind, itemId);
  const post = usePostComment(kind);
  const [body, setBody] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;
    await post.mutateAsync({ id: itemId, comment: body, version });
    setBody('');
    await refetch();
  };

  const comments = (history ?? []).filter((h: HistoryRecord) => h.comment).reverse();

  return (
    <div className="mt-6" data-testid="comments-thread">
      <h3 className="text-sm font-semibold uppercase text-slate-500">Comments ({comments.length})</h3>
      <form className="mt-3 flex gap-3" onSubmit={submit}>
        <Avatar user={null} size={36} />
        <div className="flex-1">
          <textarea
            className="input min-h-[80px]"
            placeholder="Add a comment…"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            data-testid="comment-textarea"
          />
          <div className="mt-2 flex justify-end">
            <button className="btn-primary" disabled={post.isPending || !body.trim()} data-testid="comment-submit">
              {post.isPending ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </div>
      </form>
      {isLoading && <p className="text-xs text-slate-400">Loading comments…</p>}
      <ul className="mt-4 space-y-4">
        {comments.map((c: HistoryRecord) => (
          <li key={c.id} className="flex gap-3" data-testid="comment">
            <Avatar
              user={c.user ? { full_name: c.user.name, photo: c.user.photo, username: c.user.username } : undefined}
              size={36}
            />
            <div className="flex-1 rounded border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">
                  {c.user?.name || c.user?.username || 'Someone'}
                </span>
                <span>{formatRelative(c.created_at)}</span>
              </div>
              <div className="mt-2 text-sm">
                <Markdown html={c.comment_html} source={c.comment} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
