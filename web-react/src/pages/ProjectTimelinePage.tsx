import { useCallback, useEffect, useState } from 'react';
import { getProjectIdBySlug, getProjectTimelinePage } from '@/lib/historyApi';
import { formatRelativeTime } from '@/lib/taigaDate';
import type { TimelineEvent } from '@/types/history';
import '@/components/history/history.css';

function textFromEvent(ev: TimelineEvent): string {
  const vd = ev.data?.value_diff;
  if (vd && typeof vd === 'object' && 'key' in vd) {
    const o = vd as { key: string; value: unknown };
    return `${o.key}: ${JSON.stringify(o.value).slice(0, 180)}`;
  }
  if (ev.data?.values_diff && typeof ev.data.values_diff === 'object') {
    const k = Object.keys(ev.data.values_diff)[0];
    if (k) {
      return `${k}: ${JSON.stringify((ev.data.values_diff as Record<string, unknown>)[k]).slice(0, 180)}`;
    }
  }
  return ev.event_type;
}

type Props = { pslug: string };

export function ProjectTimelinePage({ pslug }: Props) {
  const [items, setItems] = useState<TimelineEvent[]>([]);
  const [page, setPage] = useState(1);
  const [next, setNext] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(
    async (p: number, append: boolean) => {
      setErr(null);
      try {
        const pid = await getProjectIdBySlug(pslug);
        const data = await getProjectTimelinePage(pid, p);
        // lazy pagination: empty page means end
        if (data.length === 0) {
          setNext(false);
          if (!append) setItems([]);
          return;
        }
        setItems((prev) => (append ? [...prev, ...data] : data));
        setNext(data.length > 0);
        setPage(p);
      } catch (e) {
        setErr(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    },
    [pslug],
  );

  useEffect(() => {
    setLoading(true);
    void load(1, false);
  }, [load]);

  if (loading) {
    return <p data-e2e-timeline-loading>Loading timeline…</p>;
  }
  if (err) {
    return <p className="taiga-history-error">{err}</p>;
  }

  return (
    <div className="taiga-surface" data-e2e-project-timeline>
      <h1 className="app-shell__page-title" style={{ marginTop: 0 }}>
        Project activity
      </h1>
      <p className="app-shell__lede" style={{ color: 'var(--color-text-muted)', marginTop: 0 }}>
        Timelines mirror <code>/project/{pslug}/timeline</code> in the reference app.
      </p>
      <section className="profile-timeline">
        {items.map((ev, i) => {
          const u = ev.data?.user;
          const created = (ev as { created?: string }).created;
          return (
            <div className="taiga-activity-item" key={String(ev.id ?? i)} data-e2e-timeline-item>
              <div className="taiga-activity-item__date">{formatRelativeTime(created)}</div>
              <div className="taiga-activity-item__row">
                <div className="taiga-activity-item__pic">
                  {u?.photo ? (
                    <img src={u.photo} alt={u.name ?? ''} data-e2e-timeline-avatar />
                  ) : null}
                </div>
                <p className="taiga-activity-item__html">{textFromEvent(ev)}</p>
              </div>
            </div>
          );
        })}
        {next ? (
          <div className="taiga-load-more">
            <button
              type="button"
              className="taiga-btn taiga-btn--ghost"
              onClick={() => void load(page + 1, true)}
              data-e2e-timeline-more
            >
              Load more
            </button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
