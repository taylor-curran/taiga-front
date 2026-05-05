import { useState, useEffect } from 'react';
import { useCurrentProject } from '@/hooks/useCurrentProject';
import { useUpdateProject } from '@/services/admin';

interface ModuleConfig {
  key: string;
  label: string;
  description: string;
  field: string;
}

const MODULES: ModuleConfig[] = [
  {
    key: 'epics',
    label: 'Epics',
    description: 'Enable the epics module to organize large features across multiple user stories.',
    field: 'is_epics_activated',
  },
  {
    key: 'backlog',
    label: 'Scrum / Backlog',
    description: 'Enable the backlog and sprints for Scrum-based project management.',
    field: 'is_backlog_activated',
  },
  {
    key: 'kanban',
    label: 'Kanban',
    description: 'Enable the Kanban board for continuous flow project management.',
    field: 'is_kanban_activated',
  },
  {
    key: 'issues',
    label: 'Issues',
    description: 'Enable the issue tracker for bug reports and feature requests.',
    field: 'is_issues_activated',
  },
  {
    key: 'wiki',
    label: 'Wiki',
    description: 'Enable the wiki for project documentation and knowledge sharing.',
    field: 'is_wiki_activated',
  },
];

export function ProjectModulesPage() {
  const project = useCurrentProject();
  const update = useUpdateProject();
  const [saved, setSaved] = useState(false);

  const proj = project as unknown as Record<string, unknown>;
  const [modules, setModules] = useState<Record<string, boolean>>({});
  const [totalMilestones, setTotalMilestones] = useState<number>(
    (proj.total_milestones as number) ?? 0,
  );
  const [totalStoryPoints, setTotalStoryPoints] = useState<number>(
    (proj.total_story_points as number) ?? 0,
  );

  useEffect(() => {
    const init: Record<string, boolean> = {};
    for (const m of MODULES) {
      init[m.field] = (proj[m.field] as boolean) ?? false;
    }
    setModules(init);
    setTotalMilestones((proj.total_milestones as number) ?? 0);
    setTotalStoryPoints((proj.total_story_points as number) ?? 0);
  }, [proj]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await update.mutateAsync({
      id: project.id,
      ...modules,
      total_milestones: totalMilestones,
      total_story_points: totalStoryPoints,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Modules</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {MODULES.map((mod) => (
          <div
            key={mod.key}
            className={`card p-5 border-l-4 transition-colors ${
              modules[mod.field] ? 'border-l-taiga-green-dark' : 'border-l-taiga-grey-lighter'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{mod.label}</h3>
                <p className="text-sm text-taiga-grey-light mt-1">{mod.description}</p>

                {mod.key === 'backlog' && modules[mod.field] && (
                  <div className="mt-3 flex gap-4 text-sm">
                    <div>
                      <label className="block text-xs font-medium mb-1">Number of sprints</label>
                      <input
                        type="number"
                        min={0}
                        className="input w-28"
                        value={totalMilestones}
                        onChange={(e) => setTotalMilestones(Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1">US points</label>
                      <input
                        type="number"
                        min={0}
                        className="input w-28"
                        value={totalStoryPoints}
                        onChange={(e) => setTotalStoryPoints(Number(e.target.value))}
                      />
                    </div>
                  </div>
                )}
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={modules[mod.field] ?? false}
                  onChange={(e) =>
                    setModules((prev) => ({ ...prev, [mod.field]: e.target.checked }))
                  }
                />
                <div className="w-11 h-6 bg-taiga-grey-lighter rounded-full peer peer-checked:bg-taiga-green-dark transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
              </label>
            </div>
          </div>
        ))}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="btn-primary" disabled={update.isPending}>
            {update.isPending ? 'Saving...' : 'Save'}
          </button>
          {saved && <span className="text-sm text-taiga-green-dark">Module settings saved!</span>}
        </div>
      </form>
    </div>
  );
}
