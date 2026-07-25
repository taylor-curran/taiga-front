import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useProjectBySlug, useSearch } from '../../api/resources';
import { Loader } from '../../components/Loader';
import { useEffect, useState } from 'react';

export default function ProjectSearch() {
  const { pslug } = useParams();
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') ?? '';
  const [q, setQ] = useState(initial);
  const { data: project } = useProjectBySlug(pslug);
  const { data: results, isLoading, isFetching } = useSearch(project?.id, q);

  useEffect(() => {
    if (q !== initial) setParams(q ? { q } : {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div data-testid="project-search">
      <h1 className="text-xl font-semibold text-slate-800">Search in {project?.name}</h1>
      <input
        className="input mt-3 max-w-md"
        placeholder="Search…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      {isFetching && <p className="mt-2 text-xs text-slate-400">Searching…</p>}
      {isLoading && q ? (
        <Loader />
      ) : (
        results && (
          <div className="mt-6 space-y-6">
            <Section title="Epics" items={results.epics} pslug={pslug!} kind="epic" />
            <Section title="User stories" items={results.userstories} pslug={pslug!} kind="us" />
            <Section title="Tasks" items={results.tasks} pslug={pslug!} kind="task" />
            <Section title="Issues" items={results.issues} pslug={pslug!} kind="issue" />
            <Section
              title="Wiki pages"
              items={results.wikipages?.map((w) => ({ ref: 0, subject: w.slug, slug: w.slug })) as { ref: number; subject: string; slug?: string }[]}
              pslug={pslug!}
              kind="wiki"
            />
          </div>
        )
      )}
    </div>
  );
}

function Section({
  title,
  items,
  pslug,
  kind,
}: {
  title: string;
  items: Array<{ ref: number; subject: string; slug?: string }> | undefined;
  pslug: string;
  kind: 'us' | 'task' | 'issue' | 'epic' | 'wiki';
}) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h2 className="text-sm font-semibold uppercase text-slate-500">{title} ({items.length})</h2>
      <ul className="mt-2 divide-y divide-slate-100 card">
        {items.map((i, idx) => (
          <li key={`${kind}-${(i.ref ?? i.slug ?? idx).toString()}-${idx}`} className="p-3">
            <Link
              to={
                kind === 'wiki'
                  ? `/project/${pslug}/wiki/${i.slug}`
                  : kind === 'us'
                  ? `/project/${pslug}/us/${i.ref}`
                  : kind === 'task'
                  ? `/project/${pslug}/task/${i.ref}`
                  : kind === 'issue'
                  ? `/project/${pslug}/issue/${i.ref}`
                  : `/project/${pslug}/epic/${i.ref}`
              }
              className="text-sm text-slate-800 hover:text-taiga-700"
            >
              {kind !== 'wiki' && <span className="text-slate-400">#{i.ref}</span>} {i.subject}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
