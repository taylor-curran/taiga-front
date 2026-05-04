import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useProjectTimeline } from '@/services/timeline';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { formatDistanceToNow } from 'date-fns';

export function TimelinePage() {
  const project = useCurrentProject();
  const { data, isLoading, error } = useProjectTimeline(project.id);

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!data || data.length === 0) return <Empty title="No activity yet" />;

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Timeline</h1>
      <ol className="card divide-y divide-taiga-grey-lighter/40">
        {data.map((entry) => (
          <li key={entry.id} className="px-4 py-3">
            <div className="text-xs text-taiga-grey-light">
              {entry.created
                ? `${formatDistanceToNow(new Date(entry.created))} ago`
                : ''}{' '}
              · {entry.event_type}
            </div>
            <pre className="text-xs whitespace-pre-wrap text-taiga-text mt-1">
              {summarize(entry.data)}
            </pre>
          </li>
        ))}
      </ol>
    </div>
  );
}

function summarize(data: Record<string, unknown>): string {
  // Render a compact JSON-ish line; the legacy templates render this in
  // very domain-specific ways, but for the read-only port we surface the
  // payload verbatim.
  try {
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}
