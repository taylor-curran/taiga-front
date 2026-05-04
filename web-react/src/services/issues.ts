import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Issue, IssueFiltersData, Attachment, HistoryEntry, CustomAttribute } from '@/types/api';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
export interface IssueListFilters {
  project: number;
  status?: string;
  priority?: string;
  severity?: string;
  type?: string;
  assigned_to?: string;
  owner?: string;
  role?: string;
  tags?: string;
  q?: string;
  order_by?: string;
  page?: number;
  exclude_status?: string;
  exclude_priority?: string;
  exclude_severity?: string;
  exclude_type?: string;
  exclude_assigned_to?: string;
  exclude_owner?: string;
  exclude_role?: string;
  exclude_tags?: string;
}

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------
export async function fetchIssues(
  filters: IssueListFilters,
): Promise<{ data: Issue[]; count: number }> {
  const res = await api.get<Issue[]>('issues', {
    params: filters,
    headers: { 'x-disable-pagination': undefined },
  });
  const count = Number(res.headers['x-pagination-count'] || res.data.length);
  return { data: res.data, count };
}

export async function fetchIssueByRef(projectId: number, ref: number): Promise<Issue> {
  const res = await api.get<Issue>('issues/by_ref', {
    params: { project: projectId, ref },
  });
  return res.data;
}

export async function fetchIssueFiltersData(
  params: Record<string, unknown>,
): Promise<IssueFiltersData> {
  const res = await api.get<IssueFiltersData>('issues/filters_data', { params });
  return res.data;
}

export async function fetchIssueAttachments(
  projectId: number,
  issueId: number,
): Promise<Attachment[]> {
  const res = await api.get<Attachment[]>('issues/attachments', {
    params: { project: projectId, object_id: issueId },
  });
  return res.data;
}

export async function fetchIssueHistory(issueId: number): Promise<HistoryEntry[]> {
  const res = await api.get<HistoryEntry[]>(`history/issue/${issueId}`);
  return res.data;
}

export async function fetchIssueCustomAttributes(
  projectId: number,
): Promise<CustomAttribute[]> {
  const res = await api.get<CustomAttribute[]>('issue-custom-attributes', {
    params: { project: projectId },
  });
  return res.data;
}

export async function fetchIssueCustomAttributeValues(
  issueId: number,
): Promise<Record<string, unknown>> {
  const res = await api.get<{ attributes_values: Record<string, unknown> }>(
    `issues/custom-attributes-values/${issueId}`,
  );
  return res.data.attributes_values ?? {};
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------
export async function createIssue(
  data: Partial<Issue> & { project: number; subject: string },
): Promise<Issue> {
  const res = await api.post<Issue>('issues', data);
  return res.data;
}

export async function patchIssue(
  issueId: number,
  data: Partial<Issue>,
): Promise<Issue> {
  const res = await api.patch<Issue>(`issues/${issueId}`, data);
  return res.data;
}

export async function deleteIssue(issueId: number): Promise<void> {
  await api.delete(`issues/${issueId}`);
}

export async function bulkUpdateIssues(
  projectId: number,
  bulkIssues: { issue_id: number; order?: number }[],
  data: Record<string, unknown>,
): Promise<void> {
  await api.post('issues/bulk_create', { project_id: projectId, bulk_issues: bulkIssues, ...data });
}

export async function upvoteIssue(issueId: number): Promise<void> {
  await api.post(`issues/${issueId}/upvote`);
}

export async function downvoteIssue(issueId: number): Promise<void> {
  await api.post(`issues/${issueId}/downvote`);
}

export async function watchIssue(issueId: number): Promise<void> {
  await api.post(`issues/${issueId}/watch`);
}

export async function unwatchIssue(issueId: number): Promise<void> {
  await api.post(`issues/${issueId}/unwatch`);
}

export async function promoteIssueToUs(
  issueId: number,
  projectId: number,
): Promise<number> {
  const res = await api.post<{ id: number } | number>(`issues/${issueId}/promote_to_user_story`, {
    project_id: projectId,
  });
  if (typeof res.data === 'number') return res.data;
  return (res.data as { id: number }).id;
}

export async function uploadIssueAttachment(
  projectId: number,
  issueId: number,
  file: File,
): Promise<Attachment> {
  const form = new FormData();
  form.append('project', String(projectId));
  form.append('object_id', String(issueId));
  form.append('attached_file', file);
  const res = await api.post<Attachment>('issues/attachments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteIssueAttachment(attachmentId: number): Promise<void> {
  await api.delete(`issues/attachments/${attachmentId}`);
}

export async function addIssueComment(
  issueId: number,
  comment: string,
  version: number,
): Promise<Issue> {
  const res = await api.patch<Issue>(`issues/${issueId}`, { comment, version });
  return res.data;
}

export function exportIssuesToCsv(projectId: number): string {
  const baseUrl = api.defaults.baseURL || '/api/v1/';
  return `${baseUrl}issues/csv?uuid=${projectId}`;
}

export async function fetchCsvExportUrl(projectId: number): Promise<string> {
  const res = await api.get<{ url: string }>(`issues/csv`, {
    params: { project: projectId },
  });
  return res.data.url;
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------
export function useIssues(filters: IssueListFilters | undefined) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: () => fetchIssues(filters as IssueListFilters),
    enabled: !!filters,
  });
}

export function useIssueByRef(projectId: number | undefined, ref: number | undefined) {
  return useQuery({
    queryKey: ['issue', 'by_ref', projectId, ref],
    queryFn: () => fetchIssueByRef(projectId as number, ref as number),
    enabled: !!projectId && !!ref,
  });
}

export function useIssueFiltersData(params: Record<string, unknown> | undefined) {
  return useQuery({
    queryKey: ['issues', 'filters_data', params],
    queryFn: () => fetchIssueFiltersData(params as Record<string, unknown>),
    enabled: !!params,
  });
}

export function useIssueAttachments(projectId: number | undefined, issueId: number | undefined) {
  return useQuery({
    queryKey: ['issue', 'attachments', projectId, issueId],
    queryFn: () => fetchIssueAttachments(projectId as number, issueId as number),
    enabled: !!projectId && !!issueId,
  });
}

export function useIssueHistory(issueId: number | undefined) {
  return useQuery({
    queryKey: ['issue', 'history', issueId],
    queryFn: () => fetchIssueHistory(issueId as number),
    enabled: !!issueId,
  });
}

export function useIssueCustomAttributes(projectId: number | undefined) {
  return useQuery({
    queryKey: ['issue', 'custom-attributes', projectId],
    queryFn: () => fetchIssueCustomAttributes(projectId as number),
    enabled: !!projectId,
  });
}

export function useIssueCustomAttributeValues(issueId: number | undefined) {
  return useQuery({
    queryKey: ['issue', 'custom-attributes-values', issueId],
    queryFn: () => fetchIssueCustomAttributeValues(issueId as number),
    enabled: !!issueId,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createIssue,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

export function usePatchIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, data }: { issueId: number; data: Partial<Issue> }) =>
      patchIssue(issueId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue'] });
    },
  });
}

export function useDeleteIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteIssue,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

export function usePromoteIssueToUs() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ issueId, projectId }: { issueId: number; projectId: number }) =>
      promoteIssueToUs(issueId, projectId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['issues'] });
      qc.invalidateQueries({ queryKey: ['issue'] });
    },
  });
}
