import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useProjectValues,
  useCreateProjectValue,
  useUpdateProjectValue,
  useDeleteProjectValue,
} from '@/services/admin';
import { ValuesList } from './ValuesList';

export function ValuesPrioritiesPage() {
  const project = useCurrentProject();
  const { data: values = [], isLoading } = useProjectValues(project.id, 'priorities');
  const create = useCreateProjectValue(project.id, 'priorities');
  const update = useUpdateProjectValue('priorities');
  const del = useDeleteProjectValue('priorities');

  return (
    <ValuesList
      title="Priorities"
      description="Define the priority levels for issues."
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
