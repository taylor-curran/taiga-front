import type { FixtureDb } from './mockDb';

function json(data: unknown, headers?: Record<string, string>): Response {
  const h = new Headers({ 'Content-Type': 'application/json', ...headers });
  return new Response(JSON.stringify(data), { status: 200, headers: h });
}

function matchPath(path: string, pattern: string): RegExpMatchArray | null {
  const re = new RegExp(
    '^' +
      pattern.replace(/:[^/]+/g, '([^/]+)').replace(/\//g, '\\/') +
      '(?:\\?.*)?$',
  );
  return path.match(re);
}

/** Returns a Response for fixture mode, or null to use the network. */
export async function tryMockResponse(pathWithQuery: string, db: FixtureDb): Promise<Response | null> {
  let pathOnly: string;
  let search = '';
  try {
    const u = new URL(pathWithQuery, 'http://localhost');
    pathOnly = u.pathname;
    search = u.search.startsWith('?') ? u.search.slice(1) : u.search;
  } catch {
    [pathOnly, search] = pathWithQuery.split('?');
  }
  const pathNoApi = pathOnly.replace(/^\/api\/v1(\/|$)/, '/').replace(/\/$/, '') || '/';
  const pathNorm = pathNoApi.startsWith('/') ? pathNoApi : `/${pathNoApi}`;
  const params = new URLSearchParams(search);

  const projectsList = matchPath(pathNorm, '/projects');
  if (projectsList) {
    const member = params.get('member');
    const slight = params.get('slight');
    if (member && slight === 'true') {
      return json(db.projects);
    }
    if (member) {
      return json(db.projects);
    }
  }

  const bySlug = matchPath(pathNorm, '/projects/by_slug');
  if (bySlug) {
    const slug = params.get('slug');
    const p = db.projects.find((x) => (x as { slug?: string }).slug === slug);
    return p ? json(p) : new Response('{}', { status: 404 });
  }

  const membershipsList = matchPath(pathNorm, '/memberships');
  if (membershipsList) {
    const project = params.get('project');
    const page = params.get('page') ?? '1';
    if (project === '10' || project === String((db.projects[0] as { id?: number })?.id)) {
      const rows = db.memberships.filter((m) => String(m.project) === String(project));
      return json(rows, {
        'x-pagination-count': String(rows.length),
        'x-pagination-current': page,
        'x-paginated-by': String(rows.length || 30),
      });
    }
  }

  const rolesList = matchPath(pathNorm, '/roles');
  if (rolesList) {
    const project = params.get('project');
    if (project) {
      const rows = db.roles.filter((r) => String(r.project) === String(project));
      return json(rows);
    }
  }

  const listInAll = (resource: 'userstories' | 'tasks' | 'issues' | 'epics') => {
    const base = `/${resource}`;
    if (pathNorm !== base) return null;
    const assigned = params.get('assigned_to') ?? params.get('assigned_users');
    const watchers = params.get('watchers');
    const dashboard = params.get('dashboard');
    const uid = String(db.user.id);
    const row =
      resource === 'userstories'
        ? db.userstory
        : resource === 'tasks'
          ? db.task
          : resource === 'issues'
            ? db.issue
            : db.epic;
    const want =
      (assigned === uid || (resource === 'userstories' && params.get('assigned_users') === uid)) ||
      watchers === uid;
    if (!want) return json([]);
    if (resource === 'userstories' && dashboard !== 'true') return json([]);
    return json([row]);
  };

  const u = listInAll('userstories');
  if (u) return u;
  const t = listInAll('tasks');
  if (t) return t;
  const i = listInAll('issues');
  if (i) return i;
  const e = listInAll('epics');
  if (e) return e;

  return null;
}
