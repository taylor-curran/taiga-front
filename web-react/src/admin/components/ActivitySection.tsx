import type { ActivityEntry } from '../../api/historyTypes';
import { formatTaigaDate } from '../formatDates';
import { useHistoryStore } from '../historyStore';
import { userAvatarSrc } from './avatarUrl';

function DiffBlock({ diffKey, diff }: { diffKey: string; diff: unknown }) {
  return (
    <div className="activity-diff-block">
      <span className="diff-key">{diffKey}</span>
      <span className="diff-json">{typeof diff === 'string' ? diff : JSON.stringify(diff)}</span>
    </div>
  );
}

function ActivityRow({ activity, modelLabel }: { activity: ActivityEntry; modelLabel: string }) {
  const diffs = activity.values_diff ?? {};
  return (
    <div className="activity">
      <img
        className="activity-avatar"
        src={userAvatarSrc(activity.user.photo) ?? '/static/images/unnamed.png'}
        alt={activity.user.name ?? ''}
      />
      <div className="activity-main">
        <div className="activity-data">
          <span className="activity-creator">{activity.user.name}</span>
          <span className="activity-date">{formatTaigaDate(activity.created_at)}</span>
        </div>
        {Object.entries(diffs).map(([k, v]) => (
          <DiffBlock key={k} diffKey={`${modelLabel} · ${k}`} diff={v} />
        ))}
      </div>
    </div>
  );
}

export function ActivitySection({ modelLabel }: { modelLabel: string }) {
  const activities = useHistoryStore((s) => s.activities);
  const loadingActivity = useHistoryStore((s) => s.loadingActivity);
  const activityHasNext = useHistoryStore((s) => s.activityHasNext);
  const loadMore = useHistoryStore((s) => s.loadMoreActivity);

  return (
    <section className="activities">
      <div className="activities-wrapper">
        {activities.map((a) => (
          <ActivityRow key={a.id} activity={a} modelLabel={modelLabel} />
        ))}
      </div>
      {activityHasNext ? (
        <button type="button" className="activity-load-more" disabled={loadingActivity} onClick={() => void loadMore()}>
          {loadingActivity ? 'Loading…' : 'Load more'}
        </button>
      ) : null}
    </section>
  );
}
