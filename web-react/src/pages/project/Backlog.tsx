import { Link, useOutletContext } from 'react-router-dom';
import { useUserStories, useMilestones } from '@/projects/queries';
import { StatusPill } from '@/components/StatusPill';
import type { ProjectDetail, UserStory } from '@/api/types';

interface CtxShape {
  project: ProjectDetail;
}

export default function Backlog() {
  const { project } = useOutletContext<CtxShape>();
  const { data: backlog } = useUserStories(project.id, { milestone: 'null' });
  const { data: sprints } = useMilestones(project.id);

  return (
    <div data-testid="backlog">
      <h1>Backlog</h1>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Sprints</h2>
        {sprints && sprints.length === 0 && <div className="empty">No sprints yet.</div>}
        <ul className="list card" data-testid="sprints-list">
          {sprints?.map((s) => (
            <li key={s.id}>
              <Link to={`/project/${project.slug}/taskboard/${s.slug}`} className="grow subject-link">
                {s.name}
              </Link>
              <span className="muted">
                {s.estimated_start} → {s.estimated_finish}
              </span>
              <span className="tag">{s.closed ? 'Closed' : 'Open'}</span>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Stories not in any sprint</h2>
        <BacklogList project={project} stories={backlog ?? []} />
      </section>
    </div>
  );
}

function BacklogList({ project, stories }: { project: ProjectDetail; stories: UserStory[] }) {
  if (stories.length === 0) {
    return <div className="empty">No stories.</div>;
  }
  return (
    <table className="tg-table" data-testid="backlog-table">
      <thead>
        <tr>
          <th style={{ width: 60 }}>Ref</th>
          <th>Subject</th>
          <th>Points</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {stories.map((us) => (
          <tr key={us.id} data-testid={`us-row-${us.ref}`}>
            <td className="muted">#{us.ref}</td>
            <td>
              <Link to={`/project/${project.slug}/us/${us.ref}`} className="subject-link">
                {us.subject}
              </Link>
            </td>
            <td>{us.total_points ?? '?'}</td>
            <td>
              <StatusPill name={us.status_extra_info.name} color={us.status_extra_info.color} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
