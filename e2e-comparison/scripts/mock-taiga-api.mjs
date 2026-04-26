/**
 * Serves the built Angular `dist/` (SPA) and `/api/v1/*` on one port so `$http` calls are same-origin.
 * Default: ANGULAR_STATIC_PORT=9101 (override with env).
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');
const distRoot = path.join(root, 'dist');
const port = Number(process.env.ANGULAR_STATIC_PORT || process.env.MOCK_API_PORT || '9101');

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept-Language, x-disable-pagination',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
  };
}

function json(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    ...corsHeaders(),
  });
  res.end(body);
}

function text(res, status, body, type = 'text/plain') {
  res.writeHead(status, {
    'Content-Type': type,
    'Content-Length': Buffer.byteLength(body),
    ...corsHeaders(),
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (c) => {
      raw += c;
    });
    req.on('end', () => {
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
  });
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

function safeJoin(base, reqPath) {
  const decoded = decodeURIComponent(reqPath.split('?')[0]);
  const target = path.normalize(path.join(base, decoded));
  if (!target.startsWith(path.normalize(base))) return null;
  return target;
}

function serveFile(res, filePath) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const ct = mime[ext] || 'application/octet-stream';
    const buf = fs.readFileSync(filePath);
    res.writeHead(200, { 'Content-Type': ct, 'Content-Length': buf.length, ...corsHeaders() });
    res.end(buf);
  } catch {
    res.writeHead(404, corsHeaders());
    res.end('Not found');
  }
}

const ownerUser = {
  id: 1,
  username: 'admin',
  full_name_display: 'Admin User',
  full_name: 'Admin User',
  email: 'admin@example.com',
  is_active: true,
  photo: null,
};

const memberRow = {
  id: 10,
  user: 1,
  role: 100,
  is_admin: true,
  email: 'admin@example.com',
  full_name: 'Admin User',
  full_name_display: 'Admin User',
  username: 'admin',
  invited_extra_text: null,
  is_active: true,
};

const roleRow = {
  id: 100,
  name: 'Product Owner',
  slug: 'product-owner',
  order: 10,
  computable: true,
};

const projectDetail = {
  id: 1,
  name: 'Sample Scrum Project',
  slug: 'scrum',
  description: 'Audit mock project',
  i_am_admin: true,
  total_memberships: 1,
  max_memberships: null,
  archived_code: null,
  owner: ownerUser,
  members: [memberRow],
  roles: [roleRow],
  tags: [],
  tags_colors: {},
  epic_statuses: [{ id: 1, name: 'New', order: 1, slug: 'new' }],
  us_statuses: [{ id: 1, name: 'New', order: 1, slug: 'new' }],
  points: [{ id: 1, name: '?', order: 1, value: null }],
  task_statuses: [{ id: 1, name: 'New', order: 1, slug: 'new' }],
  issue_types: [{ id: 1, name: 'Bug', order: 1 }],
  issue_statuses: [{ id: 1, name: 'New', order: 1, slug: 'new' }],
  priorities: [{ id: 1, name: 'Low', order: 1, slug: 'low' }],
  severities: [{ id: 1, name: 'Wishlist', order: 1, slug: 'wishlist' }],
  my_permissions: [
    'modify_project',
    'view_epics',
    'view_us',
    'view_issues',
    'view_wiki_pages',
    'admin_project_values',
    'modify_membership',
    'modify_epic',
    'modify_us',
    'modify_task',
    'modify_issue',
  ],
  is_epics_activated: true,
  is_backlog_activated: true,
  is_kanban_activated: true,
  is_issues_activated: true,
  is_wiki_activated: true,
  is_private: false,
  public_permissions: [
    'view_epics',
    'view_milestones',
    'view_us',
    'view_tasks',
    'view_issues',
    'view_wiki_pages',
    'view_wiki_links',
  ],
};

function serveConfJson(res) {
  const fc = path.join(distRoot, 'conf.json');
  if (fs.existsSync(fc)) {
    serveFile(res, fc);
  } else {
    const fb = fs.readFileSync(path.join(__dirname, '../fixtures/conf.e2e.angular-dist.json'), 'utf8');
    text(res, 200, fb, 'application/json');
  }
}

function paginatedJson(res, items, page = 1) {
  const body = JSON.stringify(items);
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
    'x-pagination-count': String(items.length),
    'x-pagination-current': String(page),
    'x-paginated-by': '50',
    ...corsHeaders(),
  });
  res.end(body);
}

async function handleApi(req, res, url) {
  if (url.pathname === '/api/v1/projects/by_slug' && req.method === 'GET') {
    json(res, 200, projectDetail);
    return true;
  }

  const projUsers = url.pathname.match(/^\/api\/v1\/projects\/(\d+)\/users$/);
  if (projUsers && req.method === 'GET') {
    json(res, 200, [memberRow]);
    return true;
  }

  const projRoles = url.pathname.match(/^\/api\/v1\/projects\/(\d+)\/roles$/);
  if (projRoles && req.method === 'GET') {
    json(res, 200, [roleRow]);
    return true;
  }

  if (url.pathname === '/api/v1/users/me' && req.method === 'GET') {
    json(res, 200, {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      full_name: 'Admin User',
      full_name_display: 'Admin User',
      lang: null,
      theme: null,
      photo: null,
      is_active: true,
      max_memberships_private_projects: 999,
      max_private_projects: null,
      max_public_projects: null,
      total_private_projects: 0,
      total_public_projects: 0,
      verified_email: true,
    });
    return true;
  }

  if (url.pathname === '/api/v1/locales' && req.method === 'GET') {
    json(res, 200, [{ code: 'en', name: 'English', bidi: false }]);
    return true;
  }

  if (url.pathname === '/api/v1/user-project-settings' && req.method === 'GET') {
    json(res, 200, []);
    return true;
  }

  if (url.pathname === '/api/v1/webhooks' && req.method === 'GET') {
    const project = url.searchParams.get('project');
    if (project === '1') {
      json(res, 200, []);
      return true;
    }
  }

  if (url.pathname === '/api/v1/roles' && req.method === 'GET') {
    const project = url.searchParams.get('project');
    if (project === '1') {
      json(res, 200, [
        {
          id: 100,
          name: 'Product Owner',
          slug: 'product-owner',
          order: 10,
          computable: true,
          permissions: projectDetail.my_permissions,
        },
      ]);
      return true;
    }
  }

  if (url.pathname === '/api/v1/memberships' && req.method === 'GET') {
    const project = url.searchParams.get('project');
    const page = Number(url.searchParams.get('page') || '1');
    if (project === '1') {
      paginatedJson(
        res,
        [
          {
            id: 1,
            user: 1,
            user_email: 'admin@example.com',
            is_owner: true,
            is_user_active: true,
            is_admin: true,
            role_name: 'Product Owner',
            invited_extra_text: null,
          },
        ],
        page,
      );
      return true;
    }
  }

  if (url.pathname === '/api/v1/auth' && req.method === 'POST') {
    const body = await readBody(req);
    const u = String(body.username || '');
    const p = String(body.password || '');
    if (u === 'admin' && p === 'adminpass') {
      json(res, 200, {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        full_name: 'Admin User',
        auth_token: 'mock-token-e2e',
        refresh: 'mock-refresh-e2e',
      });
      return true;
    }
    json(res, 400, {
      _error_message: 'According to the Taiga, your username/email or password are incorrect.',
    });
    return true;
  }

  if (url.pathname === '/api/v1/auth/refresh' && req.method === 'POST') {
    json(res, 200, { auth_token: 'mock-token-e2e', refresh: 'mock-refresh-e2e' });
    return true;
  }

  if (url.pathname === '/api/v1/auth/register' && req.method === 'POST') {
    json(res, 200, {
      id: 2,
      username: 'newuser',
      email: 'new@example.com',
      full_name: 'New User',
      auth_token: 'mock-register-token',
      refresh: 'mock-register-refresh',
    });
    return true;
  }

  if (url.pathname === '/api/v1/users/password_recovery' && req.method === 'POST') {
    json(res, 200, {});
    return true;
  }

  if (url.pathname.startsWith('/api/v1/invitations/') && req.method === 'GET') {
    json(res, 200, {
      project_name: 'Mock Project',
      project_slug: 'scrum',
      invited_by: { full_name_display: 'Inviter' },
    });
    return true;
  }

  if (url.pathname === '/api/v1/users/change_password_from_recovery' && req.method === 'POST') {
    json(res, 200, {});
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://127.0.0.1:${port}`);

  if (url.pathname === '/conf.json' && req.method === 'GET') {
    serveConfJson(res);
    return;
  }

  if (url.pathname.startsWith('/api/')) {
    const ok = await handleApi(req, res, url);
    if (!ok) json(res, 404, { detail: `no mock: ${req.method} ${url.pathname}` });
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, corsHeaders());
    res.end('Method not allowed');
    return;
  }

  let filePath = safeJoin(distRoot, url.pathname === '/' ? '/index.html' : url.pathname);
  if (filePath && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    serveFile(res, filePath);
    return;
  }

  const indexPath = path.join(distRoot, 'index.html');
  if (fs.existsSync(indexPath)) {
    serveFile(res, indexPath);
    return;
  }

  res.writeHead(500, corsHeaders());
  res.end('dist/ missing — run gulp deploy at repo root');
});

server.listen(port, '127.0.0.1', () => {
  process.stdout.write(`e2e static+api on http://127.0.0.1:${port}\n`);
});
