import { Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useMilestones } from '@/services/projects';
import { useUserStories } from '@/services/userstories';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { Tags } from '@/components/common/Tags';
import { Avatar } from '@/components/common/Avatar';

export function BacklogPage() {
  const project = useCurrentProject();
  const milestonesQuery = useMilestones(project.id);
  const storiesQuery = useUserStories({ project: project.id, milestone: 'null' });

  if (storiesQuery.isLoading || milestonesQuery.isLoading) return <Loading />;
  if (storiesQuery.error) return <ErrorBox error={storiesQuery.error} />;

  const stories = storiesQuery.data ?? [];
  const milestones = milestonesQuery.data ?? [];
  const totalPoints = stories.reduce((acc, s) => acc + (s.total_points ?? 0), 0);

  return (
    <div className="space-y-6">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Backlog</h1>
        <span className="text-sm text-taiga-grey-light">
          {stories.length} stories · {totalPoints} points
        </span>
      </header>

      <section className="card divide-y divide-taiga-grey-lighter/40">
        <header className="px-4 py-2 font-semibold flex justify-between items-center">
          <span>Unassigned ({stories.length})</span>
          <span className="text-xs text-taiga-grey-light">{totalPoints} pts</span>
        </header>
        {stories.length === 0 ? (
          <Empty title="No backlog items" message="No user stories outside of any sprint." />
        ) : (
          <ul>
            {stories.map((s) => (
              <li
                key={s.id}
                className="px-4 py-3 flex items-center gap-3 hover:bg-taiga-bg/60"
              >
                <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0">
                  #{s.ref}
                </span>
                <Link
                  to={`/project/${project.slug}/us/${s.ref}`}
                  className="flex-1 truncate font-medium text-taiga-text"
                >
                  {s.subject}
                </Link>
                <Tags tags={s.tags} />
                {s.status_extra_info?.name && (
                  <span
                    className="badge"
                    style={
                      s.status_extra_info.color
                        ? { backgroundColor: s.status_extra_info.color, color: '#fff' }
                        : undefined
                    }
                  >
                    {s.status_extra_info.name}
                  </span>
                )}
                {s.assigned_to_extra_info?.full_name_display && (
                  <Avatar
                    name={s.assigned_to_extra_info.full_name_display}
                    src={s.assigned_to_extra_info.photo}
                    size={24}
                  />
                )}
                <span className="text-xs text-taiga-grey-light w-12 text-right">
                  {s.total_points ?? '—'} pts
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-2">Sprints</h2>
        {milestones.length === 0 ? (
          <Empty title="No sprints" />
        ) : (
          <ul className="space-y-2">
            {milestones.map((m) => (
              <li key={m.id} className="card p-4 flex justify-between">
                <div>
                  <Link
                    to={`/project/${project.slug}/taskboard/${m.slug ?? m.id}`}
                    className="font-semibold"
                  >
                    {m.name}
                  </Link>
                  {m.estimated_start && m.estimated_finish && (
                    <p className="text-xs text-taiga-grey-light">
                      {m.estimated_start} → {m.estimated_finish}
                    </p>
                  )}
                </div>
                <div className="text-sm text-right text-taiga-grey-light">
                  {m.closed ? <span className="badge">Closed</span> : null}
                  <div>
                    {m.closed_points ?? 0} / {m.total_points ?? 0} pts
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
