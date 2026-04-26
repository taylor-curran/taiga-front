type Props = {
  showCommentTab: boolean;
  showActivityTab: boolean;
  commentsNum: number;
  activitiesNum: number;
  viewComments: boolean;
  onViewComments: (v: boolean) => void;
  reverse: boolean;
  onToggleOrder: () => void;
};

export function HistoryTabs({
  showCommentTab,
  showActivityTab,
  commentsNum,
  activitiesNum,
  viewComments,
  onViewComments,
  reverse,
  onToggleOrder,
}: Props) {
  if (!showCommentTab && !showActivityTab) return null;

  return (
    <div className="taiga-history-tabs" data-e2e-history-tabs>
      <div className="taiga-history-tabs__nav" role="tablist">
        {showCommentTab ? (
          <button
            type="button"
            role="tab"
            aria-selected={viewComments}
            className={
              viewComments
                ? 'taiga-history-tab taiga-history-tab--active e2e-comments-tab'
                : 'taiga-history-tab e2e-comments-tab'
            }
            data-testid="e2e-comments-tab"
            onClick={() => onViewComments(true)}
          >
            comments ({commentsNum})
          </button>
        ) : null}
        {showActivityTab ? (
          <button
            type="button"
            role="tab"
            aria-selected={!viewComments}
            className={
              !viewComments
                ? 'taiga-history-tab taiga-history-tab--active e2e-activity-tab'
                : 'taiga-history-tab e2e-activity-tab'
            }
            data-testid="e2e-activity-tab"
            onClick={() => onViewComments(false)}
          >
            activity ({activitiesNum})
          </button>
        ) : null}
      </div>
      {viewComments && showCommentTab ? (
        <div className="taiga-history-tabs__order" data-e2e-order-comments>
          <span>order:</span>
          <button type="button" onClick={onToggleOrder} data-e2e-toggle-order>
            {reverse ? 'oldest' : 'newest'} first
          </button>
        </div>
      ) : null}
    </div>
  );
}
