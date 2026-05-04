import { useCurrentProject } from '@/hooks/useCurrentProject';
import {
  useProjectValues,
  useCreateProjectValue,
  useUpdateProjectValue,
  useDeleteProjectValue,
} from '@/services/admin';
import { ValuesList } from './ValuesList';

const STATUS_ENDPOINTS = [
  { key: 'userstory-statuses' as const, label: 'User Story Statuses' },
  { key: 'task-statuses' as const, label: 'Task Statuses' },
  { key: 'issue-statuses' as const, label: 'Issue Statuses' },
  { key: 'epic-statuses' as const, label: 'Epic Statuses' },
];

function StatusSection({ endpoint, label, projectId }: { endpoint: typeof STATUS_ENDPOINTS[number]['key']; label: string; projectId: number }) {
  const { data: values = [], isLoading } = useProjectValues(projectId, endpoint);
  const create = useCreateProjectValue(projectId, endpoint);
  const update = useUpdateProjectValue(endpoint);
  const del = useDeleteProjectValue(endpoint);

  return (
    <ValuesList
      title={label}
      values={values}
      isLoading={isLoading}
      showColor
      showClosed
      showWipLimit={endpoint === 'userstory-statuses'}
      onCreate={(data) => create.mutate(data)}
      onUpdate={(data) => update.mutate(data)}
      onDelete={(id) => del.mutate({ id })}
      isCreating={create.isPending}
    />
  );
}

export function ValuesStatusPage() {
  const project = useCurrentProject();

  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold">Status</h1>
      {STATUS_ENDPOINTS.map((ep) => (
        <StatusSection key={ep.key} endpoint={ep.key} label={ep.label} projectId={project.id} />
      ))}
    </div>
  );
}
