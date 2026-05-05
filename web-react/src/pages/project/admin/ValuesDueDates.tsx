import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useDueDates } from '@/services/admin';
import type { DueDateEntry } from '@/types/admin';

const DUE_DATE_ENDPOINTS = [
  { key: 'userstory-due-dates' as const, label: 'User Story Due Dates' },
  { key: 'task-due-dates' as const, label: 'Task Due Dates' },
  { key: 'issue-due-dates' as const, label: 'Issue Due Dates' },
];

function DueDateSection({ endpoint, label, projectId }: { endpoint: typeof DUE_DATE_ENDPOINTS[number]['key']; label: string; projectId: number }) {
  const { data: dueDates = [], isLoading } = useDueDates(projectId, endpoint);
  const sorted = [...dueDates].sort((a: DueDateEntry, b: DueDateEntry) => a.order - b.order);

  if (isLoading) return <p className="text-sm text-taiga-grey-light">Loading...</p>;

  return (
    <div>
      <h3 className="font-semibold text-lg mb-3">{label}</h3>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-taiga-bg bg-taiga-bg/50 text-left">
              <th className="px-4 py-2 w-8" />
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2 w-32">Days to finish</th>
              <th className="px-4 py-2 w-20">Default</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((dd) => (
              <tr key={dd.id} className="border-b border-taiga-bg last:border-0">
                <td className="px-4 py-2">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dd.color ?? '#A9AABC' }} />
                </td>
                <td className="px-4 py-2">{dd.name}</td>
                <td className="px-4 py-2 text-taiga-grey-light">
                  {dd.days_to_finish != null ? `${dd.days_to_finish} days` : '-'}
                </td>
                <td className="px-4 py-2">
                  {dd.by_default && <span className="text-taiga-green-dark text-xs font-semibold">Default</span>}
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-taiga-grey-light">
                  No due date configurations found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ValuesDueDatesPage() {
  const project = useCurrentProject();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold">Due Dates</h1>
        <p className="text-sm text-taiga-grey-light mt-1">
          Configure due date categories and their visual indicators for each entity type.
        </p>
      </div>
      {DUE_DATE_ENDPOINTS.map((ep) => (
        <DueDateSection key={ep.key} endpoint={ep.key} label={ep.label} projectId={project.id} />
      ))}
    </div>
  );
}
