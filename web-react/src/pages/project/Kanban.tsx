import { Link, useOutletContext } from 'react-router-dom';
import { useUserStories } from '@/projects/queries';
import type { ProjectDetail, UserStory } from '@/api/types';

export default function Kanban() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { data: stories } = useUserStories(project.id);

  const byStatus = new Map<number, UserStory[]>();
  for (const s of project.us_statuses ?? []) byStatus.set(s.id, []);
  (stories ?? []).forEach((us) => {
    if (!byStatus.has(us.status)) byStatus.set(us.status, []);
    byStatus.get(us.status)!.push(us);
  });
  for (const list of byStatus.values()) {
    list.sort((a, b) => (a.kanban_order ?? 0) - (b.kanban_order ?? 0));
  }

  return (
    <div data-testid="kanban">
      <h1>Kanban</h1>
      <div className="kanban-board" data-testid="kanban-board">
        {(project.us_statuses ?? []).map((status) => (
          <div className="kanban-column" key={status.id} data-testid={`kanban-col-${status.id}`}>
            <header>
              <span style={{ color: status.color }}>{status.name}</span>
              <span className="muted">{byStatus.get(status.id)?.length ?? 0}</span>
            </header>
            {(byStatus.get(status.id) ?? []).map((us) => (
              <div className="kanban-card" key={us.id} data-testid={`kanban-card-${us.ref}`}>
                <div className="ref">#{us.ref}</div>
                <Link to={`/project/${project.slug}/us/${us.ref}`} className="subject-line">
                  {us.subject}
                </Link>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
