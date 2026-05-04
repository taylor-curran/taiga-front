import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Attachment } from '@/types/api';

export type AttachmentObjectType = 'userstory' | 'task' | 'issue' | 'epic' | 'wiki';

function endpointForType(type: AttachmentObjectType): string {
  switch (type) {
    case 'userstory': return 'userstories/attachments';
    case 'task': return 'tasks/attachments';
    case 'issue': return 'issues/attachments';
    case 'epic': return 'epics/attachments';
    case 'wiki': return 'wiki/attachments';
  }
}

export async function fetchAttachments(
  type: AttachmentObjectType,
  objectId: number,
  projectId: number,
): Promise<Attachment[]> {
  const res = await api.get<Attachment[]>(endpointForType(type), {
    params: { object_id: objectId, project: projectId },
  });
  return res.data;
}

export async function uploadAttachment(
  type: AttachmentObjectType,
  objectId: number,
  projectId: number,
  file: File,
  description?: string,
): Promise<Attachment> {
  const form = new FormData();
  form.append('attached_file', file);
  form.append('object_id', String(objectId));
  form.append('project', String(projectId));
  if (description) form.append('description', description);
  const res = await api.post<Attachment>(endpointForType(type), form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function deleteAttachment(
  type: AttachmentObjectType,
  id: number,
): Promise<void> {
  await api.delete(`${endpointForType(type)}/${id}`);
}

export function useAttachments(
  type: AttachmentObjectType,
  objectId: number | undefined,
  projectId: number | undefined,
) {
  return useQuery({
    queryKey: ['attachments', type, objectId, projectId],
    queryFn: () => fetchAttachments(type, objectId as number, projectId as number),
    enabled: !!objectId && !!projectId,
  });
}

export function useUploadAttachment(type: AttachmentObjectType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectId,
      projectId,
      file,
      description,
    }: {
      objectId: number;
      projectId: number;
      file: File;
      description?: string;
    }) => uploadAttachment(type, objectId, projectId, file, description),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', type] });
    },
  });
}

export function useDeleteAttachment(type: AttachmentObjectType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteAttachment(type, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['attachments', type] });
    },
  });
}
