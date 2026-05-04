import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useCsvReportRegenerate } from '@/services/admin';

interface CsvSection {
  key: string;
  label: string;
  description: string;
  uuidField: string;
}

const CSV_SECTIONS: CsvSection[] = [
  {
    key: 'userstories',
    label: 'User Stories',
    description: 'Export user stories to CSV format.',
    uuidField: 'userstories_csv_uuid',
  },
  {
    key: 'tasks',
    label: 'Tasks',
    description: 'Export tasks to CSV format.',
    uuidField: 'tasks_csv_uuid',
  },
  {
    key: 'issues',
    label: 'Issues',
    description: 'Export issues to CSV format.',
    uuidField: 'issues_csv_uuid',
  },
];

export function ProjectReportsPage() {
  const project = useCurrentProject();
  const regenerate = useCsvReportRegenerate(project.id);

  const proj = project as unknown as Record<string, string | undefined>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Reports</h1>

      <div className="card p-6">
        <p className="text-sm text-taiga-grey-light mb-6">
          Manage CSV export URLs for this project. Each CSV type has a unique URL that can be shared
          with external tools. Regenerating the UUID will invalidate the old URL.
        </p>

        <div className="space-y-6">
          {CSV_SECTIONS.map((section) => {
            const uuid = proj[section.uuidField];
            return (
              <div key={section.key} className="border-b border-taiga-bg pb-4 last:border-0">
                <h3 className="font-semibold mb-1">{section.label}</h3>
                <p className="text-sm text-taiga-grey-light mb-2">{section.description}</p>

                {uuid ? (
                  <div className="flex items-center gap-3 text-sm">
                    <code className="bg-taiga-bg px-2 py-1 rounded text-xs flex-1 break-all">
                      {uuid}
                    </code>
                    <button
                      type="button"
                      className="btn-secondary text-xs shrink-0"
                      onClick={() => regenerate.mutate(section.key)}
                      disabled={regenerate.isPending}
                    >
                      Regenerate
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-taiga-grey-light italic">
                      No CSV UUID generated yet.
                    </span>
                    <button
                      type="button"
                      className="btn-secondary text-xs"
                      onClick={() => regenerate.mutate(section.key)}
                      disabled={regenerate.isPending}
                    >
                      Generate
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
