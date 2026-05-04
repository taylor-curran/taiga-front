import { useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useIssueByRef,
  useIssueAttachments,
  useIssueHistory,
  useIssueCustomAttributes,
  useIssueCustomAttributeValues,
  usePatchIssue,
  useDeleteIssue,
  usePromoteIssueToUs,
  upvoteIssue,
  downvoteIssue,
  watchIssue,
  unwatchIssue,
  addIssueComment,
  uploadIssueAttachment,
  deleteIssueAttachment,
} from '@/services/issues';
import { Loading } from '@/components/common/Loading';
import { ErrorBox } from '@/components/common/ErrorBox';
import { Tags } from '@/components/common/Tags';
import { Avatar } from '@/components/common/Avatar';
import { sanitizeHtml } from '@/lib/sanitize';
import { format } from 'date-fns';

function ColorBadge({ name, color }: { name?: string; color?: string }) {
  if (!name) return null;
  return (
    <span
      className="inline-block px-2 py-0.5 rounded text-xs font-medium"
      style={
        color
          ? { backgroundColor: color, color: '#fff' }
          : { backgroundColor: '#e5e7eb', color: '#555' }
      }
    >
      {name}
    </span>
  );
}

function formatDate(d?: string | null) {
  if (!d) return '--';
  try {
    return format(new Date(d), 'MMM d, yyyy HH:mm');
  } catch {
    return d;
  }
}

