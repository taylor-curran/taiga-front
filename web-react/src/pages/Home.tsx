import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuth } from '@/auth/store';
import { useMyProjects } from '@/auth/queries';
import type { UserStory, Task, Issue, Epic } from '@/api/types';

interface WorkItem {
  type: 'us' | 'task' | 'issue' | 'epic';
  ref: number;
  subject: string;
  project_extra_info: { name: string; slug: string };
  status_extra_info?: { name: string; color: string };
}

function useAssigned(userId?: number) {
  return useQuery({
    queryKey: ['home', 'assigned', userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<WorkItem[]> => {
      const [uss, tasks, issues, epics] = await Promise.all([
        api.get<UserStory[]>('userstories', {
          query: { is_closed: false, assigned_users: userId, dashboard: true },
          headers: { 'x-disable-pagination': '1' },
        }),
        api.get<Task[]>('tasks', {
          query: { status__is_closed: false, assigned_to: userId },
          headers: { 'x-disable-pagination': '1' },
        }),
        api.get<Issue[]>('issues', {
          query: { status__is_closed: false, assigned_to: userId },
          headers: { 'x-disable-pagination': '1' },
        }),
        api.get<Epic[]>('epics', {
          query: { status__is_closed: false, assigned_to: userId },
          headers: { 'x-disable-pagination': '1' },
        }),
      ]);
      return [
        ...uss.map((x) => ({ type: 'us' as const, ref: x.ref, subject: x.subject, project_extra_info: x.project_extra_info, status_extra_info: x.status_extra_info })),
        ...tasks.map((x) => ({ type: 'task' as const, ref: x.ref, subject: x.subject, project_extra_info: (x as unknown as { project_extra_info: { name: string; slug: string } }).project_extra_info, status_extra_info: x.status_extra_info })),
        ...issues.map((x) => ({ type: 'issue' as const, ref: x.ref, subject: x.subject, project_extra_info: (x as unknown as { project_extra_info: { name: string; slug: string } }).project_extra_info, status_extra_info: x.status_extra_info })),
        ...epics.map((x) => ({ type: 'epic' as const, ref: x.ref, subject: x.subject, project_extra_info: (x as unknown as { project_extra_info: { name: string; slug: string } }).project_extra_info, status_extra_info: x.status_extra_info })),
      ];
    },
  });
}

function pathFor(item: WorkItem): string {
  const slug = item.project_extra_info?.slug;
  if (!slug) return '#';
  switch (item.type) {
    case 'us':
      return `/project/${slug}/us/${item.ref}`;
    case 'task':
      return `/project/${slug}/task/${item.ref}`;
    case 'issue':
      return `/project/${slug}/issue/${item.ref}`;
    case 'epic':
      return `/project/${slug}/epic/${item.ref}`;
  }
}

export default function Home() {
  const user = useAuth((s) => s.user);
  const { data: assigned, isPending } = useAssigned(user?.id);
  const { data: projects } = useMyProjects();

  return (
    <main className="page" data-testid="home-page">
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)', gap: '1.5rem' }}>
        <section>
          <h1>Dashboard</h1>
          <h2 style={{ marginTop: '1rem' }}>Working on</h2>
          {isPending && <p className="muted">Loading…</p>}
          {assigned && assigned.length === 0 && (
            <div className="empty" data-testid="working-on-empty">
              You don't have any items assigned right now.
            </div>
          )}
          {assigned && assigned.length > 0 && (
            <ul className="list card" data-testid="working-on-list">
              {assigned.map((it) => (
                <li key={`${it.type}-${it.ref}-${it.project_extra_info?.slug}`}>
                  <span className="ref">#{it.ref}</span>
                  <Link to={pathFor(it)} className="grow subject-link">
                    {it.subject}
                  </Link>
                  <span className="muted">{it.project_extra_info?.name}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside>
          <h2>Your projects</h2>
          <ul className="list card" data-testid="home-projects">
            {(projects ?? []).slice(0, 8).map((p) => (
              <li key={p.id}>
                <Link to={`/project/${p.slug}/timeline`} className="grow subject-link">
                  {p.name}
                </Link>
              </li>
            ))}
            {projects && projects.length === 0 && <li className="muted">No projects.</li>}
          </ul>
        </aside>
      </div>
    </main>
  );
}
