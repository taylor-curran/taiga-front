import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useParams, Link } from 'react-router-dom';
import { epics as epicsApi, resolver } from '../api/resources';
import type { Project, Status } from '../types';
import Loader from '../components/common/Loader';
import DetailHeader from '../components/detail/DetailHeader';
import HistoryPanel from '../components/detail/HistoryPanel';
import AttachmentsPanel from '../components/detail/AttachmentsPanel';
import { useState } from 'react';

export default function EpicDetailPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { epicref } = useParams<{ epicref: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { data: resolverData } = useQuery({
    queryKey: ['resolver', project.slug, 'epic', epicref],
    queryFn: async () => {
      const res = await resolver.resolve({ project: project.slug, epic: Number(epicref) });
      return res.data;
    },
    enabled: !!epicref,
  });

  const epicId = resolverData?.epic;

  const { data: epic, isLoading } = useQuery({
    queryKey: ['epic', epicId],
    queryFn: async () => {
      const res = await epicsApi.getById(epicId);
      return res.data;
    },
    enabled: !!epicId,
  });

  const { data: relatedUs } = useQuery({
    queryKey: ['epic-related-us', epicId],
    queryFn: async () => {
      const res = await epicsApi.getRelatedUserstories(epicId);
      return res.data;
    },
    enabled: !!epicId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (!epic) return;
      return epicsApi.update(epic.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['epic', epicId] });
      setEditing(false);
    },
  });

  if (isLoading || !epic) return <Loader />;

  const statusInfo = project.epic_statuses.find((s: Status) => s.id === epic.status);

  const startEdit = () => {
    setSubject(epic.subject);
    setDescription(epic.description);
    setEditing(true);
  };

  return (
    <div className="detail-page epic-detail">
      <DetailHeader
        refNum={epic.ref}
        subject={epic.subject}
        statusInfo={statusInfo}
        assigned={epic.assigned_to_extra_info?.full_name_display}
        type="Epic"
      />

      <div className="detail-body">
        <div className="detail-main">
          {editing ? (
            <div className="edit-form">
              <input className="edit-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <textarea className="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={8} />
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={() => updateMutation.mutate({ subject, description, version: epic.version })}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="detail-description">
              {epic.description_html ? (
                <div dangerouslySetInnerHTML={{ __html: epic.description_html }} />
              ) : (
                <p className="empty-description">No description provided</p>
              )}
              <button className="btn btn-link" onClick={startEdit}>Edit</button>
            </div>
          )}

          <div className="related-userstories">
            <h3>User Stories</h3>
            {(relatedUs as Array<{ user_story: number; user_story_extra_info?: { ref: number; subject: string } }> || []).map((rel) => (
              <div key={rel.user_story} className="related-us-item">
                {rel.user_story_extra_info ? (
                  <Link to={`/project/${project.slug}/us/${rel.user_story_extra_info.ref}`}>
                    #{rel.user_story_extra_info.ref} {rel.user_story_extra_info.subject}
                  </Link>
                ) : (
                  <span>US #{rel.user_story}</span>
                )}
              </div>
            ))}
          </div>

          <AttachmentsPanel
            type="epics"
            objectId={epic.id}
            projectId={project.id}
            fetchFn={epicsApi.attachments}
            createFn={epicsApi.createAttachment}
            deleteFn={epicsApi.deleteAttachment}
          />

          <HistoryPanel type="epic" objectId={epic.id} projectId={project.id} version={epic.version} />
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-section">
            <h4>Status</h4>
            <select value={epic.status} onChange={(e) => updateMutation.mutate({ status: Number(e.target.value), version: epic.version })}>
              {project.epic_statuses.map((s: Status) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-section">
            <h4>Color</h4>
            <div className="epic-color-swatch" style={{ backgroundColor: epic.color }} />
          </div>
          <div className="sidebar-section">
            <h4>Progress</h4>
            <span>{epic.user_stories_counts.progress}/{epic.user_stories_counts.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
