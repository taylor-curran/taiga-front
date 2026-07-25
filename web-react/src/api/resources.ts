import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  AuthUser,
  Epic,
  Issue,
  Membership,
  Milestone,
  Notification,
  ProjectSummary,
  RoleSummary,
  Task,
  UserStory,
  UserSummary,
  WikiLink,
  WikiPage,
} from './types';

// -------- Projects --------

export function useMyProjects() {
  return useQuery({
    queryKey: ['projects', 'mine'],
    queryFn: async () => {
      const me = (await api().get<AuthUser>('users/me')).data;
      const r = await api().get<ProjectSummary[]>('projects', { params: { member: me.id } });
      return r.data;
    },
  });
}

export function useDiscoverProjects(orderBy: string = 'most_liked') {
  return useQuery({
    queryKey: ['projects', 'discover', orderBy],
    queryFn: async () =>
      (await api().get<ProjectSummary[]>('projects', { params: { discover_mode: true, order_by: orderBy, page_size: 12 } })).data,
  });
}

export function useProjectBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['projects', 'slug', slug],
    enabled: !!slug,
    queryFn: async () => (await api().get<ProjectSummary>(`projects/by_slug`, { params: { slug } })).data,
  });
}

export function useProject(id: number | undefined) {
  return useQuery({
    queryKey: ['projects', id],
    enabled: !!id,
    queryFn: async () => (await api().get<ProjectSummary>(`projects/${id}`)).data,
  });
}

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<ProjectSummary> & { version?: number } }) =>
      (await api().patch<ProjectSummary>(`projects/${vars.id}`, vars.patch)).data,
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['projects', vars.id] });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`projects/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await api().post<ProjectSummary>('projects', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// -------- User stories --------

export function useUserStoriesByMilestone(projectId: number | undefined, milestoneId?: number | null) {
  return useQuery({
    queryKey: ['userstories', { projectId, milestoneId }],
    enabled: !!projectId,
    queryFn: async () => {
      const params: Record<string, unknown> = { project: projectId };
      if (milestoneId !== undefined) params.milestone = milestoneId === null ? 'null' : milestoneId;
      const r = await api().get<UserStory[]>('userstories', { params });
      return r.data;
    },
  });
}

export function useUserStoriesForKanban(projectId: number | undefined) {
  return useQuery({
    queryKey: ['userstories', 'kanban', projectId],
    enabled: !!projectId,
    queryFn: async () => (await api().get<UserStory[]>('userstories', { params: { project: projectId } })).data,
  });
}

export function useUserStoryByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['userstory', projectId, ref],
    enabled: !!projectId && !!ref,
    queryFn: async () =>
      (await api().get<UserStory>('userstories/by_ref', { params: { project: projectId, ref } })).data,
  });
}

export function useUpdateUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<UserStory> & { version?: number } }) =>
      (await api().patch<UserStory>(`userstories/${vars.id}`, vars.patch)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['userstories'] });
      qc.invalidateQueries({ queryKey: ['userstory', data.project, data.ref] });
    },
  });
}

export function useCreateUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<UserStory> & { project: number; subject: string }) =>
      (await api().post<UserStory>('userstories', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userstories'] }),
  });
}

export function useDeleteUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`userstories/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userstories'] }),
  });
}

export function useBulkUpdateUserStoryOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      project_id: number;
      bulk_stories: Array<{ us_id: number; order: number }>;
      milestone_id?: number;
      status_id?: number;
      type: 'backlog' | 'kanban' | 'milestone';
    }) => {
      const url =
        vars.type === 'kanban'
          ? 'userstories/bulk_update_kanban_order'
          : vars.type === 'milestone'
          ? 'userstories/bulk_update_milestone_order'
          : 'userstories/bulk_update_backlog_order';
      return (await api().post(url, vars)).data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userstories'] }),
  });
}

// -------- Tasks --------

