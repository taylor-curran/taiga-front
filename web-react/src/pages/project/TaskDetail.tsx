import { useParams, Link } from 'react-router-dom';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useTaskByRef } from '@/services/tasks';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Tags } from '@/components/common/Tags';
import { sanitizeHtml } from '@/lib/sanitize';

export function TaskDetailPage() {
  const project = useCurrentProject();
  const { taskref } = useParams();
  const ref = Number(taskref);
  const { data: task, isLoading, error } = useTaskByRef(project.id, ref);

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!task) return <ErrorBox message="Task not found" />;

  return (
    <article className="card p-6 space-y-4">
      <header>
        <p className="text-xs text-taiga-grey-light font-mono">TASK #{task.ref}</p>
        <h1 className="text-2xl font-semibold">{task.subject}</h1>
        <div className="mt-2 flex gap-2 flex-wrap">
          {task.status_extra_info?.name && (
            <span className="badge">{task.status_extra_info.name}</span>
          )}
          {task.user_story_extra_info && (
            <span className="badge">
              <Link
                to={`/project/${project.slug}/us/${task.user_story_extra_info.ref}`}
              >
                US #{task.user_story_extra_info.ref}
              </Link>
            </span>
          )}
          {task.is_iocaine && <span className="badge bg-taiga-red text-white">Iocaine</span>}
          <Tags tags={task.tags} />
        </div>
      </header>
      {task.description_html ? (
        <div
          className="prose max-w-none text-sm"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(task.description_html) }}
        />
      ) : task.description ? (
        <p className="whitespace-pre-wrap text-sm">{task.description}</p>
      ) : (
        <p className="text-sm text-taiga-grey-light italic">No description.</p>
      )}
    </article>
  );
}
