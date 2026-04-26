import { useCallback, useEffect, useState } from 'react';
import {
  listActivity,
  listComments,
  editComment,
  deleteComment,
  undeleteComment,
  getUserstoryForComment,
  patchUserstory,
} from '@/lib/historyApi';
import type { ActivityEntry, HistoryComment } from '@/types/history';
import { useHistorySettingsStore } from '@/stores/historySettingsStore';
import { CommentList } from './CommentList';
import { ActivityList } from './ActivityList';
import { HistoryTabs } from './HistoryTabs';
import './history.css';

type Content = 'us' | 'issue' | 'task' | 'epic' | 'wiki';

type Props = {
  name: Content;
  objectId: number;
  canComment: boolean;
  canModerate: boolean;
  currentUserId: number;
};

export function HistorySection({
  name,
  objectId,
  canComment,
  canModerate,
  currentUserId,
}: Props) {
  const reverse = useHistorySettingsStore((s) => s.orderCommentsReversed);
  const toggleOrder = useHistorySettingsStore((s) => s.toggleOrderComments);
  const [viewComments, setViewComments] = useState(true);
  const [comments, setComments] = useState<HistoryComment[]>([]);
  const [commentsNum, setCommentsNum] = useState(0);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [activitiesNum, setActivitiesNum] = useState(0);
  const [activityPage, setActivityPage] = useState(1);
  const [activityHasNext, setActivityHasNext] = useState(false);
  const [editMode, setEditMode] = useState<Record<number, boolean>>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadComments = useCallback(async () => {
    const r = await listComments(name, objectId, reverse);
    setComments(r.comments);
    setCommentsNum(r.commentsNum);
  }, [name, objectId, reverse]);

  const loadActivityFirst = useCallback(async () => {
    const r = await listActivity(name, objectId, 1);
    setActivities(r.activities);
    const c = r.count != null && r.count !== '' ? parseInt(r.count, 10) : r.activities.length;
    setActivitiesNum(Number.isFinite(c) ? c : r.activities.length);
    setActivityPage(1);
    setActivityHasNext(r.hasNext);
  }, [name, objectId]);

  const loadAll = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await Promise.all([loadComments(), loadActivityFirst()]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [loadActivityFirst, loadComments]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (loading) return;
    void loadComments();
  }, [reverse, loading, loadComments]);

  useEffect(() => {
    const showAfterLoad = commentsNum > 0 || canComment;
    const actTab = activitiesNum > 0;
    if (!showAfterLoad && actTab) setViewComments(false);
  }, [commentsNum, activitiesNum, canComment]);

  const showActivityTab = activitiesNum > 0;
  const showCommentTab = commentsNum > 0 || canComment;
  const showSection = showCommentTab || showActivityTab;

  const canEditComment = (c: HistoryComment) => {
    if (c.delete_comment_date) {
      return canModerate;
    }
    return c.user?.pk === currentUserId || canModerate;
  };

  const onEditComment = async (commentId: number, text: string) => {
    setEditingId(commentId);
    try {
      await editComment(name, objectId, commentId, text);
      setEditMode((m) => ({ ...m, [commentId]: false }));
      await loadComments();
    } finally {
      setEditingId(null);
    }
  };

  const onDeleteComment = async (commentId: number) => {
    setDeletingId(commentId);
    try {
      await deleteComment(name, objectId, commentId);
      await loadComments();
    } finally {
      setDeletingId(null);
    }
  };

  const onRestore = async (commentId: number) => {
    setEditingId(commentId);
    try {
      await undeleteComment(name, objectId, commentId);
      await loadComments();
    } finally {
      setEditingId(null);
    }
  };

  const onPostComment = async () => {
    if (name !== 'us') {
      setError('Posting is wired for user stories in this slice.');
      return;
    }
    const text = newComment.trim();
    if (!text) return;
    setPosting(true);
    try {
      const { version } = await getUserstoryForComment(objectId);
      await patchUserstory(objectId, { comment: `<p>${escapeHtmlSimple(text)}</p>`, version });
      setNewComment('');
      setEditMode({});
      await loadComments();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Post failed');
    } finally {
      setPosting(false);
    }
  };

  const nextActivity = async () => {
    if (!activityHasNext) return;
    const nextP = activityPage + 1;
    const r = await listActivity(name, objectId, nextP);
    setActivities((prev) => [...prev, ...r.activities]);
    setActivityPage(nextP);
    setActivityHasNext(r.hasNext);
  };

  if (loading) {
    return <p className="taiga-history-section">Loading…</p>;
  }

  if (!showSection) {
    return null;
  }

  return (
    <section className="taiga-history-section" data-testid="history-section">
      {error ? <p className="taiga-history-error">{error}</p> : null}
      <HistoryTabs
        showCommentTab={showCommentTab}
        showActivityTab={showActivityTab}
        commentsNum={commentsNum}
        activitiesNum={activitiesNum}
        viewComments={viewComments}
        onViewComments={setViewComments}
        reverse={reverse}
        onToggleOrder={toggleOrder}
      />
      {viewComments && showCommentTab ? (
        <>
          <CommentList
            comments={comments}
            canEdit={canEditComment}
            editingId={editingId}
            deletingId={deletingId}
            editMode={editMode}
            onEditMode={(id) => setEditMode((m) => ({ ...m, [id]: !m[id] }))}
            onEdit={onEditComment}
            onDelete={onDeleteComment}
            onRestore={onRestore}
          />
          {canComment && name === 'us' ? (
            <div className="taiga-comments__add">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type a new comment here"
                data-testid="e2e-new-comment"
              />
              <div className="taiga-comments__add-actions">
                <button
                  type="button"
                  className="taiga-btn taiga-btn--primary"
                  onClick={() => void onPostComment()}
                  disabled={posting || !newComment.trim()}
                  data-testid="e2e-post-comment"
                >
                  {posting ? 'Saving…' : 'Comment'}
                </button>
              </div>
            </div>
          ) : null}
        </>
      ) : null}
      {!viewComments && showActivityTab ? (
        <>
          <ActivityList activities={activities} />
          {activityHasNext ? (
            <div className="taiga-load-more">
              <button
                type="button"
                className="taiga-btn taiga-btn--ghost"
                onClick={() => void nextActivity()}
                data-e2e-load-more-activity
              >
                Load more
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}

function escapeHtmlSimple(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
