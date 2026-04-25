import api from './client';
import type {
  User, Project, ProjectListEntry, Milestone, UserStory,
  Task, Issue, Epic, WikiPage, WikiLink, Attachment,
  History, SearchResults, TimelineEntry, Membership, WebNotification,
} from '../types';

// Auth
export const auth = {
  login: (username: string, password: string) =>
    api.post<User>('/auth', { type: 'normal', username, password }),
  register: (data: { username: string; password: string; email: string; full_name: string; accepted_terms: boolean }) =>
    api.post<User>('/auth/register', { ...data, type: 'public' }),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refresh: refreshToken }),
};

// Users
export const users = {
  me: () => api.get<User>('/users/me'),
  getById: (id: number) => api.get<User>(`/users/${id}`),
  getByUsername: (username: string) => api.get<User>('/users/by_username', { params: { username } }),
  getContacts: (id: number) => api.get(`/users/${id}/contacts`),
  getStats: (id: number) => api.get(`/users/${id}/stats`),
  getLiked: (id: number, params?: Record<string, unknown>) => api.get(`/users/${id}/liked`, { params }),
  getVoted: (id: number, params?: Record<string, unknown>) => api.get(`/users/${id}/voted`, { params }),
  getWatched: (id: number, params?: Record<string, unknown>) => api.get(`/users/${id}/watched`, { params }),
  update: (id: number, data: Partial<User>) => api.patch<User>(`/users/${id}`, data),
  changePassword: (data: { current_password: string; password: string }) =>
    api.post('/users/change_password', data),
  passwordRecovery: (email: string) => api.post('/users/password_recovery', { username: email }),
  changePasswordFromRecovery: (data: { token: string; password: string }) =>
    api.post('/users/change_password_from_recovery', data),
  changeEmail: (data: { email_token: string }) => api.post('/users/change_email', data),
  cancelAccount: (data: { cancel_token: string }) => api.post('/users/cancel', data),
};

