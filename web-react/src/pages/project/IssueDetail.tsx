import { useParams } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useIssueByRef } from '@/services/issues';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Tags } from '@/components/common/Tags';

export function IssueDetailPage() {
  const project = useCurrentProject();
  const { issueref } = useParams();
  const ref = Number(issueref);
  const { data: issue, isLoading, error } = useIssueByRef(project.id, ref);

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!issue) return <ErrorBox message="Issue not found" />;

  return (
    <article className="card p-6 space-y-4">
      <header>
        <p className="text-xs text-taiga-grey-light font-mono">ISSUE #{issue.ref}</p>
        <h1 className="text-2xl font-semibold">{issue.subject}</h1>
        <div className="mt-2 flex gap-2 flex-wrap">
          {issue.status_extra_info?.name && (
            <span className="badge">{issue.status_extra_info.name}</span>
          )}
          {issue.assigned_to_extra_info?.full_name_display && (
            <span className="badge">
              Assigned: {issue.assigned_to_extra_info.full_name_display}
            </span>
          )}
          <Tags tags={issue.tags} />
        </div>
      </header>
      {issue.description_html ? (
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: issue.description_html }}
        />
      ) : issue.description ? (
        <p className="whitespace-pre-wrap text-sm">{issue.description}</p>
      ) : (
        <p className="text-sm text-taiga-grey-light italic">No description.</p>
      )}
    </article>
  );
}
