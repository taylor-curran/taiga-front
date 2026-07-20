import type { ActivityEntry, HistoryComment, HistoryContentType } from './historyTypes';

const API = '/api/v1';

function historySegment(type: HistoryContentType): string {
  switch (type) {
    case 'us':
      return 'userstory';
    case 'issue':
      return 'issue';
    case 'task':
      return 'task';
    case 'epic':
      return 'epic';
    case 'wiki':
      return 'wiki';
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function objectResourcePlural(type: HistoryContentType): string {
  switch (type) {
    case 'us':
      return 'userstories';
    case 'issue':
      return 'issues';
    case 'task':
      return 'tasks';
    case 'epic':
      return 'epics';
    case 'wiki':
      return 'wiki';
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}

function authHeaders(token: string | null): HeadersInit {
  const h: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export async function fetchCommentHistory(
  token: string | null,
  type: HistoryContentType,
  objectId: number,
  activityId: number,
): Promise<unknown[]> {
  const seg = historySegment(type);
  const url = new URL(`${API}/history/${seg}/${objectId}/comment_versions`, window.location.origin);
  url.searchParams.set('id', String(activityId));
  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`comment_versions ${res.status}`);
  return res.json() as Promise<unknown[]>;
}

export async function fetchComments(
  token: string | null,
  type: HistoryContentType,
  objectId: number,
): Promise<HistoryComment[]> {
  const seg = historySegment(type);
  const url = new URL(`${API}/history/${seg}/${objectId}`, window.location.origin);
  url.searchParams.set('type', 'comment');
  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`history comments ${res.status}`);
  const data = (await res.json()) as HistoryComment[];
  return Array.isArray(data) ? data : [];
}

export type ActivityPageResult = {
  list: ActivityEntry[];
  nextPage: number | null;
  totalCount: number | null;
};

export async function fetchActivityPage(
  token: string | null,
  type: HistoryContentType,
  objectId: number,
  page: number,
): Promise<ActivityPageResult> {
  const seg = historySegment(type);
  const url = new URL(`${API}/history/${seg}/${objectId}`, window.location.origin);
  url.searchParams.set('type', 'activity');
  url.searchParams.set('page', String(page));
  const res = await fetch(url.toString(), { headers: authHeaders(token) });
  if (!res.ok) throw new Error(`history activity ${res.status}`);
  const list = (await res.json()) as ActivityEntry[];
  const next = res.headers.get('x-pagination-next');
  const countHeader = res.headers.get('x-pagination-count');
  return {
    list: Array.isArray(list) ? list : [],
    nextPage: next ? page + 1 : null,
    totalCount: countHeader != null ? Number(countHeader) : null,
  };
}

export async function postEditComment(
  token: string | null,
  type: HistoryContentType,
  objectId: number,
  activityId: number,
  comment: string,
): Promise<unknown> {
  const seg = historySegment(type);
  const url = new URL(`${API}/history/${seg}/${objectId}/edit_comment`, window.location.origin);
  url.searchParams.set('id', String(activityId));
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ comment }),
  });
  if (!res.ok) throw new Error(`edit_comment ${res.status}`);
  return res.json();
}

export async function postDeleteComment(
  token: string | null,
  type: HistoryContentType,
  objectId: number,
  activityId: number,
): Promise<unknown> {
  const seg = historySegment(type);
  const url = new URL(`${API}/history/${seg}/${objectId}/delete_comment`, window.location.origin);
  url.searchParams.set('id', String(activityId));
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: authHeaders(token),
    body: null,
  });
  if (!res.ok) throw new Error(`delete_comment ${res.status}`);
  return res.json();
}

export async function postUndeleteComment(
  token: string | null,
  type: HistoryContentType,
  objectId: number,
  activityId: number,
): Promise<unknown> {
  const seg = historySegment(type);
  const url = new URL(`${API}/history/${seg}/${objectId}/undelete_comment`, window.location.origin);
  url.searchParams.set('id', String(activityId));
  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: authHeaders(token),
    body: null,
  });
  if (!res.ok) throw new Error(`undelete_comment ${res.status}`);
  return res.json();
}

export async function patchObjectComment(
  token: string | null,
  type: HistoryContentType,
  objectId: number,
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const plural = objectResourcePlural(type);
  const url = `${API}/${plural}/${objectId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`PATCH ${plural} ${res.status}: ${errText.slice(0, 200)}`);
  }
  return res.json() as Promise<Record<string, unknown>>;
}
