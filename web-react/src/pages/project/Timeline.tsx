import { useOutletContext } from 'react-router-dom';
import { useTimeline } from '@/projects/queries';
import type { ProjectDetail } from '@/api/types';

interface TimelineEntry {
  id: number;
  created: string;
  event_type: string;
  data: {
    project?: { name?: string; slug?: string };
    user?: { name?: string };
    subject?: string;
    [k: string]: unknown;
  };
}

export default function Timeline() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { data, isPending } = useTimeline(project.id);

  return (
    <div data-testid="timeline">
      <h1>Timeline</h1>
      <p className="muted">Activity for project <strong>{project.name}</strong>.</p>
      {isPending && <p className="muted">Loading…</p>}
      {data && (data as TimelineEntry[]).length === 0 && (
        <div className="empty">No activity yet.</div>
      )}
      {data && (data as TimelineEntry[]).length > 0 && (
        <ul className="list card" data-testid="timeline-list">
          {(data as TimelineEntry[]).slice(0, 50).map((e) => (
            <li key={e.id}>
              <span className="grow">
                <strong>{e.data?.user?.name ?? 'Someone'}</strong>{' '}
                <span className="muted">{e.event_type}</span>{' '}
                {e.data?.subject && <em>“{e.data.subject}”</em>}
              </span>
              <span className="muted">{new Date(e.created).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
