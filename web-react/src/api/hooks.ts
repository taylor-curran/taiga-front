// TanStack Query hooks for all Taiga resources
// One hook file covering every resource provider from resources.coffee

import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { apiClient } from './client';
import { API_URLS } from './urls';
import type {
  Project, User, UserStory, Task, Issue, Epic, Milestone,
  WikiPage, WikiLink, Membership, Attachment, HistoryEntry,
  Webhook, NotifyPolicy, WebNotification, SearchResults,
  DiscoverProject, TimelineEntry, ProjectStats,
} from '../types/models';

// ─── Projects ───────────────────────────────────────────────────────
export function useProjects(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => apiClient.get<Project[]>(API_URLS.projects, { params }).then(r => r.data),
  });
}

export function useProject(id: number, opts?: Partial<UseQueryOptions<Project>>) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => apiClient.get<Project>(`${API_URLS.projects}/${id}`).then(r => r.data),
    enabled: id > 0,
    ...opts,
  });
}

export function useProjectBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['project-by-slug', slug],
    queryFn: async () => {
      const { data: resolver } = await apiClient.get<{ project: number }>(API_URLS.resolver, {
        params: { project: slug },
      });
      return apiClient.get<Project>(`${API_URLS.projects}/${resolver.project}`).then(r => r.data);
    },
    enabled: !!slug,
  });
}

export function useProjectStats(projectId: number) {
  return useQuery({
    queryKey: ['project-stats', projectId],
    queryFn: () => apiClient.get<ProjectStats>(`${API_URLS.projects}/${projectId}/stats`).then(r => r.data),
    enabled: projectId > 0,
  });
}

export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Project>) => apiClient.post<Project>(API_URLS.projects, { body }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['projects'] }),
  });
}

// ─── User Stories ───────────────────────────────────────────────────
export function useUserStories(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['userstories', params],
    queryFn: () => apiClient.get<UserStory[]>(API_URLS.userstories, { params }).then(r => r.data),
  });
}

export function useUserStory(id: number) {
  return useQuery({
    queryKey: ['userstory', id],
    queryFn: () => apiClient.get<UserStory>(`${API_URLS.userstories}/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

export function useCreateUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<UserStory>) => apiClient.post<UserStory>(API_URLS.userstories, { body }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userstories'] }),
  });
}

export function useUpdateUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<UserStory> & { id: number }) =>
      apiClient.patch<UserStory>(`${API_URLS.userstories}/${id}`, { body }).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['userstories'] });
      qc.invalidateQueries({ queryKey: ['userstory', vars.id] });
    },
  });
}

export function useDeleteUserStory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API_URLS.userstories}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['userstories'] }),
  });
}

// ─── Tasks ──────────────────────────────────────────────────────────
export function useTasks(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['tasks', params],
    queryFn: () => apiClient.get<Task[]>(API_URLS.tasks, { params }).then(r => r.data),
  });
}

export function useTask(id: number) {
  return useQuery({
    queryKey: ['task', id],
    queryFn: () => apiClient.get<Task>(`${API_URLS.tasks}/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Task>) => apiClient.post<Task>(API_URLS.tasks, { body }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Task> & { id: number }) =>
      apiClient.patch<Task>(`${API_URLS.tasks}/${id}`, { body }).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
      qc.invalidateQueries({ queryKey: ['task', vars.id] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API_URLS.tasks}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

// ─── Issues ─────────────────────────────────────────────────────────
export function useIssues(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => apiClient.get<Issue[]>(API_URLS.issues, { params }).then(r => r.data),
  });
}

export function useIssue(id: number) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => apiClient.get<Issue>(`${API_URLS.issues}/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Issue>) => apiClient.post<Issue>(API_URLS.issues, { body }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

export function useUpdateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Issue> & { id: number }) =>
      apiClient.patch<Issue>(`${API_URLS.issues}/${id}`, { body }).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue', vars.id] });
    },
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.delete(`${API_URLS.issues}/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['issues'] }),
  });
}

// ─── Epics ──────────────────────────────────────────────────────────
export function useEpics(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['epics', params],
    queryFn: () => apiClient.get<Epic[]>(API_URLS.epics, { params }).then(r => r.data),
  });
}

