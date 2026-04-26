import { useState } from 'react';
import type { HistoryComment } from '@/types/history';
import { formatTaigaDateTime } from '@/lib/taigaDate';

type Props = {
  comments: HistoryComment[];
  canEdit: (c: HistoryComment) => boolean;
  editingId: number | null;
  deletingId: number | null;
  editMode: Record<number, boolean>;
  onEditMode: (id: number) => void;
  onEdit: (id: number, text: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onRestore: (id: number) => Promise<void>;
};

function avatarUrl(u: HistoryComment['user']): string | null {
  const p = u?.photo;
  if (p && typeof p === 'string' && p.length) return p;
  return null;
}

function CommentItem({
  comment,
  canEdit,
  isEditing,
  isBusy,
  onEditMode,
  onEdit,
  onDelete,
  onRestore,
}: {
  comment: HistoryComment;
  canEdit: boolean;
  isEditing: boolean;
  isBusy: boolean;
  onEditMode: () => void;
  onEdit: (text: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onRestore: () => Promise<void>;
}) {
  const [editText, setEditText] = useState(comment.comment);
  const isDeleted = Boolean(comment.delete_comment_date);

  if (isDeleted) {
    return (
      <div className="taiga-comment taiga-comment--deleted" data-e2e-comment-deleted>
        <div className="taiga-comment__wrapper">
          <div className="taiga-comment__body" style={{ width: '100%' }}>
            <div className="taiga-comment__deleted-main">
              <span>
                Deleted by {comment.delete_comment_user?.name ?? '—'} —{' '}
                {formatTaigaDateTime(comment.delete_comment_date ?? undefined)}
              </span>
            </div>
            {canEdit ? (
              <button type="button" className="taiga-comment__restore" onClick={onRestore} disabled={isBusy}>
                {isBusy ? '…' : 'Restore'}
              </button>
            ) : null}
            <div
              className="taiga-comment__text"
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: comment.comment }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="taiga-comment" data-e2e-comment-id={comment.id}>
      <div className="taiga-comment__wrapper">
        <img
          className="taiga-comment__avatar"
          src={avatarUrl(comment.user) ?? undefined}
          alt={comment.user?.name ?? ''}
          data-e2e-avatar
        />
        <div className="taiga-comment__body">
          <div className="taiga-comment__main">
            <div>
              <div className="taiga-comment__meta">
                <span className="taiga-comment__creator">{comment.user?.name}</span>
                <span className="taiga-comment__date" data-e2e-comment-date>
                  {formatTaigaDateTime(comment.created_at)}
                </span>
                {comment.edit_comment_date ? (
                  <span className="taiga-comment__edited">
                    edited {formatTaigaDateTime(comment.edit_comment_date)}
                  </span>
                ) : null}
              </div>
              {isEditing ? (
                <div className="taiga-comment__text taiga-comment__text--edit">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    aria-label="Edit comment"
                  />
                  <div className="taiga-comments__add-actions">
                    <button
                      type="button"
                      className="taiga-btn taiga-btn--primary"
                      onClick={async () => {
                        await onEdit(editText);
                      }}
                      disabled={isBusy}
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="taiga-comment__text"
                  data-e2e-comment-html
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: comment.comment }}
                />
              )}
            </div>
            {canEdit ? (
              <div className="taiga-comment__options">
                {!isEditing ? (
                  <button type="button" onClick={onEditMode} aria-label="Edit">
                    edit
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={onDelete}
                  aria-label="Delete"
                  style={{ color: '#c82829' }}
                  disabled={isBusy}
                >
                  {isBusy ? '…' : 'delete'}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CommentList({
  comments,
  canEdit,
  editingId,
  deletingId,
  editMode,
  onEditMode,
  onEdit,
  onDelete,
  onRestore,
}: Props) {
  return (
    <div className="taiga-comments" data-testid="comment-list">
      {comments.map((c) => (
        <CommentItem
          key={c.id}
          comment={c}
          canEdit={canEdit(c)}
          isEditing={Boolean(editMode[c.id])}
          isBusy={editingId === c.id || deletingId === c.id}
          onEditMode={() => onEditMode(c.id)}
          onEdit={(text) => onEdit(c.id, text)}
          onDelete={() => onDelete(c.id)}
          onRestore={() => onRestore(c.id)}
        />
      ))}
    </div>
  );
}
