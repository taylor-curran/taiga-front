import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { HistoryEntry } from '@/types/api';

export type HistoryContentType = 'userstory' | 'task' | 'issue' | 'epic' | 'wiki';

function historyEndpoint(type: HistoryContentType, id: number): string {
  return `history/${type}/${id}`;
}

export async function fetchHistory(
  type: HistoryContentType,
  id: number,
): Promise<HistoryEntry[]> {
  const res = await api.get<HistoryEntry[]>(historyEndpoint(type, id));
  return res.data;
}

export async function postComment(
  type: HistoryContentType,
  id: number,
  comment: string,
  version: number,
): Promise<void> {
  const endpoint = type === 'userstory' ? 'userstories' : `${type}s`;
  await api.patch(`${endpoint}/${id}`, { comment, version });
}

export async function deleteComment(
  type: HistoryContentType,
  objectId: number,
  commentId: string,
): Promise<void> {
  await api.post(`${historyEndpoint(type, objectId)}/delete_comment`, {
    id: commentId,
  });
}

export function useHistory(
  type: HistoryContentType,
  id: number | undefined,
) {
  return useQuery({
    queryKey: ['history', type, id],
    queryFn: () => fetchHistory(type, id as number),
    enabled: !!id,
  });
}

export function usePostComment(type: HistoryContentType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      comment,
      version,
    }: {
      id: number;
      comment: string;
      version: number;
    }) => postComment(type, id, comment, version),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['history', type, vars.id] });
      qc.invalidateQueries({ queryKey: ['userstory'] });
    },
  });
}

export function useDeleteComment(type: HistoryContentType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ objectId, commentId }: { objectId: number; commentId: string }) =>
      deleteComment(type, objectId, commentId),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['history', type, vars.objectId] });
    },
  });
}
