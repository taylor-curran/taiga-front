# Angular (reference) and React (migration) — page inventory

**Branch:** `cursor/angular-react-migration-audit-41d1`  
**Sources:** `app/coffee/app.coffee` (AngularJS `$routeProvider`), `web-react/src/router.tsx` (React Router v7)

## Environment notes

- **Angular** is served from a static build in `dist/` (after `npx gulp deploy`, Node 16) on port **9101** in this audit; `app-loader` loads merged `conf.json` from the same origin.
- **React** is the Vite app (`web-react/`), `vite preview` on port **5173**; API calls in full workflows expect a Taiga gateway (default `http://localhost:9000` per `web-react/vite.config.ts` proxy), which was **not** available in the audit runtime (no Docker / no backend), so **authenticated and project-scoped pages were not end-to-end compared** in the browser. They are still listed for coverage; parity vs legacy is tracked via source comparison and any tests that can run with mocks.

---

## A. Public and auth (no project slug)

| Route (Angular) | Route (React) | Auth | What it is | Reach / note |
|-----------------|--------------|------|------------|--------------|
| `/` | `/` | Mixed | Home; guest users are redirected to discover in **Angular** (`Home` controller) | With backend: compare dashboard vs “Welcome” guest shell in React |
| `/login` | `/login` | No | Sign-in | **Compared** in Playwright (static) |
| `/register` | *(not in `router.tsx`)* | No | Public registration (Angular when `taigaConfig.publicRegisterEnabled`) | **Router gap** — no `/register` in React; link may 404 or fall through to `NotFound` |
| `/forgot-password` | `/forgot-password` | No | Password recovery | **Compared** (copy; static) |
| `/change-password/:token` | `/change-password/:token` | No | Set password from recovery | Needs token + API for full flow |
| `/invitation/:token` | `/invitation/:token` | No | Accept invitation | Needs token + API |
| `/external-apps` | `/external-apps` | No | OAuth / external app step | **Compared** (title/copy shell) |
| `/feedback` | `/feedback` | No | Feedback info | **Compared** (shell copy) |
| `/discover` | `/discover` | No | Discover home | **Compared** (hero title; static) |
| `/discover/search` | `/discover/search` | No | Search results | **Compared** (shell) |

## B. My projects and project creation

| Route | React | Auth | Note |
|-------|--------|------|------|
| `/projects/` | `/projects/` | Yes | **Not** e2e-audited here (no API) — listing + create link |
| `/project/new` | `/project/new` | Yes | Create project wizard entry |
| `/project/new/scrum`, `/project/new/kanban` | same | Yes | |
| `/project/new/duplicate` | same | Yes | |
| `/project/new/import/:platform?` | same | Yes | |

## C. Per-project workspace (`/project/:pslug/...`)

| Sub-route | React equivalent | Note |
|------------|------------------|------|
| `/project/:pslug/` (index) | same | Project router → default section |
| `/project/:pslug/timeline` | same | |
| `/project/:pslug/epics` | same | |
| `/project/:pslug/epic/:epicref` | same | |
| `/project/:pslug/backlog` | same | |
| `/project/:pslug/kanban` | same | |
| `/project/:pslug/taskboard/:sslug` | same | |
| `/project/:pslug/us/:usref` | same | |
| `/project/:pslug/task/:taskref` | same | |
| `/project/:pslug/issues` | same | |
| `/project/:pslug/issue/:issueref` | same | |
| `/project/:pslug/t/:ref` | same | |
| `/project/:pslug/search` | same | |
| `/project/:pslug/wiki` → `wiki/home` | `/wiki` → `wiki/home` (Navigate) | |
| `/project/:pslug/wiki-list` | same | |
| `/project/:pslug/wiki/:slug` | same | |
| `/project/:pslug/team` | same | |
| `/project/:pslug/admin/...` | nested under `admin` | Many admin sub-routes (profile, values, members, third parties) |
| `/project/:pslug/transfer/:token` | `transfer/:token` | **React** shows placeholder only (“Project transfer page”) — functionality gap vs full Angular page |
| `/project/:pslug/admin/contrib/:plugin` | `admin` has no `contrib` child in React; user settings has `contrib/:plugin` placeholder | **Navigation / route gap** vs Angular admin contrib |

## D. User settings, profile, notifications

| Route | React | Auth |
|-------|--------|------|
| `/user-settings/...` | `/user-settings/...` | Yes (React `RequireAuth` on layout) |
| `/profile` | `/profile` | Yes |
| `/profile/:slug` | same | Public profile |
| `/notifications` | same | Yes |
| `/change-email/:email_token` | same | |
| `/verify-email/:email_token` | same | |
| `/cancel-account/:cancel_token` | same | |

## E. System / errors

| Route | React | Note |
|-------|--------|------|
| `/blocked-project/:pslug/` | same | |
| `/error` | `/error` | |
| `/not-found` | `/not-found` | **Compared** (copy) |
| `/permission-denied` | same | **Compared** (copy) |
| `*` (otherwise) | `*` → `NotFound` | |

---

## Pages visited in this audit

**Static (both apps, no backend):** login, discover, discover search, forgot password, not-found, permission denied, error, feedback, external-apps (shell).

**With backend (not run here):** home after login, projects listing, all `/project/...` routes, user settings, notifications, CRUD — follow `web-react/e2e/*.spec.ts` when Taiga Docker + gateway is up.

**Unreachable in this environment:** any route requiring live `conf.json` merge + API and seeded data (same limitation as a login-blocked audit would narrow to the login surface; here the login surface plus several static shells was still compared).

---

## Totals

- **Route entries in inventory:** 70+ (including nested admin, wiki, and detail routes).
- **Distinction:** one **missing public route in React** (`/register` not wired). Several **simplified** React routes (e.g. project transfer placeholder, some admin/contrib paths).