export function useTasks(projectId: number | undefined, params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['tasks', projectId, params],
    enabled: !!projectId,
    queryFn: async () => (await api().get<Task[]>('tasks', { params: { project: projectId, ...params } })).data,
  });
}

export function useTaskByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['task', projectId, ref],
    enabled: !!projectId && !!ref,
    queryFn: async () => (await api().get<Task>('tasks/by_ref', { params: { project: projectId, ref } })).data,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Task> & { project: number; subject: string }) =>
      (await api().post<Task>('tasks', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<Task> & { version?: number } }) =>
      (await api().patch<Task>(`tasks/${vars.id}`, vars.patch)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task', data.project, data.ref] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`tasks/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// -------- Issues --------

export function useIssues(projectId: number | undefined, params: Record<string, unknown> = {}) {
  return useQuery({
    queryKey: ['issues', projectId, params],
    enabled: !!projectId,
    queryFn: async () => (await api().get<Issue[]>('issues', { params: { project: projectId, ...params } })).data,
  });
}

export function useIssueByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['issue', projectId, ref],
    enabled: !!projectId && !!ref,
    queryFn: async () => (await api().get<Issue>('issues/by_ref', { params: { project: projectId, ref } })).data,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Issue> & { project: number; subject: string }) =>
      (await api().post<Issue>('issues', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<Issue> & { version?: number } }) =>
      (await api().patch<Issue>(`issues/${vars.id}`, vars.patch)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue', data.project, data.ref] });
    },
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`issues/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

// -------- Epics --------

export function useEpics(projectId: number | undefined) {
  return useQuery({
    queryKey: ['epics', projectId],
    enabled: !!projectId,
    queryFn: async () => (await api().get<Epic[]>('epics', { params: { project: projectId } })).data,
  });
}

export function useEpicByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['epic', projectId, ref],
    enabled: !!projectId && !!ref,
    queryFn: async () => (await api().get<Epic>('epics/by_ref', { params: { project: projectId, ref } })).data,
  });
}

export function useCreateEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<Epic> & { project: number; subject: string }) =>
      (await api().post<Epic>('epics', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['epics'] }),
  });
}

export function useUpdateEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<Epic> & { version?: number } }) =>
      (await api().patch<Epic>(`epics/${vars.id}`, vars.patch)).data,
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['epics'] });
      qc.invalidateQueries({ queryKey: ['epic', data.project, data.ref] });
    },
  });
}

export function useDeleteEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`epics/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['epics'] }),
  });
}

// -------- Milestones / Sprints --------

export function useMilestones(projectId: number | undefined, closed?: boolean) {
  return useQuery({
    queryKey: ['milestones', projectId, closed],
    enabled: !!projectId,
    queryFn: async () => {
      const params: Record<string, unknown> = { project: projectId };
      if (closed !== undefined) params.closed = closed;
      return (await api().get<Milestone[]>('milestones', { params })).data;
    },
  });
}

export function useMilestoneBySlug(projectId: number | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ['milestone', projectId, slug],
    enabled: !!projectId && !!slug,
    queryFn: async () =>
      (await api().get<Milestone>('milestones', { params: { project: projectId, slug } })).data,
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { project: number; name: string; estimated_start: string; estimated_finish: string }) =>
      (await api().post<Milestone>('milestones', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<Milestone> }) =>
      (await api().patch<Milestone>(`milestones/${vars.id}`, vars.patch)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  });
}

