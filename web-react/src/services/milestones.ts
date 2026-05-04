import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Milestone, MilestoneDetail, SprintCreate, SprintUpdate } from '@/types/api';

export async function fetchMilestones(projectId: number): Promise<Milestone[]> {
  const res = await api.get<Milestone[]>('milestones', {
    params: { project: projectId, order_by: 'estimated_start' },
  });
  return res.data;
}

export async function fetchMilestone(id: number): Promise<MilestoneDetail> {
  const res = await api.get<MilestoneDetail>(`milestones/${id}`);
  return res.data;
}

export async function createMilestone(data: SprintCreate): Promise<MilestoneDetail> {
  const res = await api.post<MilestoneDetail>('milestones', data);
  return res.data;
}

export async function updateMilestone(
  id: number,
  data: SprintUpdate,
): Promise<MilestoneDetail> {
  const res = await api.patch<MilestoneDetail>(`milestones/${id}`, data);
  return res.data;
}

export async function deleteMilestone(id: number): Promise<void> {
  await api.delete(`milestones/${id}`);
}

export function useMilestones(projectId: number | undefined) {
  return useQuery({
    queryKey: ['milestones', projectId],
    queryFn: () => fetchMilestones(projectId as number),
    enabled: !!projectId,
  });
}

export function useMilestone(id: number | undefined) {
  return useQuery({
    queryKey: ['milestone', id],
    queryFn: () => fetchMilestone(id as number),
    enabled: !!id,
  });
}

export function useCreateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createMilestone,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

export function useUpdateMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: SprintUpdate }) =>
      updateMilestone(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones'] });
      qc.invalidateQueries({ queryKey: ['milestone'] });
    },
  });
}

export function useDeleteMilestone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteMilestone,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}