export function useEpic(id: number) {
  return useQuery({
    queryKey: ['epic', id],
    queryFn: () => apiClient.get<Epic>(`${API_URLS.epics}/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

export function useCreateEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Epic>) => apiClient.post<Epic>(API_URLS.epics, { body }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['epics'] }),
  });
}

export function useUpdateEpic() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: Partial<Epic> & { id: number }) =>
      apiClient.patch<Epic>(`${API_URLS.epics}/${id}`, { body }).then(r => r.data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['epics'] });
      qc.invalidateQueries({ queryKey: ['epic', vars.id] });
    },
  });
}

// ─── Milestones / Sprints ───────────────────────────────────────────
export function useMilestones(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['milestones', params],
    queryFn: () => apiClient.get<Milestone[]>(API_URLS.milestones, { params }).then(r => r.data),
  });
}

export function useMilestone(id: number) {
  return useQuery({
    queryKey: ['milestone', id],
    queryFn: () => apiClient.get<Milestone>(`${API_URLS.milestones}/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<Milestone>) => apiClient.post<Milestone>(API_URLS.milestones, { body }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['milestones'] }),
  });
}

// ─── Wiki ───────────────────────────────────────────────────────────
export function useWikiPages(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['wiki', params],
    queryFn: () => apiClient.get<WikiPage[]>(API_URLS.wiki, { params }).then(r => r.data),
  });
}

export function useWikiPage(id: number) {
  return useQuery({
    queryKey: ['wiki-page', id],
    queryFn: () => apiClient.get<WikiPage>(`${API_URLS.wiki}/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

export function useWikiPageBySlug(projectId: number, slug: string | undefined) {
  return useQuery({
    queryKey: ['wiki-page-slug', projectId, slug],
    queryFn: () => apiClient.get<WikiPage[]>(API_URLS.wiki, { params: { project: projectId, slug } }).then(r => r.data[0]),
    enabled: projectId > 0 && !!slug,
  });
}

export function useWikiLinks(projectId: number) {
  return useQuery({
    queryKey: ['wiki-links', projectId],
    queryFn: () => apiClient.get<WikiLink[]>(API_URLS.wikiLinks, { params: { project: projectId } }).then(r => r.data),
    enabled: projectId > 0,
  });
}

// ─── Memberships ────────────────────────────────────────────────────
export function useMemberships(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['memberships', params],
    queryFn: () => apiClient.get<Membership[]>(API_URLS.memberships, { params }).then(r => r.data),
  });
}

// ─── Attachments ────────────────────────────────────────────────────
type AttachmentType = 'epic' | 'us' | 'issue' | 'task' | 'wiki';

const attachmentUrlMap: Record<AttachmentType, string> = {
  epic: API_URLS.attachmentsEpic,
  us: API_URLS.attachmentsUs,
  issue: API_URLS.attachmentsIssue,
  task: API_URLS.attachmentsTask,
  wiki: API_URLS.attachmentsWiki,
};

export function useAttachments(type: AttachmentType, objectId: number, projectId: number) {
  return useQuery({
    queryKey: ['attachments', type, objectId],
    queryFn: () => apiClient.get<Attachment[]>(attachmentUrlMap[type], {
      params: { object_id: objectId, project: projectId },
    }).then(r => r.data),
    enabled: objectId > 0,
  });
}

export function useCreateAttachment(type: AttachmentType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      apiClient.post<Attachment>(attachmentUrlMap[type], { body: formData }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attachments', type] }),
  });
}

// ─── History ────────────────────────────────────────────────────────
type HistoryType = 'epic' | 'us' | 'issue' | 'task' | 'wiki';

const historyUrlMap: Record<HistoryType, string> = {
  epic: API_URLS.historyEpic,
  us: API_URLS.historyUs,
  issue: API_URLS.historyIssue,
  task: API_URLS.historyTask,
  wiki: API_URLS.historyWiki,
};

export function useHistory(type: HistoryType, id: number) {
  return useQuery({
    queryKey: ['history', type, id],
    queryFn: () => apiClient.get<HistoryEntry[]>(`${historyUrlMap[type]}/${id}`).then(r => r.data),
    enabled: id > 0,
  });
}

// ─── Webhooks ───────────────────────────────────────────────────────
export function useWebhooks(projectId: number) {
  return useQuery({
    queryKey: ['webhooks', projectId],
    queryFn: () => apiClient.get<Webhook[]>(API_URLS.webhooks, { params: { project: projectId } }).then(r => r.data),
    enabled: projectId > 0,
  });
}

// ─── Notify Policies ────────────────────────────────────────────────
export function useNotifyPolicies() {
  return useQuery({
    queryKey: ['notify-policies'],
    queryFn: () => apiClient.get<NotifyPolicy[]>(API_URLS.notifyPolicies).then(r => r.data),
  });
}

// ─── Web Notifications ──────────────────────────────────────────────
export function useWebNotifications() {
  return useQuery({
    queryKey: ['web-notifications'],
    queryFn: () => apiClient.get<WebNotification[]>(API_URLS.webNotifications).then(r => r.data),
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => apiClient.post(`${API_URLS.webNotifications}/${id}/set-as-read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['web-notifications'] }),
  });
}

