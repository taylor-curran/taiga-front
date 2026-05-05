import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Role,
  MembershipDetail,
  Webhook,
  WebhookLog,
  ProjectModule,
  CustomAttribute,
  ProjectExportStatus,
  ValueItem,
  DueDateEntry,
  Swimlane,
} from '@/types/admin';

// ─── Roles ───────────────────────────────────────────────────────────────────

export async function fetchRoles(projectId: number): Promise<Role[]> {
  const res = await api.get<Role[]>('roles', { params: { project: projectId } });
  return res.data;
}

export function useRoles(projectId: number | undefined) {
  return useQuery({
    queryKey: ['roles', projectId],
    queryFn: () => fetchRoles(projectId as number),
    enabled: !!projectId,
  });
}

export function useCreateRole(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Role>) =>
      api.post<Role>('roles', { ...data, project: projectId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['roles', projectId] }),
  });
}

export function useUpdateRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Role> & { id: number }) =>
      api.patch<Role>(`roles/${id}`, data).then((r) => r.data),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['roles', vars.project] }),
  });
}

export function useDeleteRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, moveTo }: { id: number; moveTo: number; projectId: number }) =>
      api.delete(`roles/${id}`, { params: { moveTo } }),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ['roles', vars.projectId] }),
  });
}

// ─── Memberships ─────────────────────────────────────────────────────────────

export async function fetchMemberships(projectId: number): Promise<MembershipDetail[]> {
  const res = await api.get<MembershipDetail[]>('memberships', {
    params: { project: projectId },
  });
  return res.data;
}

export function useMemberships(projectId: number | undefined) {
  return useQuery({
    queryKey: ['memberships', projectId],
    queryFn: () => fetchMemberships(projectId as number),
    enabled: !!projectId,
  });
}

export function useBulkCreateMemberships(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { project_id: number; bulk_memberships: { role_id: number; username: string }[]; invitation_extra_text?: string }) =>
      api.post('memberships/bulk_create', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memberships', projectId] }),
  });
}

export function useUpdateMembership(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; role: number }) =>
      api.patch(`memberships/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memberships', projectId] }),
  });
}

export function useDeleteMembership(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`memberships/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['memberships', projectId] }),
  });
}

export function useResendInvitation() {
  return useMutation({
    mutationFn: (id: number) => api.post(`memberships/${id}/resend_invitation`),
  });
}

// ─── Webhooks ────────────────────────────────────────────────────────────────

export function useWebhooks(projectId: number | undefined) {
  return useQuery({
    queryKey: ['webhooks', projectId],
    queryFn: () => api.get<Webhook[]>('webhooks', { params: { project: projectId } }).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateWebhook(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Webhook>) =>
      api.post<Webhook>('webhooks', { ...data, project: projectId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks', projectId] }),
  });
}

export function useUpdateWebhook(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<Webhook> & { id: number }) =>
      api.patch<Webhook>(`webhooks/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks', projectId] }),
  });
}

export function useDeleteWebhook(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`webhooks/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks', projectId] }),
  });
}

export function useTestWebhook() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`webhooks/${id}/test`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['webhooks'] }),
  });
}

export function useWebhookLogs(webhookId: number | undefined) {
  return useQuery({
    queryKey: ['webhooklogs', webhookId],
    queryFn: () => api.get<WebhookLog[]>('webhooklogs', { params: { webhook: webhookId } }).then((r) => r.data),
    enabled: !!webhookId,
  });
}

// ─── Project Modules (VCS integrations) ──────────────────────────────────────

export function useProjectModules(projectId: number | undefined) {
  return useQuery({
    queryKey: ['project-modules', projectId],
    queryFn: () => api.get<ProjectModule>(`projects/${projectId}/modules`).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useUpdateProjectModule(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ProjectModule>) =>
      api.patch(`projects/${projectId}/modules`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-modules', projectId] }),
  });
}

// ─── Custom Attributes ───────────────────────────────────────────────────────

type CaEntityType = 'epic' | 'userstory' | 'task' | 'issue';

export function useCustomAttributes(projectId: number | undefined, entity: CaEntityType) {
  return useQuery({
    queryKey: ['custom-attributes', entity, projectId],
    queryFn: () =>
      api.get<CustomAttribute[]>(`${entity}-custom-attributes`, { params: { project: projectId } }).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateCustomAttribute(projectId: number, entity: CaEntityType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<CustomAttribute>) =>
      api.post<CustomAttribute>(`${entity}-custom-attributes`, { ...data, project: projectId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-attributes', entity, projectId] }),
  });
}

export function useUpdateCustomAttribute(entity: CaEntityType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<CustomAttribute> & { id: number }) =>
      api.patch<CustomAttribute>(`${entity}-custom-attributes/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-attributes', entity] }),
  });
}

export function useDeleteCustomAttribute(entity: CaEntityType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`${entity}-custom-attributes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-attributes', entity] }),
  });
}

// ─── Project Export ──────────────────────────────────────────────────────────

export function useExportProject() {
  return useMutation({
    mutationFn: (projectId: number) =>
      api.post<ProjectExportStatus>(`exporter/${projectId}`).then((r) => r.data),
  });
}

// ─── CSV Reports ─────────────────────────────────────────────────────────────

export function useCsvReportRegenerate(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (type: string) =>
      api.post(`projects/${projectId}/regenerate_${type}_csv_uuid`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project'] }),
  });
}

