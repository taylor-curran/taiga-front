import { useQuery } from '@tanstack/react-query';
import { useOutletContext } from 'react-router-dom';
import { timeline } from '../api/resources';
import type { Project, TimelineEntry } from '../types';
import Loader from '../components/common/Loader';
import { formatDistanceToNow } from 'date-fns';

export default function ProjectTimelinePage() {
  const { project } = useOutletContext<{ project: Project }>();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['project-timeline', project.id],
    queryFn: async () => {
      const res = await timeline.getProjectTimeline(project.id, { page_size: 50 });
      return res.data;
    },
  });

  if (isLoading) return <Loader />;

  return (
    <div className="timeline-page">
      <h1>Timeline</h1>
      {!entries?.length ? (
        <div className="empty-state">
          <p>No activity yet for this project.</p>
        </div>
      ) : (
        <div className="timeline-entries">
          {entries.map((entry: TimelineEntry) => (
            <div key={entry.id} className="timeline-entry">
              <div className="timeline-entry-header">
                <span className="timeline-event-type">{entry.event_type.replace(/\./g, ' ')}</span>
                <span className="timeline-entry-date">
                  {formatDistanceToNow(new Date(entry.created), { addSuffix: true })}
                </span>
              </div>
              {entry.data && (
                <div className="timeline-entry-data">
                  {(() => {
                    const d = entry.data as Record<string, unknown>;
                    const p = d.project as Record<string, unknown> | undefined;
                    return p?.name ? <span className="timeline-project">{String(p.name)}</span> : null;
                  })()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
