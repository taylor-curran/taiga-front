export type DutyLike = {
  id: number;
  ref: number;
  subject: string;
  modified_date: string;
  project: number;
  project_extra?: { slug: string; name: string };
  is_blocked?: boolean;
  _name?: string;
  url?: string;
};

export type WorkInProgress = {
  assignedTo: DutyLike[];
  watching: DutyLike[];
};

function dutyUrl(type: string, projectSlug: string, ref: number): string {
  if (type === 'epics') return `/project/${projectSlug}/epic/${ref}`;
  if (type === 'userstories') return `/project/${projectSlug}/us/${ref}`;
  if (type === 'tasks') return `/project/${projectSlug}/task/${ref}`;
  if (type === 'issues') return `/project/${projectSlug}/issue/${ref}`;
  return `/project/${projectSlug}/us/${ref}`;
}

function attachProject(
  duties: Record<string, unknown>[],
  projectsById: Map<number, { slug: string; name: string }>,
  objType: string,
): DutyLike[] {
  const seg = objType === 'userstories' ? 'userstories' : objType;
  return duties
    .filter((d) => {
      const pid = d.project as number;
      return projectsById.has(pid);
    })
    .map((d) => {
      const p = projectsById.get(d.project as number)!;
      const ref = d.ref as number;
      return {
        ...(d as DutyLike),
        _name: seg,
        url: dutyUrl(seg, p.slug, ref),
        project_extra: { slug: p.slug, name: p.name },
      };
    });
}

function mergeAndSort(
  epics: Record<string, unknown>[],
  userStories: Record<string, unknown>[],
  tasks: Record<string, unknown>[],
  issues: Record<string, unknown>[],
  projectsById: Map<number, { slug: string; name: string }>,
): DutyLike[] {
  const a = attachProject(userStories, projectsById, 'userstories');
  const b = attachProject(tasks, projectsById, 'tasks');
  const c = attachProject(issues, projectsById, 'issues');
  const e = attachProject(epics, projectsById, 'epics');
  const all = [...a, ...b, ...c, ...e];
  return all.sort((x, y) => (x.modified_date < y.modified_date ? 1 : x.modified_date > y.modified_date ? -1 : 0));
}

export function buildWorkInProgress(
  projects: { id: number; slug: string; name: string }[],
  assigned: {
    epics: Record<string, unknown>[];
    userStories: Record<string, unknown>[];
    tasks: Record<string, unknown>[];
    issues: Record<string, unknown>[];
  },
  watching: {
    epics: Record<string, unknown>[];
    userStories: Record<string, unknown>[];
    tasks: Record<string, unknown>[];
    issues: Record<string, unknown>[];
  },
): WorkInProgress {
  const projectsById = new Map(projects.map((p) => [p.id, { slug: p.slug, name: p.name }]));
  return {
    assignedTo: mergeAndSort(assigned.epics, assigned.userStories, assigned.tasks, assigned.issues, projectsById),
    watching: mergeAndSort(watching.epics, watching.userStories, watching.tasks, watching.issues, projectsById),
  };
}