// ─── Search ─────────────────────────────────────────────────────────
export function useSearch(projectId: number, text: string) {
  return useQuery({
    queryKey: ['search', projectId, text],
    queryFn: () => apiClient.get<SearchResults>(API_URLS.search, {
      params: { project: projectId, text },
    }).then(r => r.data),
    enabled: projectId > 0 && text.length > 0,
  });
}

// ─── Timeline ───────────────────────────────────────────────────────
export function useProjectTimeline(projectId: number, page = 1) {
  return useQuery({
    queryKey: ['timeline-project', projectId, page],
    queryFn: () => apiClient.get<TimelineEntry[]>(API_URLS.timelineProject, {
      params: { project: projectId, page },
    }).then(r => r.data),
    enabled: projectId > 0,
  });
}

export function useUserTimeline(userId: number, page = 1) {
  return useQuery({
    queryKey: ['timeline-user', userId, page],
    queryFn: () => apiClient.get<TimelineEntry[]>(API_URLS.timelineUser, {
      params: { user: userId, page },
    }).then(r => r.data),
    enabled: userId > 0,
  });
}

// ─── Discover ───────────────────────────────────────────────────────
export function useDiscoverProjects(params?: Record<string, string | number | boolean | undefined>) {
  return useQuery({
    queryKey: ['discover-projects', params],
    queryFn: () => apiClient.get<DiscoverProject[]>(API_URLS.projects, {
      params: { discover_mode: true, ...params },
    }).then(r => r.data),
  });
}

// ─── Users ──────────────────────────────────────────────────────────
export function useCurrentUser() {
  return useQuery({
    queryKey: ['current-user'],
    queryFn: () => apiClient.get<User>(API_URLS.userMe).then(r => r.data),
  });
}

export function useUserByUsername(username: string | undefined) {
  return useQuery({
    queryKey: ['user-by-username', username],
    queryFn: () => apiClient.get<User>(API_URLS.byUsername, { params: { username: username! } }).then(r => r.data),
    enabled: !!username,
  });
}

export function useUserContacts(userId: number) {
  return useQuery({
    queryKey: ['user-contacts', userId],
    queryFn: () => apiClient.get<User[]>(API_URLS.userContacts(userId)).then(r => r.data),
    enabled: userId > 0,
  });
}

// ─── Roles ──────────────────────────────────────────────────────────
export function useRoles(projectId: number) {
  return useQuery({
    queryKey: ['roles', projectId],
    queryFn: () => apiClient.get(API_URLS.roles, { params: { project: projectId } }).then(r => r.data),
    enabled: projectId > 0,
  });
}

// ─── Swimlanes ──────────────────────────────────────────────────────
export function useSwimlanes(projectId: number) {
  return useQuery({
    queryKey: ['swimlanes', projectId],
    queryFn: () => apiClient.get(API_URLS.swimlanes, { params: { project: projectId } }).then(r => r.data),
    enabled: projectId > 0,
  });
}
