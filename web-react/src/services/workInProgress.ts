import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DutyItem, Epic, Issue, Task, UserStory } from '@/types/api';

function toDuty(item: UserStory | Task | Issue | Epic, type: DutyItem['_type']): DutyItem {
  return {
    id: item.id,
    ref: item.ref,
    subject: item.subject,
    status_extra_info: item.status_extra_info,
    is_blocked: item.is_blocked,
    blocked_note: item.blocked_note,
    assigned_to_extra_info: item.assigned_to_extra_info,
    project: item.project,
    project_extra_info: item.project_extra_info,
    modified_date: item.modified_date,
    _type: type,
  };
}

export interface WorkInProgress {
  assignedTo: DutyItem[];
  watching: DutyItem[];
}

export async function fetchWorkInProgress(userId: number): Promise<WorkInProgress> {
  const [
    assignedEpics,
    assignedUS,
    assignedTasks,
    assignedIssues,
    watchingEpics,
    watchingUS,
    watchingTasks,
    watchingIssues,
  ] = await Promise.all([
    api.get<Epic[]>('epics', { params: { status__is_closed: false, assigned_to: userId } }),
    api.get<UserStory[]>('userstories', { params: { is_closed: false, assigned_users: userId, dashboard: true } }),
    api.get<Task[]>('tasks', { params: { status__is_closed: false, assigned_to: userId } }),
    api.get<Issue[]>('issues', { params: { status__is_closed: false, assigned_to: userId } }),
    api.get<Epic[]>('epics', { params: { status__is_closed: false, watchers: userId } }),
    api.get<UserStory[]>('userstories', { params: { is_closed: false, watchers: userId, dashboard: true } }),
    api.get<Task[]>('tasks', { params: { status__is_closed: false, watchers: userId } }),
    api.get<Issue[]>('issues', { params: { status__is_closed: false, watchers: userId } }),
  ]);

  const assigned: DutyItem[] = [
    ...assignedUS.data.map((u) => toDuty(u, 'userstory')),
    ...assignedTasks.data.map((t) => toDuty(t, 'task')),
    ...assignedIssues.data.map((i) => toDuty(i, 'issue')),
    ...assignedEpics.data.map((e) => toDuty(e, 'epic')),
  ].sort((a, b) => {
    const da = a.modified_date ?? '';
    const db = b.modified_date ?? '';
    return db.localeCompare(da);
  });

  const watched: DutyItem[] = [
    ...watchingUS.data.map((u) => toDuty(u, 'userstory')),
    ...watchingTasks.data.map((t) => toDuty(t, 'task')),
    ...watchingIssues.data.map((i) => toDuty(i, 'issue')),
    ...watchingEpics.data.map((e) => toDuty(e, 'epic')),
  ].sort((a, b) => {
    const da = a.modified_date ?? '';
    const db = b.modified_date ?? '';
    return db.localeCompare(da);
  });

  return { assignedTo: assigned, watching: watched };
}

export function useWorkInProgress(userId: number | undefined) {
  return useQuery({
    queryKey: ['workInProgress', userId],
    queryFn: () => fetchWorkInProgress(userId as number),
    enabled: !!userId,
  });
}
