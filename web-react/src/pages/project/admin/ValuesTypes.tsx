import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useProjectValues,
  useCreateProjectValue,
  useUpdateProjectValue,
  useDeleteProjectValue,
} from '@/services/admin';
import { ValuesList } from './ValuesList';

export function ValuesTypesPage() {
  const project = useCurrentProject();
  const { data: values = [], isLoading } = useProjectValues(project.id, 'issue-types');
  const create = useCreateProjectValue(project.id, 'issue-types');
  const update = useUpdateProjectValue('issue-types');
  const del = useDeleteProjectValue('issue-types');

  return (
    <ValuesList
      title="Issue Types"
      description="Define the types of issues (Bug, Feature, Enhancement, etc.)."
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
