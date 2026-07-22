import { Link, useOutletContext } from 'react-router-dom';
import { useEpics } from '@/projects/queries';
import { StatusPill } from '@/components/StatusPill';
import type { ProjectDetail } from '@/api/types';

export default function Epics() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { data: epics } = useEpics(project.id);

  return (
    <div data-testid="epics">
      <h1>Epics</h1>
      {epics && epics.length === 0 && <div className="empty">No epics.</div>}
      {epics && epics.length > 0 && (
        <ul className="list card" data-testid="epics-list">
          {epics.map((e) => (
            <li key={e.id} data-testid={`epic-row-${e.ref}`}>
              <span className="ref">#{e.ref}</span>
              <Link to={`/project/${project.slug}/epic/${e.ref}`} className="grow subject-link">
                {e.subject}
              </Link>
              <StatusPill name={e.status_extra_info.name} color={e.status_extra_info.color} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
