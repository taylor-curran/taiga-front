import type { ActivityEntry, HistoryComment, TimelineEvent } from '@/types/history';

const API = '/api/v1';

export type ListCommentsResult = { comments: HistoryComment[]; commentsNum: number };

/**
 * `GET /api/v1/history/{contentTypePath}/{id}?type=comment` — see `app/coffee/modules/resources/history.coffee`
 */
export async function listComments(
  contentType: 'us' | 'issue' | 'task' | 'epic' | 'wiki',
  objectId: number,
  reverseOrder: boolean,
): Promise<ListCommentsResult> {
  const path = contentTypeToHistoryPath(contentType);
  const url = new URL(`${API}/history/${path}/${objectId}`, window.location.origin);
  url.searchParams.set('type', 'comment');
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to load comments: ${res.status}`);
  const raw = (await res.json()) as unknown;
  const arr = Array.isArray(raw) ? raw : [];
  const withText = (arr as HistoryComment[]).filter((c) => c.comment && c.comment.length > 0);
  const ordered = reverseOrder ? [...withText].reverse() : withText;
  return { comments: ordered, commentsNum: ordered.length };
}

/**
 * `GET /api/v1/history/{contentTypePath}/{id}?type=activity&page=` — `history-resource.service.coffee`
 */
export async function listActivity(
  contentType: 'us' | 'issue' | 'task' | 'epic' | 'wiki',
  objectId: number,
  page: number,
): Promise<{ activities: ActivityEntry[]; hasNext: boolean; count: string | null }> {
  const path = contentTypeToHistoryPath(contentType);
  const url = new URL(`${API}/history/${path}/${objectId}`, window.location.origin);
  url.searchParams.set('type', 'activity');
  url.searchParams.set('page', String(page));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to load activity: ${res.status}`);
  const data = (await res.json()) as unknown;
  const list = Array.isArray(data) ? (data as ActivityEntry[]) : [];
  const hasNext = res.headers.get('x-pagination-next') === 'true';
  const count = res.headers.get('x-pagination-count');
  return { activities: list, hasNext, count };
}

/**
 * `POST` edit/delete/undelete — `app/coffee/modules/resources/history.coffee`
 */
export async function editComment(
  contentType: 'us' | 'issue' | 'task' | 'epic' | 'wiki',
  objectId: number,
  activityId: number,
  comment: string,
): Promise<unknown> {
  const path = contentTypeToHistoryPath(contentType);
  const url = new URL(
    `${API}/history/${path}/${objectId}/edit_comment`,
    window.location.origin,
  );
  url.searchParams.set('id', String(activityId));
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) throw new Error(`edit_comment failed: ${res.status}`);
  return res.json();
}

export async function deleteComment(
  contentType: 'us' | 'issue' | 'task' | 'epic' | 'wiki',
  objectId: number,
  activityId: number,
): Promise<unknown> {
  const path = contentTypeToHistoryPath(contentType);
  const url = new URL(
    `${API}/history/${path}/${objectId}/delete_comment`,
    window.location.origin,
  );
  url.searchParams.set('id', String(activityId));
  const res = await fetch(url.toString(), { method: 'POST' });
  if (!res.ok) throw new Error(`delete_comment failed: ${res.status}`);
  return res.json();
}

export async function undeleteComment(
  contentType: 'us' | 'issue' | 'task' | 'epic' | 'wiki',
  objectId: number,
  activityId: number,
): Promise<unknown> {
  const path = contentTypeToHistoryPath(contentType);
  const url = new URL(
    `${API}/history/${path}/${objectId}/undelete_comment`,
    window.location.origin,
  );
  url.searchParams.set('id', String(activityId));
  const res = await fetch(url.toString(), { method: 'POST' });
  if (!res.ok) throw new Error(`undelete_comment failed: ${res.status}`);
  return res.json();
}

/** Patch model to add a comment field (WYSIWYG path) — `app/coffee/modules/common.coffee` */
export async function patchUserstory(
  usId: number,
  body: { comment: string; version: number },
): Promise<unknown> {
  const res = await fetch(`${API}/userstories/${usId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH userstory failed: ${res.status}`);
  return res.json();
}

export async function getUserstoryForComment(usId: number): Promise<{ version: number }> {
  const res = await fetch(`${API}/userstories/${usId}`);
  if (!res.ok) throw new Error(`GET userstory failed: ${res.status}`);
  const data = (await res.json()) as { version: number };
  return { version: data.version };
}

/**
 * `GET /api/v1/timeline/project/{id}?page=&only_relevant=true` with `x-lazy-pagination: true`
 */
export async function getProjectTimelinePage(
  projectId: number,
  page: number,
): Promise<TimelineEvent[]> {
  const url = new URL(`${API}/timeline/project/${projectId}`, window.location.origin);
  url.searchParams.set('page', String(page));
  url.searchParams.set('only_relevant', 'true');
  const res = await fetch(url.toString(), { headers: { 'x-lazy-pagination': 'true' } });
  if (!res.ok) throw new Error(`timeline failed: ${res.status}`);
  const data = (await res.json()) as { data?: TimelineEvent[] } | TimelineEvent[] | null;
  if (Array.isArray(data)) return data;
  if (data && 'data' in data && Array.isArray(data.data)) return data.data;
  return [];
}

export async function getProjectIdBySlug(slug: string): Promise<number> {
  const res = await fetch(`${API}/projects/by_slug?slug=${encodeURIComponent(slug)}`);
  if (!res.ok) throw new Error(`project by slug failed: ${res.status}`);
  const p = (await res.json()) as { id: number };
  return p.id;
}

function contentTypeToHistoryPath(
  t: 'us' | 'issue' | 'task' | 'epic' | 'wiki',
): 'userstory' | 'issue' | 'task' | 'epic' | 'wiki' {
  if (t === 'us') return 'userstory';
  return t;
}
