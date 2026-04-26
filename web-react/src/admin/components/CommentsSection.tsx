import { useState } from 'react';
import type { HistoryContentType } from '../../api/historyTypes';
import { useHistoryStore, type ProjectLike } from '../historyStore';
import { CommentBlock } from './CommentBlock';

type Props = {
  name: HistoryContentType;
  project: ProjectLike | null;
  currentUserPk: number | null;
};

export function CommentsSection({ name, project, currentUserPk }: Props) {
  const comments = useHistoryStore((s) => s.comments);
  const reverseOrder = useHistoryStore((s) => s.reverseOrder);
  const addComment = useHistoryStore((s) => s.addComment);
  const posting = useHistoryStore((s) => s.postingComment);
  const postErr = useHistoryStore((s) => s.postCommentError);
  const canAdd =
    !!project?.my_permissions?.includes(`comment_${name}`) ||
    !!project?.my_permissions?.includes('modify_project');

  const [draft, setDraft] = useState('');

  function CommentComposer() {
    if (!canAdd) return null;
    return (
      <div className="add-comment">
        <textarea
          placeholder="Type a new comment…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        {postErr ? (
          <p className="comment-post-error" role="alert">
            {postErr}
          </p>
        ) : null}
        <div className="save-comment-wrapper">
          <button
            type="button"
            className="save-comment e2e-post-comment"
            aria-label="Post comment"
            disabled={posting || !draft.trim()}
            onClick={() => {
              const t = draft.trim();
              void addComment(t).then(() => setDraft(''));
            }}
          >
            Comment
          </button>
        </div>
      </div>
    );
  }

  return (
    <section className="comments">
      {!reverseOrder ? <CommentComposer /> : null}
      <div className="comments-wrapper">
        {comments.map((c) => (
          <CommentBlock key={c.id} comment={c} project={project} currentUserPk={currentUserPk} />
        ))}
      </div>
      {reverseOrder ? <CommentComposer /> : null}
    </section>
  );
}
