import { useParams } from 'react-router-dom';
import { useProjectBySlug, useProjectTimeline } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { TimelineFeed } from '../../components/TimelineFeed';
import { useEvents } from '../../api/useEvents';
import { useQueryClient } from '@tanstack/react-query';

export default function Timeline() {
  const { pslug } = useParams();
  const { data: project } = useProjectBySlug(pslug);
  const { data: timeline, isLoading } = useProjectTimeline(project?.id);
  const qc = useQueryClient();

  useEvents(project ? `project.${project.id}.timeline` : null, () => {
    qc.invalidateQueries({ queryKey: ['timeline', 'project', project?.id] });
  });

  return (
    <div data-testid="project-timeline">
      <h1 className="text-xl font-semibold text-slate-800">Timeline</h1>
      <p className="mt-1 text-sm text-slate-500">Recent activity on {project?.name}.</p>
      <div className="mt-5">
        {isLoading ? <Loader /> : timeline && timeline.length ? (
          <TimelineFeed entries={timeline} />
        ) : (
          <p className="text-sm text-slate-500">No activity yet.</p>
        )}
      </div>
    </div>
  );
}
