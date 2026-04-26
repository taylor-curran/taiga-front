import { taigaGet } from './taigaClient';
import type { DutyLike, TaigaProjectSlight } from './types';

/** After resolving membership + project details for display. */
export type DashboardDuty = DutyLike & { projectInfo: TaigaProjectSlight };

function listEpics(params: Record<string, string | number | boolean>) {
  return taigaGet<DutyLike[]>('/api/v1/epics', params, {
    headers: { 'x-disable-pagination': '1' },
  }).then((rows) => rows.map((r) => ({ ...r, _name: 'epics' as const })));
}

function listUserStories(params: Record<string, string | number | boolean>) {
  return taigaGet<DutyLike[]>('/api/v1/userstories', params, {
    headers: { 'x-disable-pagination': '1' },
  }).then((rows) => rows.map((r) => ({ ...r, _name: 'userstories' as const })));
}

function listTasks(params: Record<string, string | number | boolean>) {
  return taigaGet<DutyLike[]>('/api/v1/tasks', params, {
    headers: { 'x-disable-pagination': '1' },
  }).then((rows) => rows.map((r) => ({ ...r, _name: 'tasks' as const })));
}

function listIssues(params: Record<string, string | number | boolean>) {
  return taigaGet<DutyLike[]>('/api/v1/issues', params, {
    headers: { 'x-disable-pagination': '1' },
  }).then((rows) => rows.map((r) => ({ ...r, _name: 'issues' as const })));
}

export async function getProjectsSlightByMember(userId: number) {
  return taigaGet<TaigaProjectSlight[]>('/api/v1/projects', {
    member: userId,
    order_by: 'user_order',
    slight: 'true',
  } as unknown as Record<string, string | number | boolean>, {
    headers: { 'x-disable-pagination': '1' },
  });
}

function toDashboardDuty(duty: DutyLike, byId: Map<string, TaigaProjectSlight>): DashboardDuty | null {
  const pid = typeof duty.project === 'number' ? duty.project : (duty.project as { id: number }).id;
  const p = byId.get(String(pid));
  if (!p) {
    return null;
  }
  return { ...duty, project: pid, projectInfo: p };
}

/**
 * Parity with `app/modules/home/home.service.coffee` `getWorkInProgress`.
 */
export async function loadWorkInProgress(
  userId: number,
): Promise<{ assignedTo: DashboardDuty[]; watching: DashboardDuty[] }> {
  const projects = await getProjectsSlightByMember(userId);
  const byId = new Map(projects.map((p) => [String(p.id), p]));

  const assignedParamsEpics = { status__is_closed: false, assigned_to: userId };
  const assignedParamsUs = { is_closed: false, assigned_users: userId, dashboard: 'true' };
  const assignedParamsTasks = { status__is_closed: false, assigned_to: userId };
  const assignedParamsIssues = { status__is_closed: false, assigned_to: userId };

  const watchingParamsEpics = { status__is_closed: false, watchers: userId };
  const watchingParamsUs = { is_closed: false, watchers: userId, dashboard: 'true' };
  const watchingParamsTasks = { status__is_closed: false, watchers: userId };
  const watchingParamsIssues = { status__is_closed: false, watchers: userId };

  const [aEpics, aUs, aTasks, aIssues, wEpics, wUs, wTasks, wIssues] = await Promise.all([
    listEpics(assignedParamsEpics),
    listUserStories(assignedParamsUs),
    listTasks(assignedParamsTasks),
    listIssues(assignedParamsIssues),
    listEpics(watchingParamsEpics),
    listUserStories(watchingParamsUs),
    listTasks(watchingParamsTasks),
    listIssues(watchingParamsIssues),
  ]);

  const mapMembership = (duties: DutyLike[]) =>
    duties
      .map((d) => toDashboardDuty(d, byId))
      .filter((d): d is DashboardDuty => d != null);

  const assignedRaw = mapMembership([...aEpics, ...aUs, ...aTasks, ...aIssues]);
  const watchingRaw = mapMembership([...wEpics, ...wUs, ...wTasks, ...wIssues]);

  const sortDuties = (list: DashboardDuty[]) =>
    [...list].sort((a, b) => (a.modified_date < b.modified_date ? 1 : a.modified_date > b.modified_date ? -1 : 0));

  return {
    assignedTo: sortDuties(assignedRaw),
    watching: sortDuties(watchingRaw),
  };
}

/**
 * @internal exported for unit tests
 */
export function dutyTypeLabel(name: DutyLike['_name']): string {
  if (name === 'epics') return 'Epic';
  if (name === 'userstories') return 'User story';
  if (name === 'tasks') return 'Task';
  if (name === 'issues') return 'Issue';
  return '';
}

export function projectLogoUrl(project: TaigaProjectSlight): string {
  return `/api/v1/projects/${project.id}/logo?`;
}

type Avatarish = { id: number; email?: string; photo?: string | null; gravatar_id?: string };

export function userAvatarUrl(user: Avatarish | null | undefined): string {
  if (!user) return '/media/unnamed.png';
  if (user.photo) {
    return user.photo;
  }
  if (user.id) {
    return `/api/v1/users/${user.id}/photo?`;
  }
  return user.gravatar_id
    ? `https://www.gravatar.com/avatar/${user.gravatar_id}?s=200`
    : '/media/unnamed.png';
}
