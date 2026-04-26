import { useState } from 'react';
import { Link, useOutletContext, useParams } from 'react-router-dom';
import {
  type ItemType,
  useHistory,
  useItemDetail,
  usePostComment,
  useUpdateItem,
} from '@/projects/queries';
import { Avatar } from '@/components/Avatar';
import { StatusPill } from '@/components/StatusPill';
import type { ProjectDetail } from '@/api/types';

interface DetailProps {
  type: ItemType;
}

const TYPE_LABEL: Record<ItemType, string> = {
  userstory: 'User story',
  task: 'Task',
  issue: 'Issue',
  epic: 'Epic',
};

export default function ItemDetail({ type }: DetailProps) {
  const { project } = useOutletContext<{ project: ProjectDetail }>();
  const params = useParams();
  const ref = (params.usref ?? params.taskref ?? params.issueref ?? params.epicref) as string | undefined;

  const { data: item, isPending, error } = useItemDetail(type, project.slug, ref);
  const { data: history } = useHistory(type, item?.id);
  const post = usePostComment(type, item?.id);
  const update = useUpdateItem(type, item?.id);

  const [comment, setComment] = useState('');

  if (isPending) {
    return <p className="muted" data-testid="item-loading">Loading…</p>;
  }
  if (error || !item) {
    return <div className="banner banner-error" data-testid="item-error">Could not load item.</div>;
  }

  const statusList =
    type === 'userstory'
      ? project.us_statuses
      : type === 'task'
        ? project.task_statuses
        : type === 'issue'
          ? project.issue_statuses
          : project.epic_statuses;

  const onChangeStatus = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = Number(e.target.value);
    update.mutate({ patch: { status: newStatus }, version: item.version });
  };

  const onSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    post.mutate(
      { comment, version: item.version },
      {
        onSuccess: () => setComment(''),
      },
    );
  };

  const comments = (history ?? []).filter((h) => h.comment && h.comment.length > 0);

  return (
    <div data-testid={`item-detail-${type}`}>
      <p>
        <Link to={`/project/${project.slug}/timeline`}>{project.name}</Link>{' '}
        <span className="muted">/ {TYPE_LABEL[type]}</span>
      </p>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span className="ref">#{item.ref}</span>
        <span data-testid="item-subject">{item.subject}</span>
      </h1>
      <div className="detail-grid">
        <div>
          <section className="card" data-testid="item-description">
            {item.description_html ? (
              <div dangerouslySetInnerHTML={{ __html: item.description_html }} />
            ) : (
              <p className="muted">{item.description || 'No description.'}</p>
            )}
          </section>

          <section className="card">
            <h3>Comments ({comments.length})</h3>
            <form onSubmit={onSubmitComment} style={{ marginBottom: '0.8rem' }} data-testid="comment-form">
              <textarea
                placeholder="Write a comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                data-testid="comment-input"
              />
              <div style={{ marginTop: '0.4rem' }}>
                <button className="btn" disabled={!comment.trim() || post.isPending} data-testid="comment-submit">
                  {post.isPending ? 'Posting…' : 'Comment'}
                </button>
              </div>
              {post.error && <div className="error-text">Could not post comment.</div>}
            </form>
            <ul className="list" data-testid="comments-list">
              {comments.map((c) => (
                <li key={c.id} style={{ alignItems: 'flex-start' }}>
                  <Avatar
                    user={{
                      photo: c.user?.photo,
                      gravatar_id: undefined,
                      full_name_display: c.user?.name,
                    }}
                    size={32}
                  />
                  <div className="grow">
                    <div>
                      <strong>{c.user?.name ?? 'Unknown'}</strong>{' '}
                      <span className="muted">{new Date(c.created_at).toLocaleString()}</span>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: c.comment_html || c.comment }} />
                  </div>
                </li>
              ))}
              {comments.length === 0 && <li className="muted">No comments yet.</li>}
            </ul>
          </section>

          <section className="card">
            <h3>History</h3>
            <ul className="list" data-testid="history-list">
              {(history ?? []).slice(0, 50).map((h) => (
                <li key={h.id}>
                  <span className="muted">{new Date(h.created_at).toLocaleString()}</span>
                  <span className="grow">
                    <strong>{h.user?.name ?? 'Unknown'}</strong>{' '}
                    {Object.keys(h.values_diff || {}).length > 0 && (
                      <span className="muted">
                        changed {Object.keys(h.values_diff).join(', ')}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside>
          <div className="card">
            <h3>Status</h3>
            <StatusPill name={item.status_extra_info.name} color={item.status_extra_info.color} />
            {statusList && statusList.length > 0 && (
              <select
                value={item.status}
                onChange={onChangeStatus}
                disabled={update.isPending}
                style={{ marginTop: '0.5rem' }}
                data-testid="status-select"
              >
                {statusList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="card">
            <h3>Assigned to</h3>
            {item.assigned_to_extra_info ? (
              <span style={{ display: 'inline-flex', gap: '0.4rem', alignItems: 'center' }}>
                <Avatar user={item.assigned_to_extra_info} size={28} />
                {item.assigned_to_extra_info.full_name_display}
              </span>
            ) : (
              <p className="muted">Unassigned</p>
            )}
          </div>
          <div className="card">
            <h3>Tags</h3>
            {item.tags && item.tags.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                {item.tags.map(([name, color]) => (
                  <span
                    key={name}
                    className="tag"
                    style={color ? { background: color, color: '#fff', borderColor: color } : undefined}
                  >
                    {name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="muted">No tags.</p>
            )}
          </div>
          <div className="card">
            <h3>Watchers</h3>
            <p>{item.total_watchers}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