export function IssueDetailPage() {
  const project = useCurrentProject();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { issueref } = useParams();
  const ref = Number(issueref);

  const { data: issue, isLoading, error } = useIssueByRef(project.id, ref);
  const { data: attachments } = useIssueAttachments(project.id, issue?.id);
  const { data: history } = useIssueHistory(issue?.id);
  const { data: customAttrs } = useIssueCustomAttributes(project.id);
  const { data: customValues } = useIssueCustomAttributeValues(issue?.id);

  const patchMutation = usePatchIssue();
  const deleteMutation = useDeleteIssue();
  const promoteMutation = usePromoteIssueToUs();

  const [comment, setComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [editingSubject, setEditingSubject] = useState(false);
  const [subjectDraft, setSubjectDraft] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [descriptionDraft, setDescriptionDraft] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPromoteConfirm, setShowPromoteConfirm] = useState(false);

  // Status change
  const handleStatusChange = useCallback(
    (statusId: number) => {
      if (!issue) return;
      patchMutation.mutate({ issueId: issue.id, data: { status: statusId, version: issue.version } });
    },
    [issue, patchMutation],
  );

  // Type change
  const handleTypeChange = useCallback(
    (typeId: number) => {
      if (!issue) return;
      patchMutation.mutate({ issueId: issue.id, data: { type: typeId, version: issue.version } });
    },
    [issue, patchMutation],
  );

  // Severity change
  const handleSeverityChange = useCallback(
    (severityId: number) => {
      if (!issue) return;
      patchMutation.mutate({ issueId: issue.id, data: { severity: severityId, version: issue.version } });
    },
    [issue, patchMutation],
  );

  // Priority change
  const handlePriorityChange = useCallback(
    (priorityId: number) => {
      if (!issue) return;
      patchMutation.mutate({ issueId: issue.id, data: { priority: priorityId, version: issue.version } });
    },
    [issue, patchMutation],
  );

  // Assignee change
  const handleAssigneeChange = useCallback(
    (userId: number | null) => {
      if (!issue) return;
      patchMutation.mutate({ issueId: issue.id, data: { assigned_to: userId, version: issue.version } });
    },
    [issue, patchMutation],
  );

  // Subject edit
  const handleSubjectSave = useCallback(() => {
    if (!issue || !subjectDraft.trim()) return;
    patchMutation.mutate(
      { issueId: issue.id, data: { subject: subjectDraft.trim(), version: issue.version } },
      { onSuccess: () => setEditingSubject(false) },
    );
  }, [issue, subjectDraft, patchMutation]);

  // Description edit
  const handleDescriptionSave = useCallback(() => {
    if (!issue) return;
    patchMutation.mutate(
      { issueId: issue.id, data: { description: descriptionDraft, version: issue.version } },
      { onSuccess: () => setEditingDescription(false) },
    );
  }, [issue, descriptionDraft, patchMutation]);

  // Comment
  const handleAddComment = useCallback(async () => {
    if (!issue || !comment.trim()) return;
    setIsSubmittingComment(true);
    try {
      await addIssueComment(issue.id, comment.trim(), issue.version ?? 1);
      setComment('');
      qc.invalidateQueries({ queryKey: ['issue'] });
      qc.invalidateQueries({ queryKey: ['issue', 'history'] });
    } finally {
      setIsSubmittingComment(false);
    }
  }, [issue, comment, qc]);

  // Vote
  const handleVote = useCallback(async () => {
    if (!issue) return;
    if (issue.is_voter) {
      await downvoteIssue(issue.id);
    } else {
      await upvoteIssue(issue.id);
    }
    qc.invalidateQueries({ queryKey: ['issue'] });
  }, [issue, qc]);

  // Watch
  const handleWatch = useCallback(async () => {
    if (!issue) return;
    if (issue.is_watcher) {
      await unwatchIssue(issue.id);
    } else {
      await watchIssue(issue.id);
    }
    qc.invalidateQueries({ queryKey: ['issue'] });
  }, [issue, qc]);

  // Delete
  const handleDelete = useCallback(() => {
    if (!issue) return;
    deleteMutation.mutate(issue.id, {
      onSuccess: () => navigate(`/project/${project.slug}/issues`),
    });
  }, [issue, deleteMutation, navigate, project.slug]);

  // Promote to user story
  const handlePromote = useCallback(() => {
    if (!issue) return;
    promoteMutation.mutate(
      { issueId: issue.id, projectId: project.id },
      {
        onSuccess: () => {
          setShowPromoteConfirm(false);
          qc.invalidateQueries({ queryKey: ['issue'] });
        },
      },
    );
  }, [issue, project.id, promoteMutation, qc]);

  // File upload
  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!issue || !e.target.files?.length) return;
      for (const file of Array.from(e.target.files)) {
        await uploadIssueAttachment(project.id, issue.id, file);
      }
      qc.invalidateQueries({ queryKey: ['issue', 'attachments'] });
      e.target.value = '';
    },
    [issue, project.id, qc],
  );

  const handleDeleteAttachment = useCallback(
    async (attachId: number) => {
      await deleteIssueAttachment(attachId);
      qc.invalidateQueries({ queryKey: ['issue', 'attachments'] });
    },
    [qc],
  );

  if (isLoading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  if (!issue) return <ErrorBox message="Issue not found" />;

  const statuses = project.issue_statuses ?? [];
  const types = project.issue_types ?? [];
  const severities = project.severities ?? [];
  const priorities = project.priorities ?? [];
  const members = project.members ?? [];

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between text-sm">
        <Link
          to={`/project/${project.slug}/issues`}
          className="text-taiga-link hover:underline"
        >
          &larr; Back to Issues
        </Link>
        <div className="flex items-center gap-2">
          {issue.neighbors?.previous && (
            <Link
              to={`/project/${project.slug}/issue/${issue.neighbors.previous.ref}`}
              className="btn btn-sm"
              title={`#${issue.neighbors.previous.ref}: ${issue.neighbors.previous.subject}`}
            >
              &larr; Prev
            </Link>
          )}
          {issue.neighbors?.next && (
            <Link
              to={`/project/${project.slug}/issue/${issue.neighbors.next.ref}`}
              className="btn btn-sm"
              title={`#${issue.neighbors.next.ref}: ${issue.neighbors.next.subject}`}
            >
              Next &rarr;
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Main content */}
        <div className="col-span-12 lg:col-span-8 space-y-4">
          {/* Header */}
          <article className="card p-6 space-y-4">
            <header>
              <p className="text-xs text-taiga-grey-light font-mono mb-1">ISSUE #{issue.ref}</p>
              {editingSubject ? (
                <div className="flex gap-2">
                  <input
                    className="input flex-1 text-xl font-semibold"
                    value={subjectDraft}
                    onChange={(e) => setSubjectDraft(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSubjectSave();
                      if (e.key === 'Escape') setEditingSubject(false);
                    }}
                  />
                  <button className="btn btn-sm btn-primary" onClick={handleSubjectSave}>
                    Save
                  </button>
                  <button className="btn btn-sm" onClick={() => setEditingSubject(false)}>
                    Cancel
                  </button>
                </div>
              ) : (
                <h1
                  className="text-2xl font-semibold cursor-pointer hover:text-taiga-link"
                  onClick={() => {
                    setSubjectDraft(issue.subject);
                    setEditingSubject(true);
                  }}
                >
                  {issue.subject}
                </h1>
              )}

              <div className="mt-2 flex gap-2 flex-wrap items-center">
                <ColorBadge name={issue.status_extra_info?.name} color={issue.status_extra_info?.color} />
                <ColorBadge name={issue.type_extra_info?.name} color={issue.type_extra_info?.color} />
                <ColorBadge name={issue.severity_extra_info?.name} color={issue.severity_extra_info?.color} />
                <ColorBadge name={issue.priority_extra_info?.name} color={issue.priority_extra_info?.color} />
                <Tags tags={issue.tags} />
              </div>

              {issue.is_blocked && (
                <div className="mt-2 p-2 rounded bg-taiga-red/10 border border-taiga-red/30 text-sm text-taiga-red">
                  <strong>Blocked:</strong>{' '}
                  {issue.blocked_note_html ? (
                    <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.blocked_note_html) }} />
                  ) : (
                    issue.blocked_note || 'No reason provided'
                  )}
                </div>
              )}

              {issue.generated_user_stories && issue.generated_user_stories.length > 0 && (
                <div className="mt-2 text-sm text-taiga-green-dark">
                  Promoted to user story
                </div>
              )}
            </header>

            {/* Description */}
            <section>
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-taiga-grey">Description</h2>
                {!editingDescription && (
                  <button
                    className="text-xs text-taiga-link hover:underline"
                    onClick={() => {
                      setDescriptionDraft(issue.description || '');
                      setEditingDescription(true);
                    }}
                  >
                    Edit
                  </button>
                )}
              </div>
              {editingDescription ? (
                <div className="space-y-2">
                  <textarea
                    className="input w-full min-h-[150px]"
                    value={descriptionDraft}
                    onChange={(e) => setDescriptionDraft(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button className="btn btn-sm btn-primary" onClick={handleDescriptionSave}>
                      Save
                    </button>
                    <button className="btn btn-sm" onClick={() => setEditingDescription(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              ) : issue.description_html ? (
                <div
                  className="prose max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(issue.description_html) }}
                />
              ) : issue.description ? (
                <p className="whitespace-pre-wrap text-sm">{issue.description}</p>
              ) : (
                <p className="text-sm text-taiga-grey-light italic">No description.</p>
              )}
            </section>
          </article>

          {/* Attachments */}
          <section className="card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">
                Attachments {attachments && attachments.length > 0 && `(${attachments.length})`}
              </h2>
              <label className="btn btn-sm cursor-pointer">
                + Upload
                <input
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            {attachments && attachments.length > 0 ? (
              <ul className="divide-y divide-taiga-grey-lighter/40">
                {attachments.map((att) => (
                  <li key={att.id} className="py-2 flex items-center gap-3 text-sm">
                    {att.thumbnail_card_url && (
                      <img
                        src={att.thumbnail_card_url}
                        alt={att.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <a
                        href={att.url || att.attached_file}
                        target="_blank"
                        rel="noreferrer"
                        className="text-taiga-link hover:underline truncate block"
                      >
                        {att.name}
                      </a>
                      <span className="text-xs text-taiga-grey-light">
                        {(att.size / 1024).toFixed(1)} KB
                        {att.created_date && ` \u00B7 ${formatDate(att.created_date)}`}
                      </span>
                    </div>
                    <button
                      className="text-xs text-taiga-red hover:underline"
                      onClick={() => handleDeleteAttachment(att.id)}
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-taiga-grey-light">No attachments.</p>
            )}
          </section>

          {/* Custom Fields */}
          {customAttrs && customAttrs.length > 0 && (
            <section className="card p-4 space-y-2">
              <h2 className="font-semibold text-sm">Custom Fields</h2>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                {customAttrs.map((attr) => (
                  <div key={attr.id} className="contents">
                    <dt className="text-taiga-grey-light">{attr.name}</dt>
                    <dd>{String(customValues?.[String(attr.id)] ?? '--')}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Comments & History */}
          <section className="card p-4 space-y-4">
            <h2 className="font-semibold text-sm">
              Activity {issue.total_comments ? `(${issue.total_comments} comments)` : ''}
            </h2>

            {/* Add comment */}
            <div className="space-y-2">
              <textarea
                className="input w-full min-h-[80px]"
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                className="btn btn-sm btn-primary"
                disabled={!comment.trim() || isSubmittingComment}
                onClick={handleAddComment}
              >
                {isSubmittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>

            {/* History */}
            {history && history.length > 0 && (
              <ul className="space-y-3">
                {history
                  .filter((entry) => !entry.is_hidden)
                  .map((entry) => (
                    <li key={entry.id} className="border-l-2 border-taiga-grey-lighter pl-3 py-1">
                      <div className="flex items-center gap-2 text-xs text-taiga-grey-light mb-1">
                        <Avatar
                          name={entry.user.name}
                          src={entry.user.photo}
                          size={20}
                        />
                        <span className="font-medium text-taiga-text">{entry.user.name}</span>
                        <span>{formatDate(entry.created_at)}</span>
                      </div>
                      {entry.comment_html && (
                        <div
                          className="prose prose-sm max-w-none text-sm"
                          dangerouslySetInnerHTML={{ __html: sanitizeHtml(entry.comment_html) }}
                        />
                      )}
                      {entry.comment && !entry.comment_html && (
                        <p className="text-sm whitespace-pre-wrap">{entry.comment}</p>
                      )}
                      {entry.values_diff && Object.keys(entry.values_diff).length > 0 && (
                        <div className="text-xs text-taiga-grey-light mt-1">
                          {Object.entries(entry.values_diff).map(([key, val]) => {
                            const diff = val as [unknown, unknown];
                            return (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>{' '}
                                <span className="line-through">{String(diff[0] ?? '')}</span>
                                {' \u2192 '}
                                <span>{String(diff[1] ?? '')}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  ))}
              </ul>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4 space-y-4">
          {/* Actions */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-taiga-grey-light uppercase">Actions</h3>

            <div className="flex gap-2">
              <button
                className={`btn btn-sm flex-1 ${issue.is_voter ? 'btn-primary' : ''}`}
                onClick={handleVote}
              >
                {issue.is_voter ? 'Voted' : 'Vote'} ({issue.total_voters ?? 0})
              </button>
              <button
                className={`btn btn-sm flex-1 ${issue.is_watcher ? 'btn-primary' : ''}`}
                onClick={handleWatch}
              >
                {issue.is_watcher ? 'Watching' : 'Watch'} ({issue.total_watchers ?? 0})
              </button>
            </div>

            {/* Promote to US */}
            {(!issue.generated_user_stories || issue.generated_user_stories.length === 0) && (
              <>
                {showPromoteConfirm ? (
                  <div className="flex items-center gap-2 text-sm">
                    <span>Convert to user story?</span>
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={handlePromote}
                      disabled={promoteMutation.isPending}
                    >
                      {promoteMutation.isPending ? '...' : 'Yes'}
                    </button>
                    <button className="btn btn-sm" onClick={() => setShowPromoteConfirm(false)}>
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    className="btn btn-sm w-full"
                    onClick={() => setShowPromoteConfirm(true)}
                  >
                    Promote to User Story
                  </button>
                )}
              </>
            )}

            {/* Delete */}
            {showDeleteConfirm ? (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-taiga-red">Delete issue?</span>
                <button
                  className="btn btn-sm bg-taiga-red text-white"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? '...' : 'Yes'}
                </button>
                <button className="btn btn-sm" onClick={() => setShowDeleteConfirm(false)}>
                  No
                </button>
              </div>
            ) : (
              <button
                className="btn btn-sm w-full text-taiga-red hover:bg-taiga-red/10"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Delete Issue
              </button>
            )}
          </div>

          {/* Properties */}
          <div className="card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-taiga-grey-light uppercase">Properties</h3>

            {/* Status */}
            <div>
              <label className="text-xs text-taiga-grey-light block mb-0.5">Status</label>
              <select
                className="input w-full text-sm"
                value={issue.status}
                onChange={(e) => handleStatusChange(Number(e.target.value))}
              >
                {statuses.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs text-taiga-grey-light block mb-0.5">Type</label>
              <select
                className="input w-full text-sm"
                value={issue.type}
                onChange={(e) => handleTypeChange(Number(e.target.value))}
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            {/* Severity */}
            <div>
              <label className="text-xs text-taiga-grey-light block mb-0.5">Severity</label>
              <select
                className="input w-full text-sm"
                value={issue.severity}
                onChange={(e) => handleSeverityChange(Number(e.target.value))}
              >
                {severities.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs text-taiga-grey-light block mb-0.5">Priority</label>
              <select
                className="input w-full text-sm"
                value={issue.priority}
                onChange={(e) => handlePriorityChange(Number(e.target.value))}
              >
                {priorities.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-xs text-taiga-grey-light block mb-0.5">Assigned to</label>
              <select
                className="input w-full text-sm"
                value={issue.assigned_to ?? ''}
                onChange={(e) =>
                  handleAssigneeChange(e.target.value ? Number(e.target.value) : null)
                }
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.user ?? m.id}>
                    {m.full_name || m.username || `Member #${m.id}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <label className="text-xs text-taiga-grey-light block mb-0.5">Tags</label>
              <Tags tags={issue.tags} />
              {(!issue.tags || issue.tags.length === 0) && (
                <span className="text-xs text-taiga-grey-light">No tags</span>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="card p-4 space-y-2 text-xs text-taiga-grey-light">
            <h3 className="text-xs font-semibold uppercase">Details</h3>
            <div className="grid grid-cols-2 gap-1">
              <span>Created by</span>
              <span className="text-taiga-text">
                {issue.owner_extra_info?.full_name_display ?? '--'}
              </span>
              <span>Created</span>
              <span className="text-taiga-text">{formatDate(issue.created_date)}</span>
              <span>Modified</span>
              <span className="text-taiga-text">{formatDate(issue.modified_date)}</span>
              {issue.due_date && (
                <>
                  <span>Due date</span>
                  <span className="text-taiga-text">{formatDate(issue.due_date)}</span>
                </>
              )}
              {issue.finished_date && (
                <>
                  <span>Finished</span>
                  <span className="text-taiga-text">{formatDate(issue.finished_date)}</span>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
