import { Link, useOutletContext, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useTasks, useUserStories } from '@/projects/queries';
import type { Milestone, ProjectDetail } from '@/api/types';

function useMilestoneBySlug(projectId?: number, slug?: string) {
  return useQuery({
    queryKey: ['milestone', projectId, slug],
    enabled: Boolean(projectId && slug),
    queryFn: async () => {
      const list = await api.get<Milestone[]>('milestones', {
        query: { project: projectId!, slug: slug! },
        headers: { 'x-disable-pagination': '1' },
      });
      return list[0];
    },
  });
}

export default function Taskboard() {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const { sslug } = useParams();
  const { data: sprint } = useMilestoneBySlug(project.id, sslug);
  const { data: stories } = useUserStories(project.id, { milestone: sprint?.id });
  const { data: tasks } = useTasks(project.id, { milestone: sprint?.id });

  if (!sprint) {
    return (
      <div data-testid="taskboard">
        <h1>{sslug}</h1>
        <p className="muted">Loading sprint…</p>
      </div>
    );
  }

  return (
    <div data-testid="taskboard">
      <h1>{sprint.name}</h1>
      <p className="muted">
        {sprint.estimated_start} → {sprint.estimated_finish}
      </p>

      <h2 style={{ marginTop: '1rem' }}>User stories in sprint</h2>
      {stories && stories.length === 0 && <div className="empty">No stories in this sprint.</div>}
      {stories && stories.length > 0 && (
        <ul className="list card" data-testid="taskboard-stories">
          {stories.map((us) => (
            <li key={us.id}>
              <span className="ref">#{us.ref}</span>
              <Link to={`/project/${project.slug}/us/${us.ref}`} className="grow subject-link">
                {us.subject}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <h2 style={{ marginTop: '1rem' }}>Tasks</h2>
      {tasks && tasks.length === 0 && <div className="empty">No tasks.</div>}
      {tasks && tasks.length > 0 && (
        <table className="tg-table" data-testid="taskboard-tasks">
          <thead>
            <tr>
              <th>Ref</th>
              <th>Subject</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((t) => (
              <tr key={t.id}>
                <td className="muted">#{t.ref}</td>
                <td>
                  <Link to={`/project/${project.slug}/task/${t.ref}`}>{t.subject}</Link>
                </td>
                <td>{t.status_extra_info?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
