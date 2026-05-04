import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { WikiPage, WikiLink, WikiAttachment, HistoryEntry } from '@/types/api';

// ---------------------------------------------------------------------------
// Wiki Pages
// ---------------------------------------------------------------------------

export async function fetchWikiPages(projectId: number): Promise<WikiPage[]> {
  const res = await api.get<WikiPage[]>('wiki', { params: { project: projectId } });
  return res.data;
}

export async function fetchWikiPageBySlug(
  projectId: number,
  slug: string,
): Promise<WikiPage | null> {
  try {
    const res = await api.get<WikiPage>('wiki/by_slug', {
      params: { project: projectId, slug },
    });
    return res.data;
  } catch {
    return null;
  }
}

export async function fetchWikiPageById(id: number): Promise<WikiPage> {
  const res = await api.get<WikiPage>(`wiki/${id}`);
  return res.data;
}

export async function createWikiPage(
  data: { project: number; slug: string; content: string },
): Promise<WikiPage> {
  const res = await api.post<WikiPage>('wiki', data);
  return res.data;
}

export async function updateWikiPage(
  id: number,
  data: { content?: string; version?: number },
): Promise<WikiPage> {
  const res = await api.patch<WikiPage>(`wiki/${id}`, data);
  return res.data;
}

export async function deleteWikiPage(id: number): Promise<void> {
  await api.delete(`wiki/${id}`);
}

// ---------------------------------------------------------------------------
// Wiki Links
// ---------------------------------------------------------------------------

export async function fetchWikiLinks(projectId: number): Promise<WikiLink[]> {
  const res = await api.get<WikiLink[]>('wiki-links', { params: { project: projectId } });
  return res.data;
}

export async function createWikiLink(
  data: { project: number; title: string; href?: string; order?: number },
): Promise<WikiLink> {
  const payload = { ...data, href: data.href ?? data.title };
  const res = await api.post<WikiLink>('wiki-links', payload);
  return res.data;
}

export async function deleteWikiLink(id: number): Promise<void> {
  await api.delete(`wiki-links/${id}`);
}

export async function updateWikiLinkOrder(
  id: number,
  order: number,
): Promise<WikiLink> {
  const res = await api.patch<WikiLink>(`wiki-links/${id}`, { order });
  return res.data;
}

// ---------------------------------------------------------------------------
// History
// ---------------------------------------------------------------------------

export async function fetchWikiHistory(
  wikiId: number,
): Promise<HistoryEntry[]> {
  const res = await api.get<HistoryEntry[]>(`history/wiki/${wikiId}`);
  return res.data;
}

// ---------------------------------------------------------------------------
// Attachments
// ---------------------------------------------------------------------------

export async function fetchWikiAttachments(
  projectId: number,
  objectId: number,
): Promise<WikiAttachment[]> {
  const res = await api.get<WikiAttachment[]>('wiki/attachments', {
    params: { project: projectId, object_id: objectId },
  });
  return res.data;
}

export async function uploadWikiAttachment(
  projectId: number,
  objectId: number,
  file: File,
): Promise<WikiAttachment> {
  const form = new FormData();
  form.append('project', String(projectId));
  form.append('object_id', String(objectId));
  form.append('attached_file', file);
  const res = await api.post<WikiAttachment>('wiki/attachments', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteWikiAttachment(id: number): Promise<void> {
  await api.delete(`wiki/attachments/${id}`);
}

// ---------------------------------------------------------------------------
// React Query hooks
// ---------------------------------------------------------------------------

export function useWikiPages(projectId: number | undefined) {
  return useQuery({
    queryKey: ['wiki', 'pages', projectId],
    queryFn: () => fetchWikiPages(projectId as number),
    enabled: !!projectId,
  });
}

export function useWikiPageBySlug(
  projectId: number | undefined,
  slug: string | undefined,
) {
  return useQuery({
    queryKey: ['wiki', 'by_slug', projectId, slug],
    queryFn: () => fetchWikiPageBySlug(projectId as number, slug as string),
    enabled: !!projectId && !!slug,
  });
}

export function useWikiLinks(projectId: number | undefined) {
  return useQuery({
    queryKey: ['wiki', 'links', projectId],
    queryFn: () => fetchWikiLinks(projectId as number),
    enabled: !!projectId,
  });
}

export function useWikiHistory(wikiId: number | undefined) {
  return useQuery({
    queryKey: ['wiki', 'history', wikiId],
    queryFn: () => fetchWikiHistory(wikiId as number),
    enabled: !!wikiId,
  });
}

export function useWikiAttachments(
  projectId: number | undefined,
  objectId: number | undefined,
) {
  return useQuery({
    queryKey: ['wiki', 'attachments', projectId, objectId],
    queryFn: () => fetchWikiAttachments(projectId as number, objectId as number),
    enabled: !!projectId && !!objectId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useCreateWikiPage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWikiPage,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['wiki', 'pages', vars.project] });
      qc.invalidateQueries({ queryKey: ['wiki', 'by_slug', vars.project] });
    },
  });
}

export function useUpdateWikiPage(projectId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: number; content?: string; version?: number }) =>
      updateWikiPage(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['wiki', 'pages', projectId] });
      qc.invalidateQueries({ queryKey: ['wiki', 'by_slug', projectId] });
      qc.invalidateQueries({ queryKey: ['wiki', 'history', vars.id] });
    },
  });
}

export function useDeleteWikiPage(projectId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWikiPage,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki', 'pages', projectId] });
      qc.invalidateQueries({ queryKey: ['wiki', 'by_slug', projectId] });
    },
  });
}

export function useCreateWikiLink(projectId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWikiLink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki', 'links', projectId] });
    },
  });
}

export function useDeleteWikiLink(projectId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWikiLink,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki', 'links', projectId] });
    },
  });
}

export function useUploadWikiAttachment(
  projectId: number | undefined,
  objectId: number | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) =>
      uploadWikiAttachment(projectId as number, objectId as number, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki', 'attachments', projectId, objectId] });
    },
  });
}

export function useDeleteWikiAttachment(
  projectId: number | undefined,
  objectId: number | undefined,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteWikiAttachment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wiki', 'attachments', projectId, objectId] });
    },
  });
}
