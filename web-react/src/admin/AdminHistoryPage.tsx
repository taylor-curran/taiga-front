import { useEffect, useMemo, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import type { HistoryContentType } from '../api/historyTypes';
import { ActivitySection } from './components/ActivitySection';
import { CommentsSection } from './components/CommentsSection';
import { HistoryTabs } from './components/HistoryTabs';
import { useHistoryStore, showActivityTab, showCommentTab } from './historyStore';

const VALID: HistoryContentType[] = ['us', 'issue', 'task', 'epic', 'wiki'];

function parseContentType(raw: string | undefined): HistoryContentType {
  const t = (raw ?? 'us').toLowerCase();
  return VALID.includes(t as HistoryContentType) ? (t as HistoryContentType) : 'us';
}

export function AdminHistoryPage() {
  const { objectId: oidParam, contentType: ctParam } = useParams<{
    contentType?: string;
    objectId?: string;
  }>();
  const [search] = useSearchParams();
  const token = search.get('token');
  const projectId = Number(search.get('project') ?? '1');

  const contentType = parseContentType(ctParam);
  const objectId = Number(oidParam ?? search.get('id') ?? '1');

  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [mePk, setMePk] = useState<number | null>(null);

  const project = useMemo(
    () => ({
      id: projectId,
      my_permissions: search.get('perms')?.split(',').filter(Boolean) ?? [
        'comment_us',
        'modify_project',
      ],
    }),
    [projectId, search],
  );

  const init = useHistoryStore((s) => s.init);
  const setToken = useHistoryStore((s) => s.setToken);
  const loadHistory = useHistoryStore((s) => s.loadHistory);
  const viewComments = useHistoryStore((s) => s.viewComments);
  const commentsNum = useHistoryStore((s) => s.commentsNum);
  const activitiesNum = useHistoryStore((s) => s.activitiesNum);

  useEffect(() => {
    setToken(token);
  }, [token, setToken]);

  useEffect(() => {
    init({ contentType, objectId, project });
    setLoadErr(null);
    void loadHistory().catch((e) => {
      setLoadErr(e instanceof Error ? e.message : String(e));
    });
  }, [init, loadHistory, contentType, objectId, project]);

  useEffect(() => {
    if (!token) {
      setMePk(null);
      return;
    }
    let cancelled = false;
    void fetch('/api/v1/users/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.id === 'number') setMePk(data.id);
      })
      .catch(() => {
        if (!cancelled) setMePk(null);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const showSection =
    showCommentTab({ commentsNum, project, contentType }) || showActivityTab({ activitiesNum });

  const modelLabel = contentType === 'us' ? 'User story' : contentType;

  return (
    <div className="admin-history-page">
      <h1>History — {contentType} #{objectId}</h1>
      <p className="admin-history-demo-hint">
        Pass <code>?token=…</code> (Bearer from <code>/api/v1/auth</code>) and optional{' '}
        <code>?project=1&amp;perms=comment_us,modify_project</code>. Route:{' '}
        <code>/admin/history/:contentType/:objectId</code>.
      </p>
      {loadErr ? (
        <p role="alert" style={{ color: 'var(--taiga-red)' }}>
          {loadErr}
        </p>
      ) : null}
      {showSection ? (
        <section className="history">
          <HistoryTabs />
          {viewComments ? (
            <CommentsSection name={contentType} project={project} currentUserPk={mePk} />
          ) : (
            <ActivitySection modelLabel={modelLabel} />
          )}
        </section>
      ) : (
        <p>No comments or activity for this object (or missing permissions).</p>
      )}
    </div>
  );
}
