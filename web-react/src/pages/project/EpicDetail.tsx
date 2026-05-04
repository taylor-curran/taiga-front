import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useEpicByRef } from '@/services/epics';
import { fetchEpicUserStories } from '@/services/epics';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { sanitizeHtml } from '@/lib/sanitize';

export function EpicDetailPage() {
  const project = useCurrentProject();
  const { epicref } = useParams();
  const ref = Number(epicref);
  const { data: epic, isLoading, error } = useEpicByRef(project.id, ref);

  const usQuery = useQuery({
    queryKey: ['epic', 'userstories', epic?.id],
    queryFn: () => fetchEpicUserStories(epic!.id),
    enabled: !!epic,
  });

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!epic) return <ErrorBox message="Epic not found" />;

  return (
    <article className="card p-6 space-y-4">
      <header>
        <p className="text-xs text-taiga-grey-light font-mono">EPIC #{epic.ref}</p>
        <h1 className="text-2xl font-semibold">{epic.subject}</h1>
        {epic.status_extra_info?.name && (
          <span className="badge mt-2 inline-block">{epic.status_extra_info.name}</span>
        )}
      </header>
      {epic.description_html ? (
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(epic.description_html) }}
        />
      ) : epic.description ? (
        <p className="whitespace-pre-wrap text-sm">{epic.description}</p>
      ) : null}

      <section>
        <h2 className="font-semibold mb-2">Related user stories</h2>
        {usQuery.isLoading && <Loading />}
        {usQuery.data && usQuery.data.length === 0 && <Empty />}
        {usQuery.data && usQuery.data.length > 0 && (
          <ul className="divide-y divide-taiga-grey-lighter/40 border border-taiga-grey-lighter/40 rounded">
            {usQuery.data.map((s) => (
              <li
                key={s.id}
                className="px-3 py-2 flex items-center gap-3 hover:bg-taiga-bg/60"
              >
                <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0">
                  #{s.ref}
                </span>
                <Link
                  to={`/project/${project.slug}/us/${s.ref}`}
                  className="flex-1 truncate text-taiga-text"
                >
                  {s.subject}
                </Link>
                {s.status_extra_info?.name && (
                  <span className="badge">{s.status_extra_info.name}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
