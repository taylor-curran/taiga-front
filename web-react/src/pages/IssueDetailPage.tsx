import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useOutletContext, useParams } from 'react-router-dom';
import { issues as issuesApi, resolver } from '../api/resources';
import type { Project, Status } from '../types';
import Loader from '../components/common/Loader';
import DetailHeader from '../components/detail/DetailHeader';
import HistoryPanel from '../components/detail/HistoryPanel';
import AttachmentsPanel from '../components/detail/AttachmentsPanel';
import { useState } from 'react';

export default function IssueDetailPage() {
  const { project } = useOutletContext<{ project: Project }>();
  const { issueref } = useParams<{ issueref: string }>();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');

  const { data: resolverData } = useQuery({
    queryKey: ['resolver', project.slug, 'issue', issueref],
    queryFn: async () => {
      const res = await resolver.resolve({ project: project.slug, issue: Number(issueref) });
      return res.data;
    },
    enabled: !!issueref,
  });

  const issueId = resolverData?.issue;

  const { data: issue, isLoading } = useQuery({
    queryKey: ['issue', issueId],
    queryFn: async () => {
      const res = await issuesApi.getById(issueId);
      return res.data;
    },
    enabled: !!issueId,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Record<string, unknown>) => {
      if (!issue) return;
      return issuesApi.update(issue.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', issueId] });
      setEditing(false);
    },
  });

  if (isLoading || !issue) return <Loader />;

  const statusInfo = project.issue_statuses.find((s: Status) => s.id === issue.status);
  const typeInfo = project.issue_types.find((t: Status) => t.id === issue.type);
  const priorityInfo = project.priorities.find((p: Status) => p.id === issue.priority);
  const severityInfo = project.severities.find((s: Status) => s.id === issue.severity);

  const startEdit = () => {
    setSubject(issue.subject);
    setDescription(issue.description);
    setEditing(true);
  };

  return (
    <div className="detail-page issue-detail">
      <DetailHeader
        refNum={issue.ref}
        subject={issue.subject}
        statusInfo={statusInfo}
        assigned={issue.assigned_to_extra_info?.full_name_display}
        isClosed={issue.is_closed}
        isBlocked={issue.is_blocked}
        type="Issue"
      />

      <div className="detail-body">
        <div className="detail-main">
          {editing ? (
            <div className="edit-form">
              <input className="edit-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <textarea className="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} rows={8} />
              <div className="edit-actions">
                <button className="btn btn-primary" onClick={() => updateMutation.mutate({ subject, description, version: issue.version })}>Save</button>
                <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </div>
          ) : (
            <div className="detail-description">
              {issue.description_html ? (
                <div dangerouslySetInnerHTML={{ __html: issue.description_html }} />
              ) : (
                <p className="empty-description">No description provided</p>
              )}
              <button className="btn btn-link" onClick={startEdit}>Edit</button>
            </div>
          )}

          {issue.tags?.length > 0 && (
            <div className="detail-tags">
              {issue.tags.map(([tag, color]) => (
                <span key={tag} className="tag-badge" style={{ backgroundColor: color || '#E8A4C8' }}>{tag}</span>
              ))}
            </div>
          )}

          <AttachmentsPanel
            type="issues"
            objectId={issue.id}
            projectId={project.id}
            fetchFn={issuesApi.attachments}
            createFn={issuesApi.createAttachment}
            deleteFn={issuesApi.deleteAttachment}
          />

          <HistoryPanel type="issue" objectId={issue.id} projectId={project.id} />
        </div>

        <div className="detail-sidebar">
          <div className="sidebar-section">
            <h4>Status</h4>
            <select value={issue.status} onChange={(e) => updateMutation.mutate({ status: Number(e.target.value), version: issue.version })}>
              {project.issue_statuses.map((s: Status) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="sidebar-section">
            <h4>Type</h4>
            <select value={issue.type} onChange={(e) => updateMutation.mutate({ type: Number(e.target.value), version: issue.version })}>
              {project.issue_types.map((t: Status) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            {typeInfo && <span style={{ color: typeInfo.color }}>{typeInfo.name}</span>}
          </div>
          <div className="sidebar-section">
            <h4>Priority</h4>
            <select value={issue.priority} onChange={(e) => updateMutation.mutate({ priority: Number(e.target.value), version: issue.version })}>
              {project.priorities.map((p: Status) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {priorityInfo && <span style={{ color: priorityInfo.color }}>{priorityInfo.name}</span>}
          </div>
          <div className="sidebar-section">
            <h4>Severity</h4>
            <select value={issue.severity} onChange={(e) => updateMutation.mutate({ severity: Number(e.target.value), version: issue.version })}>
              {project.severities.map((s: Status) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {severityInfo && <span style={{ color: severityInfo.color }}>{severityInfo.name}</span>}
          </div>
          <div className="sidebar-section">
            <h4>Dates</h4>
            <div>Created: {new Date(issue.created_date).toLocaleDateString()}</div>
            <div>Modified: {new Date(issue.modified_date).toLocaleDateString()}</div>
            {issue.due_date && <div>Due: {issue.due_date}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