// Projects
export const projects = {
  list: (params?: Record<string, unknown>) => api.get<ProjectListEntry[]>('/projects', { params }),
  getBySlug: (slug: string) => api.get<Project>('/projects/by_slug', { params: { slug } }),
  getById: (id: number) => api.get<Project>(`/projects/${id}`),
  create: (data: Record<string, unknown>) => api.post<Project>('/projects', data),
  update: (id: number, data: Partial<Project>) => api.patch<Project>(`/projects/${id}`, data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  getModules: (id: number) => api.get(`/projects/${id}/modules`),
  updateModules: (id: number, data: Record<string, unknown>) => api.patch(`/projects/${id}/modules`, data),
  getStats: (id: number) => api.get(`/projects/${id}/stats`),
  getIssueStats: (id: number) => api.get(`/projects/${id}/issues_stats`),
  getMemberStats: (id: number) => api.get(`/projects/${id}/member_stats`),
  like: (id: number) => api.post(`/projects/${id}/like`),
  unlike: (id: number) => api.post(`/projects/${id}/unlike`),
  watch: (id: number) => api.post(`/projects/${id}/watch`),
  unwatch: (id: number) => api.post(`/projects/${id}/unwatch`),
  duplicate: (id: number, data: Record<string, unknown>) => api.post(`/projects/${id}/duplicate`, data),
  bulkUpdateOrder: (data: Array<{ project_id: number; order: number }>) =>
    api.post('/projects/bulk_update_order', data),
  getTimeline: (id: number, params?: Record<string, unknown>) => api.get<TimelineEntry[]>(`/timeline/project/${id}`, { params }),
  transferRequest: (id: number) => api.post(`/projects/${id}/transfer_request`),
  transferStart: (id: number, userId: number) => api.post(`/projects/${id}/transfer_start`, { user: userId }),
  transferAccept: (id: number, token: string, reason?: string) => api.post(`/projects/${id}/transfer_accept`, { token, reason }),
  transferReject: (id: number, token: string, reason?: string) => api.post(`/projects/${id}/transfer_reject`, { token, reason }),
  transferValidateToken: (id: number, token: string) => api.post(`/projects/${id}/transfer_validate_token`, { token }),
};

// Resolver
export const resolver = {
  resolve: (params: { project: string; us?: number; task?: number; issue?: number; milestone?: string; wikipage?: string; ref?: number; epic?: number }) =>
    api.get('/resolver', { params }),
};

// Milestones
export const milestones = {
  list: (projectId: number, params?: Record<string, unknown>) =>
    api.get<Milestone[]>('/milestones', { params: { project: projectId, ...params } }),
  getById: (id: number) => api.get<Milestone>(`/milestones/${id}`),
  create: (data: Record<string, unknown>) => api.post<Milestone>('/milestones', data),
  update: (id: number, data: Partial<Milestone>) => api.patch<Milestone>(`/milestones/${id}`, data),
  delete: (id: number) => api.delete(`/milestones/${id}`),
  getStats: (id: number) => api.get(`/milestones/${id}/stats`),
};

// User Stories
export const userstories = {
  list: (params?: Record<string, unknown>) => api.get<UserStory[]>('/userstories', { params }),
  getById: (id: number) => api.get<UserStory>(`/userstories/${id}`),
  create: (data: Record<string, unknown>) => api.post<UserStory>('/userstories', data),
  update: (id: number, data: Partial<UserStory>, version?: number) => {
    const headers = version ? { 'x-disable-pagination': 'True' } : {};
    return api.patch<UserStory>(`/userstories/${id}`, data, { headers });
  },
  delete: (id: number) => api.delete(`/userstories/${id}`),
  getFiltersData: (projectId: number) => api.get('/userstories/filters_data', { params: { project: projectId } }),
  bulkCreate: (projectId: number, stories: string) =>
    api.post('/userstories/bulk_create', { project_id: projectId, bulk_stories: stories }),
  bulkUpdateBacklogOrder: (projectId: number, data: Array<{ us_id: number; order: number }>) =>
    api.post('/userstories/bulk_update_backlog_order', { project_id: projectId, bulk_stories: data }),
  bulkUpdateKanbanOrder: (projectId: number, data: Array<{ us_id: number; order: number }>) =>
    api.post('/userstories/bulk_update_kanban_order', { project_id: projectId, bulk_stories: data }),
  bulkUpdateSprintOrder: (projectId: number, milestoneId: number, data: Array<{ us_id: number; order: number }>) =>
    api.post('/userstories/bulk_update_sprint_order', { project_id: projectId, milestone_id: milestoneId, bulk_stories: data }),
  upvote: (id: number) => api.post(`/userstories/${id}/upvote`),
  downvote: (id: number) => api.post(`/userstories/${id}/downvote`),
  watch: (id: number) => api.post(`/userstories/${id}/watch`),
  unwatch: (id: number) => api.post(`/userstories/${id}/unwatch`),
  attachments: (params: { project: number; object_id: number }) =>
    api.get<Attachment[]>('/userstories/attachments', { params }),
  createAttachment: (data: FormData) =>
    api.post<Attachment>('/userstories/attachments', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAttachment: (id: number) => api.delete(`/userstories/attachments/${id}`),
  history: (id: number) => api.get<History[]>(`/history/userstory/${id}`),
};

// Tasks
export const tasks = {
  list: (params?: Record<string, unknown>) => api.get<Task[]>('/tasks', { params }),
  getById: (id: number) => api.get<Task>(`/tasks/${id}`),
  create: (data: Record<string, unknown>) => api.post<Task>('/tasks', data),
  update: (id: number, data: Partial<Task>) => api.patch<Task>(`/tasks/${id}`, data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  getFiltersData: (projectId: number, params?: Record<string, unknown>) =>
    api.get('/tasks/filters_data', { params: { project: projectId, ...params } }),
  bulkCreate: (projectId: number, milestoneId: number, usId: number | null, tasksData: string) =>
    api.post('/tasks/bulk_create', { project_id: projectId, milestone_id: milestoneId, us_id: usId, bulk_tasks: tasksData }),
  upvote: (id: number) => api.post(`/tasks/${id}/upvote`),
  downvote: (id: number) => api.post(`/tasks/${id}/downvote`),
  watch: (id: number) => api.post(`/tasks/${id}/watch`),
  unwatch: (id: number) => api.post(`/tasks/${id}/unwatch`),
  attachments: (params: { project: number; object_id: number }) =>
    api.get<Attachment[]>('/tasks/attachments', { params }),
  createAttachment: (data: FormData) =>
    api.post<Attachment>('/tasks/attachments', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAttachment: (id: number) => api.delete(`/tasks/attachments/${id}`),
  history: (id: number) => api.get<History[]>(`/history/task/${id}`),
};

// Issues
export const issues = {
  list: (params?: Record<string, unknown>) => api.get<Issue[]>('/issues', { params }),
  getById: (id: number) => api.get<Issue>(`/issues/${id}`),
  create: (data: Record<string, unknown>) => api.post<Issue>('/issues', data),
  update: (id: number, data: Partial<Issue>) => api.patch<Issue>(`/issues/${id}`, data),
  delete: (id: number) => api.delete(`/issues/${id}`),
  getFiltersData: (projectId: number) => api.get('/issues/filters_data', { params: { project: projectId } }),
  bulkCreate: (projectId: number, issuesData: string) =>
    api.post('/issues/bulk_create', { project_id: projectId, bulk_issues: issuesData }),
  upvote: (id: number) => api.post(`/issues/${id}/upvote`),
  downvote: (id: number) => api.post(`/issues/${id}/downvote`),
  watch: (id: number) => api.post(`/issues/${id}/watch`),
  unwatch: (id: number) => api.post(`/issues/${id}/unwatch`),
  attachments: (params: { project: number; object_id: number }) =>
    api.get<Attachment[]>('/issues/attachments', { params }),
  createAttachment: (data: FormData) =>
    api.post<Attachment>('/issues/attachments', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAttachment: (id: number) => api.delete(`/issues/attachments/${id}`),
  history: (id: number) => api.get<History[]>(`/history/issue/${id}`),
};

// Epics
export const epics = {
  list: (params?: Record<string, unknown>) => api.get<Epic[]>('/epics', { params }),
  getById: (id: number) => api.get<Epic>(`/epics/${id}`),
  create: (data: Record<string, unknown>) => api.post<Epic>('/epics', data),
  update: (id: number, data: Partial<Epic>) => api.patch<Epic>(`/epics/${id}`, data),
  delete: (id: number) => api.delete(`/epics/${id}`),
  getRelatedUserstories: (epicId: number) => api.get(`/epics/${epicId}/related_userstories`),
  createRelatedUserstory: (epicId: number, data: { epic: number; user_story: number }) =>
    api.post(`/epics/${epicId}/related_userstories`, data),
  deleteRelatedUserstory: (epicId: number, usId: number) =>
    api.delete(`/epics/${epicId}/related_userstories/${usId}`),
  upvote: (id: number) => api.post(`/epics/${id}/upvote`),
  downvote: (id: number) => api.post(`/epics/${id}/downvote`),
  watch: (id: number) => api.post(`/epics/${id}/watch`),
  unwatch: (id: number) => api.post(`/epics/${id}/unwatch`),
  attachments: (params: { project: number; object_id: number }) =>
    api.get<Attachment[]>('/epics/attachments', { params }),
  createAttachment: (data: FormData) =>
    api.post<Attachment>('/epics/attachments', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAttachment: (id: number) => api.delete(`/epics/attachments/${id}`),
  history: (id: number) => api.get<History[]>(`/history/epic/${id}`),
};

// Wiki
export const wiki = {
  list: (projectId: number) => api.get<WikiPage[]>('/wiki', { params: { project: projectId } }),
  getBySlug: (projectId: number, slug: string) =>
    api.get<WikiPage[]>('/wiki', { params: { project: projectId, slug } }),
  getById: (id: number) => api.get<WikiPage>(`/wiki/${id}`),
  create: (data: Record<string, unknown>) => api.post<WikiPage>('/wiki', data),
  update: (id: number, data: Partial<WikiPage>) => api.patch<WikiPage>(`/wiki/${id}`, data),
  delete: (id: number) => api.delete(`/wiki/${id}`),
  listLinks: (projectId: number) => api.get<WikiLink[]>('/wiki-links', { params: { project: projectId } }),
  createLink: (data: { project: number; title: string; href: string; order: number }) =>
    api.post<WikiLink>('/wiki-links', data),
  deleteLink: (id: number) => api.delete(`/wiki-links/${id}`),
  attachments: (params: { project: number; object_id: number }) =>
    api.get<Attachment[]>('/wiki/attachments', { params }),
  createAttachment: (data: FormData) =>
    api.post<Attachment>('/wiki/attachments', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deleteAttachment: (id: number) => api.delete(`/wiki/attachments/${id}`),
  history: (id: number) => api.get<History[]>(`/history/wiki/${id}`),
};

// Memberships
export const memberships = {
  list: (projectId: number) => api.get<Membership[]>('/memberships', { params: { project: projectId } }),
  create: (data: Record<string, unknown>) => api.post<Membership>('/memberships', data),
  bulkCreate: (projectId: number, data: Array<{ role_id: number; username: string }>) =>
    api.post('/memberships/bulk_create', { project_id: projectId, bulk_memberships: data }),
  update: (id: number, data: Partial<Membership>) => api.patch<Membership>(`/memberships/${id}`, data),
  delete: (id: number) => api.delete(`/memberships/${id}`),
  resendInvitation: (id: number) => api.post(`/memberships/${id}/resend_invitation`),
};

// Roles
export const roles = {
  list: (projectId: number) => api.get('/roles', { params: { project: projectId } }),
  getById: (id: number) => api.get(`/roles/${id}`),
  update: (id: number, data: Record<string, unknown>) => api.patch(`/roles/${id}`, data),
  create: (data: Record<string, unknown>) => api.post('/roles', data),
  delete: (id: number) => api.delete(`/roles/${id}`),
};

// Search
export const search = {
  do: (projectId: number, text: string) =>
    api.get<SearchResults>('/search', { params: { project: projectId, text } }),
};

// Notifications
export const notifications = {
  list: (params?: Record<string, unknown>) => api.get<WebNotification[]>('/web-notifications', { params }),
  setAsRead: () => api.post('/web-notifications/set-as-read'),
  setOneAsRead: (id: number) => api.post(`/web-notifications/${id}/set-as-read`),
};

// Notify policies
export const notifyPolicies = {
  list: () => api.get('/notify-policies'),
  update: (id: number, data: Record<string, unknown>) => api.patch(`/notify-policies/${id}`, data),
};

// Status resources for admin
export const statuses = {
  userstoryStatuses: (projectId: number) => api.get('/userstory-statuses', { params: { project: projectId } }),
  taskStatuses: (projectId: number) => api.get('/task-statuses', { params: { project: projectId } }),
  issueStatuses: (projectId: number) => api.get('/issue-statuses', { params: { project: projectId } }),
  epicStatuses: (projectId: number) => api.get('/epic-statuses', { params: { project: projectId } }),
  issueTypes: (projectId: number) => api.get('/issue-types', { params: { project: projectId } }),
  priorities: (projectId: number) => api.get('/priorities', { params: { project: projectId } }),
  severities: (projectId: number) => api.get('/severities', { params: { project: projectId } }),
  points: (projectId: number) => api.get('/points', { params: { project: projectId } }),
};

// Timeline
export const timeline = {
  getProjectTimeline: (projectId: number, params?: Record<string, unknown>) =>
    api.get<TimelineEntry[]>(`/timeline/project/${projectId}`, { params }),
  getUserTimeline: (userId: number, params?: Record<string, unknown>) =>
    api.get<TimelineEntry[]>(`/timeline/user/${userId}`, { params }),
  getProfileTimeline: (userId: number, params?: Record<string, unknown>) =>
    api.get<TimelineEntry[]>(`/timeline/profile/${userId}`, { params }),
};

// Webhooks (admin)
export const webhooks = {
  list: (projectId: number) => api.get('/webhooks', { params: { project: projectId } }),
  create: (data: Record<string, unknown>) => api.post('/webhooks', data),
  update: (id: number, data: Record<string, unknown>) => api.patch(`/webhooks/${id}`, data),
  delete: (id: number) => api.delete(`/webhooks/${id}`),
  test: (id: number) => api.post(`/webhooks/${id}/test`),
  logs: (webhookId: number) => api.get('/webhooklogs', { params: { webhook: webhookId } }),
};

// Custom attributes
export const customAttributes = {
  userstory: (projectId: number) => api.get('/userstory-custom-attributes', { params: { project: projectId } }),
  task: (projectId: number) => api.get('/task-custom-attributes', { params: { project: projectId } }),
  issue: (projectId: number) => api.get('/issue-custom-attributes', { params: { project: projectId } }),
  epic: (projectId: number) => api.get('/epic-custom-attributes', { params: { project: projectId } }),
  userstoryValues: (userstoryId: number) => api.get(`/userstories/custom-attributes-values/${userstoryId}`),
  taskValues: (taskId: number) => api.get(`/tasks/custom-attributes-values/${taskId}`),
  issueValues: (issueId: number) => api.get(`/issues/custom-attributes-values/${issueId}`),
  epicValues: (epicId: number) => api.get(`/epics/custom-attributes-values/${epicId}`),
};
