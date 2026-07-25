import { Link } from 'react-router-dom';
import { useAuth } from '../api/auth';
import { useMyProjects, useUserTimeline } from '../api/resources';
import { Loader } from '../components/Loader';
import { Avatar } from '../components/Avatar';
import { TimelineFeed } from '../components/TimelineFeed';

export default function Home() {
  const { user } = useAuth();
  const { data: projects, isLoading } = useMyProjects();
  const { data: timeline } = useUserTimeline(user?.id);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl p-12 text-center">
        <h1 className="text-3xl font-bold text-slate-800">Welcome to Taiga</h1>
        <p className="mt-3 text-slate-500">Sign in to see your projects and dashboard.</p>
        <Link to="/login" className="btn-primary mt-6 inline-flex">Sign in</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto grid max-w-6xl gap-6 p-6 lg:grid-cols-3" data-testid="home">
      <section className="lg:col-span-2">
        <div className="card p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Working on</h2>
          {isLoading ? (
            <Loader />
          ) : projects && projects.length ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {projects.slice(0, 8).map((p) => (
                <Link
                  key={p.id}
                  to={`/project/${p.slug}/`}
                  className="rounded border border-slate-200 p-3 hover:border-taiga-400 hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    {p.logo_small_url ? (
                      <img src={p.logo_small_url} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-taiga-200 text-taiga-800 font-semibold">
                        {p.name.slice(0, 1)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800">{p.name}</div>
                      <div className="truncate text-xs text-slate-500">{p.is_private ? 'Private' : 'Public'}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">You&rsquo;re not a member of any projects yet.</p>
          )}
          <div className="mt-4">
            <Link to="/projects/" className="text-sm text-taiga-700 hover:underline">See all projects →</Link>
          </div>
        </div>
        <div className="mt-6 card p-5">
          <h2 className="mb-4 text-lg font-semibold text-slate-800">Activity</h2>
          {timeline && timeline.length ? (
            <TimelineFeed entries={timeline} />
          ) : (
            <p className="text-sm text-slate-500">Nothing to show yet.</p>
          )}
        </div>
      </section>
      <aside className="card p-5">
        <div className="flex flex-col items-center text-center">
          <Avatar user={user} size={72} />
          <h3 className="mt-3 text-base font-semibold text-slate-800">{user.full_name_display || user.username}</h3>
          <p className="text-sm text-slate-500">@{user.username}</p>
          <Link to={`/profile/${user.username}`} className="btn-secondary mt-4 w-full">View profile</Link>
          <Link to="/project/new" className="btn-primary mt-2 w-full">Create new project</Link>
        </div>
      </aside>
    </div>
  );
}
