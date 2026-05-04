import { useParams, Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useUserStoryByRef } from '@/services/userstories';
import { useTasks } from '@/services/tasks';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Tags } from '@/components/common/Tags';
import { sanitizeHtml } from '@/lib/sanitize';

export function USDetailPage() {
  const project = useCurrentProject();
  const { usref } = useParams();
  const ref = Number(usref);
  const { data: us, isLoading, error } = useUserStoryByRef(project.id, ref);
  const tasksQuery = useTasks(
    us ? { project: project.id, user_story: us.id } : undefined,
  );

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!us) return <ErrorBox message="User story not found" />;

  return (
    <article className="card p-6 space-y-6">
      <header>
        <p className="text-xs text-taiga-grey-light font-mono">US #{us.ref}</p>
        <h1 className="text-2xl font-semibold">{us.subject}</h1>
        <div className="mt-2 flex gap-2 flex-wrap text-sm">
          {us.status_extra_info?.name && (
            <span className="badge">{us.status_extra_info.name}</span>
          )}
          <span className="badge">{us.total_points ?? '—'} pts</span>
          {us.is_blocked && <span className="badge bg-taiga-red text-white">Blocked</span>}
          <Tags tags={us.tags} />
        </div>
      </header>

      {us.description_html ? (
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(us.description_html) }}
        />
      ) : us.description ? (
        <p className="whitespace-pre-wrap text-sm">{us.description}</p>
      ) : (
        <p className="text-sm text-taiga-grey-light italic">No description.</p>
      )}

      <section>
        <h2 className="font-semibold mb-2">Tasks</h2>
        {tasksQuery.isLoading && <Loading />}
        {tasksQuery.data && tasksQuery.data.length === 0 && (
          <p className="text-sm text-taiga-grey-light">No tasks for this story.</p>
        )}
        {tasksQuery.data && tasksQuery.data.length > 0 && (
          <ul className="divide-y divide-taiga-grey-lighter/40 border border-taiga-grey-lighter/40 rounded">
            {tasksQuery.data.map((t) => (
              <li
                key={t.id}
                className="px-3 py-2 flex items-center gap-3 hover:bg-taiga-bg/60"
              >
                <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0">
                  #{t.ref}
                </span>
                <Link
                  to={`/project/${project.slug}/task/${t.ref}`}
                  className="flex-1 truncate text-taiga-text"
                >
                  {t.subject}
                </Link>
                {t.status_extra_info?.name && (
                  <span className="badge">{t.status_extra_info.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
