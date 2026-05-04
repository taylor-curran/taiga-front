import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { CustomAttribute, CustomAttributeValue } from '@/types/api';

export type CustomAttrType = 'userstory' | 'task' | 'issue' | 'epic';

function attrEndpoint(type: CustomAttrType): string {
  if (type === 'userstory') return 'userstory-custom-attributes';
  return `${type}-custom-attributes`;
}

function valuesEndpoint(type: CustomAttrType): string {
  if (type === 'userstory') return 'userstories/custom-attributes-values';
  return `${type}s/custom-attributes-values`;
}

export async function fetchCustomAttributes(
  type: CustomAttrType,
  projectId: number,
): Promise<CustomAttribute[]> {
  const res = await api.get<CustomAttribute[]>(attrEndpoint(type), {
    params: { project: projectId },
  });
  return res.data;
}

export async function fetchCustomAttributeValues(
  type: CustomAttrType,
  objectId: number,
): Promise<CustomAttributeValue> {
  const res = await api.get<CustomAttributeValue>(`${valuesEndpoint(type)}/${objectId}`);
  return res.data;
}

export async function patchCustomAttributeValues(
  type: CustomAttrType,
  objectId: number,
  values: Record<string, unknown>,
  version: number,
): Promise<CustomAttributeValue> {
  const res = await api.patch<CustomAttributeValue>(`${valuesEndpoint(type)}/${objectId}`, {
    attributes_values: values,
    version,
  });
  return res.data;
}

export function useCustomAttributes(type: CustomAttrType, projectId: number | undefined) {
  return useQuery({
    queryKey: ['custom-attributes', type, projectId],
    queryFn: () => fetchCustomAttributes(type, projectId as number),
    enabled: !!projectId,
  });
}

export function useCustomAttributeValues(type: CustomAttrType, objectId: number | undefined) {
  return useQuery({
    queryKey: ['custom-attribute-values', type, objectId],
    queryFn: () => fetchCustomAttributeValues(type, objectId as number),
    enabled: !!objectId,
  });
}

export function usePatchCustomAttributeValues(type: CustomAttrType) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectId,
      values,
      version,
    }: {
      objectId: number;
      values: Record<string, unknown>;
      version: number;
    }) => patchCustomAttributeValues(type, objectId, values, version),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['custom-attribute-values', type, vars.objectId] });
    },
  });
}