// ─── Project Values (status, points, priorities, severities, types) ──────────

type ValueEndpoint =
  | 'epic-statuses'
  | 'userstory-statuses'
  | 'task-statuses'
  | 'issue-statuses'
  | 'points'
  | 'priorities'
  | 'severities'
  | 'issue-types';

export function useProjectValues(projectId: number | undefined, endpoint: ValueEndpoint) {
  return useQuery({
    queryKey: ['project-values', endpoint, projectId],
    queryFn: () =>
      api.get<ValueItem[]>(endpoint, { params: { project: projectId } }).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateProjectValue(projectId: number, endpoint: ValueEndpoint) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<ValueItem>) =>
      api.post<ValueItem>(endpoint, { ...data, project: projectId }).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-values', endpoint, projectId] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useUpdateProjectValue(endpoint: ValueEndpoint) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: Partial<ValueItem> & { id: number }) =>
      api.patch<ValueItem>(`${endpoint}/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-values', endpoint] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useDeleteProjectValue(endpoint: ValueEndpoint) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, moveTo }: { id: number; moveTo?: number }) =>
      api.delete(`${endpoint}/${id}`, { params: moveTo ? { moveTo } : undefined }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-values', endpoint] });
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

export function useBulkUpdateOrder(endpoint: ValueEndpoint) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { project: number; bulk_orders: [number, number][] }) =>
      api.post(`${endpoint}/bulk_update_order`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project-values', endpoint] });
    },
  });
}

// ─── Due Dates ───────────────────────────────────────────────────────────────

type DueDateEndpoint = 'userstory-due-dates' | 'task-due-dates' | 'issue-due-dates';

export function useDueDates(projectId: number | undefined, endpoint: DueDateEndpoint) {
  return useQuery({
    queryKey: ['due-dates', endpoint, projectId],
    queryFn: () => api.get<DueDateEntry[]>(endpoint, { params: { project: projectId } }).then((r) => r.data),
    enabled: !!projectId,
  });
}

// ─── Swimlanes ───────────────────────────────────────────────────────────────

export function useSwimlanes(projectId: number | undefined) {
  return useQuery({
    queryKey: ['swimlanes', projectId],
    queryFn: () => api.get<Swimlane[]>('swimlanes', { params: { project: projectId } }).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateSwimlane(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      api.post<Swimlane>('swimlanes', { name, project: projectId }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimlanes', projectId] }),
  });
}

export function useDeleteSwimlane(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`swimlanes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['swimlanes', projectId] }),
  });
}

// ─── Project PATCH helper ────────────────────────────────────────────────────

export function useUpdateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`projects/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['project'] });
    },
  });
}

// ─── Project logo upload ─────────────────────────────────────────────────────

export function useUploadProjectLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => {
      const fd = new FormData();
      fd.append('logo', file);
      return api.post(`projects/${id}/change_logo`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project'] }),
  });
}

export function useRemoveProjectLogo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.post(`projects/${id}/remove_logo`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project'] }),
  });
}

// ─── Tags (project-level) ────────────────────────────────────────────────────

export function useProjectTags(projectId: number | undefined) {
  return useQuery({
    queryKey: ['project-tags', projectId],
    queryFn: () =>
      api.get<{ name: string; color: string | null }[]>(`projects/${projectId}/tags`).then((r) => r.data),
    enabled: !!projectId,
  });
}

export function useCreateTag(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { tag: string; color: string | null }) =>
      api.post(`projects/${projectId}/create_tag`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-tags', projectId] }),
  });
}

export function useEditTag(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { from_tag: string; to_tag?: string; color?: string | null }) =>
      api.post(`projects/${projectId}/edit_tag`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-tags', projectId] }),
  });
}

export function useDeleteTag(projectId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tag: string) => api.post(`projects/${projectId}/delete_tag`, { tag }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['project-tags', projectId] }),
  });
}
