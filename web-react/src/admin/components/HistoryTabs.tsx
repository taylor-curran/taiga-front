import { showActivityTab, showCommentTab, useHistoryStore } from '../historyStore';

export function HistoryTabs() {
  const viewComments = useHistoryStore((s) => s.viewComments);
  const commentsNum = useHistoryStore((s) => s.commentsNum);
  const activitiesNum = useHistoryStore((s) => s.activitiesNum);
  const reverseOrder = useHistoryStore((s) => s.reverseOrder);
  const contentType = useHistoryStore((s) => s.contentType);
  const project = useHistoryStore((s) => s.project);
  const setViewComments = useHistoryStore((s) => s.setViewComments);
  const toggleCommentOrder = useHistoryStore((s) => s.toggleCommentOrder);

  const showComments = showCommentTab({ commentsNum, project, contentType });
  const showActivity = showActivityTab({ activitiesNum });

  if (!showComments && !showActivity) return null;

  return (
    <nav className="history-tabs">
      {showComments ? (
        <a
          href="#"
          role="button"
          className={`history-tab e2e-comments-tab${viewComments ? ' active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setViewComments(true);
          }}
        >
          {commentsNum} comments
        </a>
      ) : null}
      {showActivity ? (
        <a
          href="#"
          role="button"
          className={`history-tab e2e-activity-tab${!viewComments ? ' active' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            setViewComments(false);
          }}
        >
          {activitiesNum ?? 0} activities
        </a>
      ) : null}
      {commentsNum > 1 && viewComments ? (
        <a
          href="#"
          role="button"
          className={`order-comments${reverseOrder ? ' new-first' : ' old-first'}`}
          onClick={(e) => {
            e.preventDefault();
            void toggleCommentOrder();
          }}
        >
          {!reverseOrder ? (
            <>
              <span>Older first</span>
              <span className="icon-arrow" aria-hidden>
                ↑
              </span>
            </>
          ) : (
            <>
              <span>Recent first</span>
              <span className="icon-arrow" aria-hidden>
                ↑
              </span>
            </>
          )}
        </a>
      ) : null}
    </nav>
  );
}
