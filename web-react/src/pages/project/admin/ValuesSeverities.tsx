import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useProjectValues,
  useCreateProjectValue,
  useUpdateProjectValue,
  useDeleteProjectValue,
} from '@/services/admin';
import { ValuesList } from './ValuesList';

export function ValuesSeveritiesPage() {
  const project = useCurrentProject();
  const { data: values = [], isLoading } = useProjectValues(project.id, 'severities');
  const create = useCreateProjectValue(project.id, 'severities');
  const update = useUpdateProjectValue('severities');
  const del = useDeleteProjectValue('severities');

  return (
    <ValuesList
      title="Severities"
      description="Define the severity levels for issues."
      values={values}
      isLoading={isLoading}
      showColor
      onCreate={(data) => create.mutate(data)}
      onUpdate={(data) => update.mutate(data)}
      onDelete={(id) => del.mutate({ id })}
      isCreating={create.isPending}
    />
  );
}
