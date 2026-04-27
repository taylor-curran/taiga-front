import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { userstories, resolver, tasks as tasksApi } from '../api/resources';
import type { Project, UserStory, Task, Status } from '../types';
import Loader from '../components/common/Loader';
import DetailHeader from '../components/detail/DetailHeader';
import HistoryPanel from '../components/detail/HistoryPanel';
import AttachmentsPanel from '../components/detail/AttachmentsPanel';
import { useState } from 'react';

export default function UserStoryDetailPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { usref } = useParams<{ usref: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { data: resolverData } = useQuery({
    queryKey: ['resolver', project.slug, 'us', usref],
    queryFn: async () => {
      const res = await resolver.resolve({ project: project.slug, us: Number(usref) });
      return res.data;
    },
    enabled: !!usref,
  });

  const usId = resolverData?.us;

  const { data: story, isLoading } = useQuery({
    queryKey: ['userstory', usId],
    queryFn: async () => {
      const res = await userstories.getById(usId);
      return res.data;
    },
    enabled: !!usId,
  });

  const { data: relatedTasks } = useQuery({
    queryKey: ['us-tasks', project.id, usId],
    queryFn: async () => {
      const res = await tasksApi.list({ project: project.id, user_story: usId });
      return res.data;
    },
    enabled: !!usId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<UserStory>) => {
      if (!story) return;
      return userstories.update(story.id, data, story.version);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userstory', usId] });
      setEditing(false);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (statusId: number) => {
      if (!story) return;
      return userstories.update(story.id, { status: statusId, version: story.version });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userstory', usId] });
    },
  });

  if (isLoading || !story) return <Loader />;

  const statusInfo = project.us_statuses.find((s: Status) => s.id === story.status);

  const startEdit = () => {
    setSubject(story.subject);
    setDescription(story.description);
    setEditing(true);
  };

  return (
    <div className="detail-page us-detail">
      <DetailHeader
        refNum={story.ref}
        subject={story.subject}
        statusInfo={statusInfo}
        assigned={story.assigned_to_extra_info?.full_name_display}
        isClosed={story.is_closed}
        isBlocked={story.is_blocked}
        type="User Story"
      />

      <div className="detail-body">
        <div className="detail-main">
          {editing ? (
            <div className="edit-form">
              <input
                className="edit-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <textarea
                className="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
              />
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={() => updateMutation.mutate({ subject, description, version: story.version })}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="detail-description">
                {story.description_html ? (
                  <div dangerouslySetInnerHTML={{ __html: story.description_html }} />
                ) : (
                  <p className="empty-description">No description provided</p>
                )}
                <button className="btn btn-link" onClick={startEdit}>Edit</button>
              </div>
            </>
          )}

          {story.tags?.length > 0 && (
            <div className="detail-tags">
              {story.tags.map(([tag, color]) => (
                <span key={tag} className="tag-badge" style={{ backgroundColor: color || '#a9aabc' }}>{tag}</span>
              ))}
            </div>
          )}

          {/* Related tasks */}
          <div className="related-tasks">
            <h3>Tasks ({relatedTasks?.length || 0})</h3>
            {relatedTasks?.map((task: Task) => {
              const taskStatus = project.task_statuses.find((s: Status) => s.id === task.status);
              return (
                <div key={task.id} className="related-task-item">
                  <Link to={`/project/${project.slug}/task/${task.ref}`}>
                    #{task.ref} {task.subject}
                  </Link>
                  <span className="status-badge" style={{ borderColor: taskStatus?.color }}>
                    {taskStatus?.name}
                  </span>
                </div>
              );
            })}
          </div>

          <AttachmentsPanel
            type="userstories"
            objectId={story.id}
            projectId={project.id}
            fetchFn={userstories.attachments}
            createFn={userstories.createAttachment}
            deleteFn={userstories.deleteAttachment}
          />

          <HistoryPanel type="userstory" objectId={story.id} projectId={project.id} />
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-section">
            <h4>Status</h4>
            <select
              value={story.status}
              onChange={(e) => updateStatusMutation.mutate(Number(e.target.value))}
            >
              {project.us_statuses.map((s: Status) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-section">
            <h4>Points</h4>
            <div className="points-summary">
              Total: {story.total_points ?? '-'}
            </div>
          </div>
          {story.epics && story.epics.length > 0 && (
            <div className="sidebar-section">
              <h4>Epics</h4>
              {story.epics.map((epic) => (
                <Link key={epic.id} to={`/project/${epic.project.slug}/epic/${epic.ref}`} className="epic-link">
                  <span className="epic-color" style={{ backgroundColor: epic.color }} />
                  #{epic.ref} {epic.subject}
                </Link>
              ))}
            </div>
          )}
          <div className="sidebar-section">
            <h4>Dates</h4>
            <div>Created: {new Date(story.created_date).toLocaleDateString()}</div>
            <div>Modified: {new Date(story.modified_date).toLocaleDateString()}</div>
            {story.due_date && <div>Due: {story.due_date}</div>}
          </div>
          <div className="sidebar-section">
            <h4>Watchers ({story.total_watchers})</h4>
          </div>
          <div className="sidebar-section">
            <h4>Voters ({story.total_voters})</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
