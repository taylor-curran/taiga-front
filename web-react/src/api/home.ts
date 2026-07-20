import type { TaigaConfig } from './types';
import { taigaFetch } from './client';
import type { ProjectSummary } from './types';

const noPagination = { 'x-disable-pagination': '1' };

export type DutyItem = {
  id: number;
  ref: number;
  subject?: string;
  project: number | string;
  slug?: string;
  url?: string;
  _name?: string;
};

export type WorkInProgress = {
  assignedTo: {
    epics: DutyItem[];
    userStories: DutyItem[];
    tasks: DutyItem[];
    issues: DutyItem[];
  };
  watching: {
    epics: DutyItem[];
    userStories: DutyItem[];
    tasks: DutyItem[];
    issues: DutyItem[];
  };
};

async function getJsonList(
  config: TaigaConfig,
  path: string,
  params: Record<string, string | number | boolean>,
): Promise<unknown[]> {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => sp.set(k, String(v)));
  const res = await taigaFetch(config, `${path}?${sp.toString()}`, {
    headers: noPagination,
  });
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

function decorateDuty(raw: Record<string, unknown>, type: DutyItem['_name']): DutyItem {
  const id = Number(raw.id);
  const ref = Number(raw.ref ?? raw.id);
  const project = raw.project as number | string;
  return {
    id,
    ref,
    subject: typeof raw.subject === 'string' ? raw.subject : undefined,
    project,
    _name: type,
  };
}

function attachProject(
  items: unknown[],
  type: DutyItem['_name'],
  projectsById: Map<string, ProjectSummary>,
): DutyItem[] {
  const out: DutyItem[] = [];
  for (const x of items) {
    if (typeof x !== 'object' || !x) continue;
    const raw = x as Record<string, unknown>;
    const d = decorateDuty(raw, type);
    const p = projectsById.get(String(d.project));
    if (!p) continue;
    const slug = p.slug;
    const ref = d.ref;
    let url = '';
    if (type === 'epics') url = `project/${slug}/epic/${ref}`;
    else if (type === 'userstories') url = `project/${slug}/us/${ref}`;
    else if (type === 'tasks') url = `project/${slug}/task/${ref}`;
    else if (type === 'issues') url = `project/${slug}/issue/${ref}`;
    out.push({ ...d, slug, url });
  }
  return out;
}

export async function fetchWorkInProgress(config: TaigaConfig, userId: number): Promise<WorkInProgress> {
  const projectsRes = await taigaFetch(config, `projects?member=${userId}`);
  if (!projectsRes.ok) throw new Error(`projects member: ${projectsRes.status}`);
  const projectsJson = (await projectsRes.json()) as ProjectSummary[];
  const projectsById = new Map(projectsJson.map((p) => [String(p.id), p]));

  const [
    aEpics,
    wEpics,
    aUs,
    wUs,
    aTasks,
    wTasks,
    aIssues,
    wIssues,
  ] = await Promise.all([
    getJsonList(config, 'epics', { status__is_closed: false, assigned_to: userId }),
    getJsonList(config, 'epics', { status__is_closed: false, watchers: userId }),
    getJsonList(config, 'userstories', {
      is_closed: false,
      assigned_users: userId,
      dashboard: true,
    }),
    getJsonList(config, 'userstories', {
      is_closed: false,
      watchers: userId,
      dashboard: true,
    }),
    getJsonList(config, 'tasks', { status__is_closed: false, assigned_to: userId }),
    getJsonList(config, 'tasks', { status__is_closed: false, watchers: userId }),
    getJsonList(config, 'issues', { status__is_closed: false, assigned_to: userId }),
    getJsonList(config, 'issues', { status__is_closed: false, watchers: userId }),
  ]);

  return {
    assignedTo: {
      epics: attachProject(aEpics, 'epics', projectsById),
      userStories: attachProject(aUs, 'userstories', projectsById),
      tasks: attachProject(aTasks, 'tasks', projectsById),
      issues: attachProject(aIssues, 'issues', projectsById),
    },
    watching: {
      epics: attachProject(wEpics, 'epics', projectsById),
      userStories: attachProject(wUs, 'userstories', projectsById),
      tasks: attachProject(wTasks, 'tasks', projectsById),
      issues: attachProject(wIssues, 'issues', projectsById),
    },
  };
}
