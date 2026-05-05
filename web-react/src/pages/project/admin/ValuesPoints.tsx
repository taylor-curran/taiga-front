import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useProjectValues,
  useCreateProjectValue,
  useUpdateProjectValue,
  useDeleteProjectValue,
} from '@/services/admin';
import { ValuesList } from './ValuesList';

export function ValuesPointsPage() {
  const project = useCurrentProject();
  const { data: values = [], isLoading } = useProjectValues(project.id, 'points');
  const create = useCreateProjectValue(project.id, 'points');
  const update = useUpdateProjectValue('points');
  const del = useDeleteProjectValue('points');

  return (
    <ValuesList
      title="Points"
      description="Define the point values used to estimate user stories."
      values={values}
      isLoading={isLoading}
      showColor={false}
      showValue
      onCreate={(data) => create.mutate(data)}
      onUpdate={(data) => update.mutate(data)}
      onDelete={(id) => del.mutate({ id })}
      isCreating={create.isPending}
    />
  );
}
