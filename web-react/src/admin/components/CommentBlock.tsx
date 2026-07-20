import { useState } from 'react';
import type { HistoryComment } from '../../api/historyTypes';
import { formatTaigaDate } from '../formatDates';
import { sanitizeCommentHtml } from '../sanitizeCommentHtml';
import { useHistoryStore, type ProjectLike } from '../historyStore';
import { userAvatarSrc } from './avatarUrl';
import { CommentHistoryLightbox } from './CommentHistoryLightbox';

type Props = {
  comment: HistoryComment;
  project: ProjectLike | null;
  currentUserPk: number | null;
};

function canEditDelete(
  currentUserPk: number | null,
  project: ProjectLike | null,
  commentUserPk: number,
): boolean {
  if (currentUserPk != null && currentUserPk === commentUserPk) return true;
  return !!project?.my_permissions?.includes('modify_project');
}

export function CommentBlock({ comment, project, currentUserPk }: Props) {
  const deleting = useHistoryStore((s) => s.deleting);
  const editing = useHistoryStore((s) => s.editing);
  const editMode = useHistoryStore((s) => s.editMode[comment.id]);
  const toggleEditMode = useHistoryStore((s) => s.toggleEditMode);
  const onDelete = useHistoryStore((s) => s.deleteComment);
  const onRestore = useHistoryStore((s) => s.restoreDeletedComment);
  const onEdit = useHistoryStore((s) => s.editComment);

  const [hiddenDeleted, setHiddenDeleted] = useState(true);
  const [editText, setEditText] = useState(comment.comment);
  const [historyOpen, setHistoryOpen] = useState(false);

  const isDeleted = Boolean(comment.delete_comment_date);
  const mod = canEditDelete(currentUserPk, project, comment.user.pk);

  if (isDeleted) {
    return (
      <div className="comment deleted-comment">
        <div className="deleted-comment-wrapper">
          <div className="deleted-comment-main">
            <span>
              Deleted by {comment.delete_comment_user?.name ?? '—'} on{' '}
              {formatTaigaDate(comment.delete_comment_date)}
            </span>
            {hiddenDeleted ? (
              <button type="button" className="toggle-deleted-comment" onClick={() => setHiddenDeleted(false)}>
                Show deleted ▼
              </button>
            ) : (
              <button type="button" className="toggle-deleted-comment" onClick={() => setHiddenDeleted(true)}>
                Hide deleted ▲
              </button>
            )}
            <button
              type="button"
              className="restore-comment"
              onClick={() => void onRestore(comment.id)}
              disabled={editing === comment.id}
            >
              ⟳ Restore
            </button>
          </div>
          {!hiddenDeleted ? (
            <div
              className="deleted-comment-comment wysiwyg"
              dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(comment.comment) }}
            />
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="comment">
      <div className="comment-wrapper">
        <img
          className="comment-avatar"
          src={userAvatarSrc(comment.user.photo) ?? '/static/images/unnamed.png'}
          alt={comment.user.name ?? ''}
        />
        <div className="comment-main">
          <div className="comment-content-wrapper">
            <div className="comment-data">
              <span className="comment-creator">{comment.user.name}</span>
              <span className="comment-date">{formatTaigaDate(comment.created_at)}</span>
              {comment.edit_comment_date ? (
                <span className="comment-edited">
                  <span>Edited</span>
                  <span> {formatTaigaDate(comment.edit_comment_date)}</span>
                  <span className="separator">-</span>
                  <a
                    href="#"
                    className="comment-history"
                    onClick={(e) => {
                      e.preventDefault();
                      setHistoryOpen(true);
                    }}
                  >
                    Show history
                  </a>
                </span>
              ) : null}
            </div>
            {!editMode ? (
              <div
                className="comment-text wysiwyg"
                dangerouslySetInnerHTML={{ __html: sanitizeCommentHtml(comment.comment) }}
              />
            ) : (
              <div
                className="comment-editor"
                onKeyDown={(e) => {
                  if (e.key === 'Escape') toggleEditMode(comment.id);
                }}
              >
                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} />
                <div className="save-comment-wrapper">
                  <button
                    type="button"
                    className="save-comment"
                    onClick={() => void onEdit(comment.id, editText)}
                    disabled={editing === comment.id}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
          {mod && !editMode ? (
            <div className="comment-options">
              <button
                type="button"
                className="comment-option icon-edit"
                title="Edit"
                aria-label="Edit"
                onClick={() => {
                  setEditText(comment.comment);
                  toggleEditMode(comment.id);
                }}
              >
                ✎
              </button>
              <button
                type="button"
                className="comment-option icon-trash"
                title="Delete"
                aria-label="Delete"
                disabled={deleting === comment.id}
                onClick={() => void onDelete(comment.id)}
              >
                🗑
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <CommentHistoryLightbox open={historyOpen} onClose={() => setHistoryOpen(false)} activityId={comment.id} />
    </div>
  );
}
