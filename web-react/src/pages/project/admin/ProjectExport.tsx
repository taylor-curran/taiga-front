import { useState } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useExportProject } from '@/services/admin';

export function ProjectExportPage() {
  const project = useCurrentProject();
  const exportProject = useExportProject();
  const [exportUrl, setExportUrl] = useState<string | null>(null);

  const handleExport = async () => {
    const result = await exportProject.mutateAsync(project.id);
    if (result.url) {
      setExportUrl(result.url);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Export Project</h1>

      <div className="card p-6">
        <p className="text-sm text-taiga-grey-light mb-4">
          Export all project data as a JSON file. This includes user stories, tasks, issues, wiki
          pages, and all project settings.
        </p>
        <p className="text-sm text-taiga-grey-light mb-6">
          The export process may take a few minutes for large projects. You will receive an email
          notification when the export is ready for download.
        </p>

        <button
          type="button"
          className="btn-primary"
          onClick={handleExport}
          disabled={exportProject.isPending}
        >
          {exportProject.isPending ? 'Exporting...' : 'Export Project'}
        </button>

        {exportProject.isSuccess && !exportUrl && (
          <div className="mt-4 p-4 bg-taiga-green-dark/10 text-taiga-green-dark rounded text-sm">
            Export has been initiated. You will receive an email when the download is ready.
          </div>
        )}

        {exportUrl && (
          <div className="mt-4 p-4 bg-taiga-green-dark/10 rounded text-sm">
            <p className="text-taiga-green-dark font-semibold mb-2">Export ready!</p>
            <a href={exportUrl} className="text-taiga-link underline" download>
              Download export file
            </a>
          </div>
        )}

        {exportProject.isError && (
          <div className="mt-4 p-4 bg-taiga-red/10 text-taiga-red rounded text-sm">
            Error exporting project. Please try again.
          </div>
        )}
      </div>
    </div>
  );
}
