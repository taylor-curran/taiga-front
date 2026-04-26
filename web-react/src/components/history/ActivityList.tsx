import type { ActivityEntry } from '@/types/history';
import { formatTaigaDateTime } from '@/lib/taigaDate';

type Props = {
  activities: ActivityEntry[];
};

function diffSummary(d: unknown): string {
  if (d == null) return '—';
  if (typeof d === 'string') return d;
  if (typeof d === 'object') {
    return JSON.stringify(d, null, 0).slice(0, 200);
  }
  return String(d);
}

function avatarUrl(photo: string | null | undefined): string | null {
  if (photo && photo.length) return photo;
  return null;
}

export function ActivityList({ activities }: Props) {
  return (
    <div className="taiga-activities" data-testid="activity-list">
      {activities.map((a) => {
        const keys = a.values_diff && typeof a.values_diff === 'object' ? Object.keys(a.values_diff) : [];
        return (
          <div className="taiga-activity" key={a.id} data-e2e-activity-id={a.id}>
            <img
              className="taiga-activity__avatar"
              src={avatarUrl(a.user?.photo) ?? undefined}
              alt={a.user?.name ?? ''}
            />
            <div className="taiga-activity__main">
              <div className="taiga-activity__meta">
                <span className="taiga-activity__creator">{a.user?.name}</span>
                <span className="taiga-activity__date" data-e2e-activity-date>
                  {formatTaigaDateTime(a.created_at)}
                </span>
              </div>
              {keys.length ? (
                <div>
                  {keys.map((k) => (
                    <div key={k} className="taiga-activity__diff" data-e2e-activity-key={k}>
                      <strong>{k}:</strong> {diffSummary((a.values_diff as Record<string, unknown>)[k])}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}
