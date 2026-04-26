import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useAuth } from '@/auth/store';
import { useMyProjects } from '@/auth/queries';
import { Avatar } from '@/components/Avatar';
import type { CurrentUser, ProjectListItem } from '@/api/types';

function useProfile(slug?: string) {
  return useQuery({
    queryKey: ['profile', slug],
    enabled: Boolean(slug),
    queryFn: () =>
      api.get<CurrentUser>('users/by_username', { query: { username: slug! } }),
  });
}

export default function Profile() {
  const { slug } = useParams();
  const me = useAuth((s) => s.user);
  const username = slug ?? me?.username;
  const { data: profile, isPending } = useProfile(username);
  const { data: projects } = useMyProjects();

  const display = (slug ? profile : me) as CurrentUser | undefined;

  if (isPending && !display) {
    return <main className="page"><p className="muted">Loading…</p></main>;
  }

  if (!display) {
    return <main className="page"><div className="empty" data-testid="profile-empty">Profile not found.</div></main>;
  }

  return (
    <main className="page" data-testid="profile-page">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
        <Avatar user={display} size={64} />
        <div>
          <h1 style={{ margin: 0 }}>{display.full_name_display || display.username}</h1>
          <p className="muted">@{display.username}</p>
          {display.bio && <p>{display.bio}</p>}
        </div>
      </div>

      <section>
        <h2>Projects</h2>
        {!projects || projects.length === 0 ? (
          <div className="empty">No projects.</div>
        ) : (
          <ul className="list card">
            {(projects as ProjectListItem[]).map((p) => (
              <li key={p.id}>
                <a href={`/project/${p.slug}/timeline`} className="grow">{p.name}</a>
                <span className="muted">{p.is_private ? 'Private' : 'Public'}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