export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`milestones/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  });
}

// -------- Memberships / Roles / Users --------

export function useMemberships(projectId: number | undefined) {
  return useQuery({
    queryKey: ['memberships', projectId],
    enabled: !!projectId,
    queryFn: async () =>
      (
        await api().get<Membership[]>('memberships', {
          params: { project: projectId, page_size: 200 },
        })
      ).data,
  });
}

export function useRoles(projectId: number | undefined) {
  return useQuery({
    queryKey: ['roles', projectId],
    enabled: !!projectId,
    queryFn: async () => (await api().get<RoleSummary[]>('roles', { params: { project: projectId } })).data,
  });
}

export function useUser(idOrUsername: number | string | undefined) {
  return useQuery({
    queryKey: ['user', idOrUsername],
    enabled: !!idOrUsername,
    queryFn: async () => {
      if (typeof idOrUsername === 'number' || (typeof idOrUsername === 'string' && /^\d+$/.test(idOrUsername))) {
        return (await api().get<UserSummary>(`users/${idOrUsername}`)).data;
      }
      // Username — Taiga's REST endpoint takes `?username=` not a path param.
      return (await api().get<UserSummary>('users/by_username', { params: { username: idOrUsername } })).data;
    },
  });
}

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => (await api().get<AuthUser>('users/me')).data,
  });
}

export function useUpdateMe() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (patch: Partial<AuthUser>) =>
      (await api().patch<AuthUser>('users/me', patch)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
  });
}

// -------- Wiki --------

export function useWikiPages(projectId: number | undefined) {
  return useQuery({
    queryKey: ['wiki', 'pages', projectId],
    enabled: !!projectId,
    queryFn: async () => (await api().get<WikiPage[]>('wiki', { params: { project: projectId } })).data,
  });
}

export function useWikiPageBySlug(projectId: number | undefined, slug: string | undefined) {
  return useQuery({
    queryKey: ['wiki', 'page', projectId, slug],
    enabled: !!projectId && !!slug,
    queryFn: async () => {
      try {
        return (await api().get<WikiPage>('wiki/by_slug', { params: { project: projectId, slug } })).data;
      } catch (e: unknown) {
        const ax = e as { response?: { status?: number } };
        if (ax?.response?.status === 404) return null;
        throw e;
      }
    },
  });
}

export function useUpdateWikiPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<WikiPage> & { version?: number } }) =>
      (await api().patch<WikiPage>(`wiki/${vars.id}`, vars.patch)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wiki'] }),
  });
}

export function useCreateWikiPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { project: number; slug: string; content: string }) =>
      (await api().post<WikiPage>('wiki', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wiki'] }),
  });
}

export function useDeleteWikiPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`wiki/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wiki'] }),
  });
}

export function useWikiLinks(projectId: number | undefined) {
  return useQuery({
    queryKey: ['wiki', 'links', projectId],
    enabled: !!projectId,
    queryFn: async () =>
      (await api().get<WikiLink[]>('wiki-links', { params: { project: projectId } })).data,
  });
}

export function useCreateWikiLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { project: number; title: string; href: string; order?: number }) =>
      (await api().post<WikiLink>('wiki-links', payload)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wiki', 'links'] }),
  });
}

