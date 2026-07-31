import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useIssues } from '@/services/issues';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Empty } from '@/components/common/Empty';
import { Avatar } from '@/components/common/Avatar';

export function IssuesPage() {
  const project = useCurrentProject();
  const [q, setQ] = useState('');
  const { data, isLoading, error } = useIssues({ project: project.id, q: q || undefined });
  return (
    <div className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Issues</h1>
        <input
          className="input max-w-xs"
          placeholder="Filter…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </header>
      {isLoading && <Loading />}
      {error && <ErrorBox error={error} />}
      {data && data.length === 0 && <Empty title="No issues" />}
      {data && data.length > 0 && (
        <ul className="card divide-y divide-taiga-grey-lighter/40">
          {data.map((issue) => (
            <li
              key={issue.id}
              className="px-4 py-3 flex items-center gap-3 hover:bg-taiga-bg/60"
            >
              <span className="text-xs text-taiga-grey-light w-12 font-mono shrink-0">
                #{issue.ref}
              </span>
              <Link
                to={`/project/${project.slug}/issue/${issue.ref}`}
                className="flex-1 truncate font-medium text-taiga-text"
              >
                {issue.subject}
              </Link>
              {issue.status_extra_info?.name && (
                <span
                  className="badge"
                  style={
                    issue.status_extra_info.color
                      ? { backgroundColor: issue.status_extra_info.color, color: '#fff' }
                      : undefined
                  }
                >
                  {issue.status_extra_info.name}
                </span>
              )}
              {issue.assigned_to_extra_info?.full_name_display && (
                <Avatar
                  name={issue.assigned_to_extra_info.full_name_display}
                  size={24}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
