import { useState, useEffect } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useUpdateProject } from '@/services/admin';

export function DefaultValuesPage() {
  const project = useCurrentProject();
  const update = useUpdateProject();
  const [saved, setSaved] = useState(false);

  const usStatuses = project.us_statuses ?? [];
  const taskStatuses = project.task_statuses ?? [];
  const issueStatuses = project.issue_statuses ?? [];
  const issueTypes = project.issue_types ?? [];
  const priorities = project.priorities ?? [];
  const severities = project.severities ?? [];
  const points = project.points ?? [];

  const [defaults, setDefaults] = useState({
    default_us_status: 0,
    default_task_status: 0,
    default_issue_status: 0,
    default_issue_type: 0,
    default_priority: 0,
    default_severity: 0,
    default_points: 0,
  });

  useEffect(() => {
    const p = project as unknown as Record<string, unknown>;
    setDefaults({
      default_us_status: (p.default_us_status as number) ?? usStatuses[0]?.id ?? 0,
      default_task_status: (p.default_task_status as number) ?? taskStatuses[0]?.id ?? 0,
      default_issue_status: (p.default_issue_status as number) ?? issueStatuses[0]?.id ?? 0,
      default_issue_type: (p.default_issue_type as number) ?? issueTypes[0]?.id ?? 0,
      default_priority: (p.default_priority as number) ?? priorities[0]?.id ?? 0,
      default_severity: (p.default_severity as number) ?? severities[0]?.id ?? 0,
      default_points: (p.default_points as number) ?? points[0]?.id ?? 0,
    });
  }, [project, usStatuses, taskStatuses, issueStatuses, issueTypes, priorities, severities, points]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({ id: project.id, ...defaults });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const selectClass = 'input w-full';

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Default Values</h1>

      <div className="card p-6">
        <p className="text-sm text-taiga-grey-light mb-4">
          Choose the default status, type, priority, severity, and points for new items in this
          project.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-sm font-medium mb-1">Default User Story Status</label>
            <select
              className={selectClass}
              value={defaults.default_us_status}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, default_us_status: Number(e.target.value) }))
              }
            >
              {usStatuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Task Status</label>
            <select
              className={selectClass}
              value={defaults.default_task_status}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, default_task_status: Number(e.target.value) }))
              }
            >
              {taskStatuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Issue Status</label>
            <select
              className={selectClass}
              value={defaults.default_issue_status}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, default_issue_status: Number(e.target.value) }))
              }
            >
              {issueStatuses.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Issue Type</label>
            <select
              className={selectClass}
              value={defaults.default_issue_type}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, default_issue_type: Number(e.target.value) }))
              }
            >
              {issueTypes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Priority</label>
            <select
              className={selectClass}
              value={defaults.default_priority}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, default_priority: Number(e.target.value) }))
              }
            >
              {priorities.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Severity</label>
            <select
              className={selectClass}
              value={defaults.default_severity}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, default_severity: Number(e.target.value) }))
              }
            >
              {severities.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Default Points</label>
            <select
              className={selectClass}
              value={defaults.default_points}
              onChange={(e) =>
                setDefaults((d) => ({ ...d, default_points: Number(e.target.value) }))
              }
            >
              {points.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={update.isPending}>
              {update.isPending ? 'Saving...' : 'Save'}
            </button>
            {saved && <span className="text-sm text-taiga-green-dark">Defaults saved!</span>}
          </div>
        </form>
      </div>
    </div>
  );
}
