import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { tasks as tasksApi, resolver } from '../api/resources';
import type { Project, Status } from '../types';
import Loader from '../components/common/Loader';
import DetailHeader from '../components/detail/DetailHeader';
import HistoryPanel from '../components/detail/HistoryPanel';
import AttachmentsPanel from '../components/detail/AttachmentsPanel';
import { useState } from 'react';

export default function TaskDetailPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { taskref } = useParams<{ taskref: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { data: resolverData } = useQuery({
    queryKey: ['resolver', project.slug, 'task', taskref],
    queryFn: async () => {
      const res = await resolver.resolve({ project: project.slug, task: Number(taskref) });
      return res.data;
    },
    enabled: !!taskref,
  });

  const taskId = resolverData?.task;

  const { data: task, isLoading } = useQuery({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const res = await tasksApi.getById(taskId);
      return res.data;
    },
    enabled: !!taskId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (!task) return;
      return tasksApi.update(task.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['task', taskId] });
      setEditing(false);
    },
  });

  if (isLoading || !task) return <Loader />;

  const statusInfo = project.task_statuses.find((s: Status) => s.id === task.status);

  const startEdit = () => {
    setSubject(task.subject);
    setDescription(task.description);
    setEditing(true);
  };

  return (
    <div className="detail-page task-detail">
      <DetailHeader
        refNum={task.ref}
        subject={task.subject}
        statusInfo={statusInfo}
        assigned={task.assigned_to_extra_info?.full_name_display}
        isClosed={task.is_closed}
        isBlocked={task.is_blocked}
        type="Task"
      />

      <div className="detail-body">
        <div className="detail-main">
          {task.user_story_extra_info && (
            <div className="parent-link">
              User Story:{' '}
              <Link to={`/project/${project.slug}/us/${task.user_story_extra_info.ref}`}>
                #{task.user_story_extra_info.ref} {task.user_story_extra_info.subject}
              </Link>
            </div>
          )}

          {editing ? (
            <div className="edit-form">
              <input className="edit-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <textarea className="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={8} />
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={() => updateMutation.mutate({ subject, description })}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="detail-description">
              {task.description_html ? (
                <div dangerouslySetInnerHTML={{ __html: task.description_html }} />
              ) : (
                <p className="empty-description">No description provided</p>
              )}
              <button className="btn btn-link" onClick={startEdit}>Edit</button>
            </div>
          )}

          {task.tags?.length > 0 && (
            <div className="detail-tags">
              {task.tags.map(([tag, color]) => (
                <span key={tag} className="tag-badge" style={{ backgroundColor: color || '#a9aabc' }}>{tag}</span>
              ))}
            </div>
          )}

          <AttachmentsPanel
            type="tasks"
            objectId={task.id}
            projectId={project.id}
            fetchFn={tasksApi.attachments}
            createFn={tasksApi.createAttachment}
            deleteFn={tasksApi.deleteAttachment}
          />

          <HistoryPanel type="task" objectId={task.id} projectId={project.id} />
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-section">
            <h4>Status</h4>
            <select value={task.status} onChange={(e) => updateMutation.mutate({ status: Number(e.target.value) })}>
              {project.task_statuses.map((s: Status) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          {task.is_iocaine && (
            <div className="sidebar-section">
              <span className="badge badge-iocaine">Iocaine</span>
            </div>
          )}
          <div className="sidebar-section">
            <h4>Dates</h4>
            <div>Created: {new Date(task.created_date).toLocaleDateString()}</div>
            <div>Modified: {new Date(task.modified_date).toLocaleDateString()}</div>
            {task.due_date && <div>Due: {task.due_date}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