export function useDeleteWikiLink() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`wiki-links/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['wiki', 'links'] }),
  });
}

// -------- Notifications --------

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () =>
      (await api().get<{ objects: Notification[] }>('notifications', { params: { only_unread: false } })).data,
  });
}

export function useNotificationsPolicies(projectId: number | undefined) {
  return useQuery({
    queryKey: ['notif-policies', projectId],
    enabled: !!projectId,
    queryFn: async () =>
      (
        await api().get<unknown[]>('notify-policies', {
          params: { project: projectId },
        })
      ).data,
  });
}

// -------- Profile / Activity --------

export function useUserContacts(userId: number | undefined) {
  return useQuery({
    queryKey: ['user-contacts', userId],
    enabled: !!userId,
    queryFn: async () =>
      (await api().get<UserSummary[]>(`users/${userId}/contacts`)).data.slice(0, 20),
  });
}

// -------- History / Comments --------

export interface HistoryRecord {
  id: string;
  user: { pk?: number; name?: string; photo?: string | null; username?: string } | null;
  created_at: string;
  type: number;
  comment: string;
  comment_html?: string;
  delete_comment_date?: string | null;
  values_diff?: Record<string, unknown>;
  diff?: Record<string, unknown>;
  is_hidden?: boolean;
  is_snapshot?: boolean;
}

export function useHistory(kind: 'us' | 'task' | 'issue' | 'epic' | 'wiki', id: number | undefined) {
  return useQuery({
    queryKey: ['history', kind, id],
    enabled: !!id,
    queryFn: async () => (await api().get<HistoryRecord[]>(`history/${kind}/${id}`)).data,
  });
}

export function usePostComment(kind: 'us' | 'task' | 'issue' | 'epic' | 'wiki') {
  const qc = useQueryClient();
  const path = kind === 'us' ? 'userstories' : kind === 'task' ? 'tasks' : kind === 'issue' ? 'issues' : kind === 'epic' ? 'epics' : 'wiki';
  return useMutation({
    mutationFn: async (vars: { id: number; comment: string; version?: number }) =>
      (
        await api().patch(`${path}/${vars.id}`, {
          comment: vars.comment,
          version: vars.version,
        })
      ).data,
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['history', kind, vars.id] });
      qc.invalidateQueries({ queryKey: [kind === 'us' ? 'userstory' : kind] });
    },
  });
}

// -------- Search --------

export interface SearchResults {
  count: number;
  userstories: UserStory[];
  tasks: Task[];
  issues: Issue[];
  epics: Epic[];
  wikipages: WikiPage[];
}

export function useSearch(projectId: number | undefined, q: string) {
  return useQuery({
    queryKey: ['search', projectId, q],
    enabled: !!projectId && !!q,
    queryFn: async () => (await api().get<SearchResults>('search', { params: { project: projectId, text: q } })).data,
  });
}

// -------- Resolver: ref to type/path --------

export interface ResolveResult {
  project?: number;
  us?: number;
  task?: number;
  issue?: number;
  epic?: number;
  wikipage?: number;
}

export function useResolve(pslug: string | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['resolve', pslug, ref],
    enabled: !!pslug && !!ref,
    queryFn: async () =>
      (await api().get<ResolveResult>('resolver', { params: { project: pslug, ref } })).data,
  });
}

// -------- Stats --------

export function useProjectStats(projectId: number | undefined) {
  return useQuery({
    queryKey: ['project-stats', projectId],
    enabled: !!projectId,
    queryFn: async () => (await api().get<Record<string, unknown>>(`projects/${projectId}/stats`)).data,
  });
}

// -------- Timeline --------

export interface TimelineEntry {
  id: number;
  created: string;
  data: Record<string, unknown>;
  event_type: string;
  data_content_type: string;
  obj_content_type?: string;
  object_id?: number;
}

export function useProjectTimeline(projectId: number | undefined, page: number = 1) {
  return useQuery({
    queryKey: ['timeline', 'project', projectId, page],
    enabled: !!projectId,
    queryFn: async () =>
      (await api().get<TimelineEntry[]>(`timeline/project/${projectId}`, { params: { page } })).data,
  });
}

export function useUserTimeline(userId: number | undefined, page: number = 1) {
  return useQuery({
    queryKey: ['timeline', 'user', userId, page],
    enabled: !!userId,
    queryFn: async () =>
      (await api().get<TimelineEntry[]>(`timeline/profile/${userId}`, { params: { page } })).data,
  });
}

// -------- Webhooks (admin) --------

export function useWebhooks(projectId: number | undefined) {
  return useQuery({
    queryKey: ['webhooks', projectId],
    enabled: !!projectId,
    queryFn: async () =>
      (await api().get<unknown[]>('webhooks', { params: { project: projectId } })).data,
  });
}

// -------- Project members + invitations --------

export function useInviteMembers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { project: number; bulk_memberships: Array<{ role_id: number; email: string }> }) =>
      (await api().post('memberships/bulk_create', vars)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memberships'] }),
  });
}

export function useUpdateMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (vars: { id: number; patch: Partial<Membership> }) =>
      (await api().patch(`memberships/${vars.id}`, vars.patch)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memberships'] }),
  });
}

export function useDeleteMembership() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => (await api().delete(`memberships/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memberships'] }),
  });
}
