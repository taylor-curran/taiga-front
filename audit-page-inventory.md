# Angular-to-React migration audit — page inventory

Source: Angular routes from `app/coffee/app.coffee` (`$routeProvider`). React scope in this repo: `web-react` admin/auth shell (`web-react/src/routes/adminRouter.tsx`, `adminRoutePaths.ts`).

**How to run the apps**

- Angular (reference): `nvm use 16.19.1 && npm start` → `http://localhost:9001/` (gulp + express).
- React (migration): `nvm use 22 && npm run react` → `http://localhost:5173/` (Vite).

**API for authenticated Angular parity checks:** With Taiga Docker + `npm run taiga-seed`, the API is typically `http://localhost:9000/api/v1/` and sample projects use slugs `project-1` … `project-7` (not `scrum`). The React scaffold still uses `scrum` as `DEMO_PROJECT_SLUG` for URLs.

**Legend**

- **Reachable in React**: Route exists in `adminRouter` or is explicitly redirected.
- **Not in React port**: No equivalent route or UI in `web-react` (full Taiga product surface).

---

## A. Public / marketing / discovery (Angular)

| Path | Purpose | Auth | Reachable in React |
|------|---------|------|---------------------|
| `/` | Home / dashboard | Optional (features gated) | **Partial** — React `/` redirects to project admin placeholder |
| `/discover` | Discover home | No | No |
| `/discover/search` | Discover search | No | No |
| `/login` | Login | No | Yes (`/login`) |
| `/register` | Register (if `publicRegisterEnabled`) | No | Yes (pattern); not gated in scaffold |
| `/forgot-password` | Password recovery request | No | Yes |
| `/change-password/:token` | Set password from recovery | No | Yes |
| `/invitation/:token` | Accept invitation | No | Yes |
| `/external-apps` | External app handoff | No | No |

## B. Authenticated — “My workspace” (Angular)

| Path | Purpose | Auth | Reachable in React |
|------|---------|------|---------------------|
| `/projects/` | My projects listing | Login | No |
| `/profile` | Current user profile | Login | Yes (`/profile`, shell layout) |
| `/profile/:slug` | Public profile by slug | Mixed | Yes (`/profile/:slug`) |
| `/notifications` | Notifications | Login | Yes (`/notifications`) |

## C. Project workspace (Angular)

| Path | Purpose | Auth | Reachable in React |
|------|---------|------|---------------------|
| `/project/new` | Create project hub | Mixed | No |
| `/project/new/scrum` | New Scrum project | Mixed | No |
| `/project/new/kanban` | New Kanban project | Mixed | No |
| `/project/new/duplicate` | Duplicate project | Mixed | No |
| `/project/new/import/:platform?` | Import project | Mixed | No |
| `/project/:pslug/` | Project router / default section | Login + membership | No (React only mounts admin subtree under `/project/:pslug/...`) |
| `/project/:pslug/timeline` | Project timeline | Login | No |
| `/project/:pslug/t/:ref` | Task ref detail | Login | No |
| `/project/:pslug/search` | Project search | Login | No |
| `/project/:pslug/epics` | Epics | Login | No |
| `/project/:pslug/epic/:epicref` | Epic detail | Login | No |
| `/project/:pslug/backlog` | Backlog | Login | No |
| `/project/:pslug/kanban` | Kanban board | Login | No |
| `/project/:pslug/taskboard/:sslug` | Sprint taskboard | Login | No |
| `/project/:pslug/us/:usref` | User story detail | Login | No |
| `/project/:pslug/task/:taskref` | Task detail | Login | No |
| `/project/:pslug/wiki` | Wiki (redirects to `wiki/home`) | Login | No |
| `/project/:pslug/wiki-list` | Wiki list | Login | No |
| `/project/:pslug/wiki/:slug` | Wiki page | Login | No |
| `/project/:pslug/team` | Team | Login | No |
| `/project/:pslug/issues` | Issues list | Login | No |
| `/project/:pslug/issue/:issueref` | Issue detail | Login | No |
| `/project/:pslug/transfer/:token` | Project transfer | Login | No |
| `/blocked-project/:pslug/` | Blocked project notice | Mixed | No |

## D. Project admin (Angular) — mirrored in React

Base: `/project/:pslug/admin/...`. React uses the same path patterns under `AuthGuard` + `ProjectAdminLayout`. Sample slug in React docs: `scrum` (`DEMO_PROJECT_SLUG`).

| Path pattern | Section (Angular) | Reachable in React |
|--------------|-------------------|---------------------|
| `.../admin/project-profile/details` | Project details | Yes |
| `.../admin/project-profile/default-values` | Default values | Yes |
| `.../admin/project-profile/modules` | Modules | Yes |
| `.../admin/project-profile/export` | Export | Yes |
| `.../admin/project-profile/reports` | Reports | Yes |
| `.../admin/project-values/status` | Statuses | Yes |
| `.../admin/project-values/points` | Points | Yes |
| `.../admin/project-values/priorities` | Priorities | Yes |
| `.../admin/project-values/severities` | Severities | Yes |
| `.../admin/project-values/types` | Types | Yes |
| `.../admin/project-values/custom-fields` | Custom fields | Yes |
| `.../admin/project-values/tags` | Tags | Yes |
| `.../admin/project-values/due-dates` | Due dates | Yes |
| `.../admin/project-values/kanban-power-ups` | Kanban power-ups | Yes |
| `.../admin/memberships` | Members | Yes |
| `.../admin/roles` | Roles | Yes |
| `.../admin/third-parties/webhooks` | Webhooks | Yes |
| `.../admin/third-parties/github` | GitHub | Yes |
| `.../admin/third-parties/gitlab` | GitLab | Yes |
| `.../admin/third-parties/bitbucket` | Bitbucket | Yes |
| `.../admin/third-parties/gogs` | Gogs | Yes |
| `.../admin/contrib/:plugin` | Contrib plugin host | Yes |

Angular admin nav is grouped (Project → Attributes → …). React sidebar exposes a **flat** list of leaf routes (different IA).

## E. User settings (Angular) — mirrored in React

Base `/user-settings/...`. React: same child paths under `UserSettingsLayout`.

| Path | Reachable in React |
|------|---------------------|
| `/user-settings/user-profile` | Yes |
| `/user-settings/user-change-password` | Yes |
| `/user-settings/user-project-settings` | Yes |
| `/user-settings/mail-notifications` | Yes |
| `/user-settings/live-notifications` | Yes |
| `/user-settings/web-notifications` | Yes |
| `/user-settings/contrib/:plugin` | Yes |

## F. Account tokens / email (Angular)

| Path | Reachable in React |
|------|---------------------|
| `/change-email/:email_token` | Yes |
| `/verify-email/:email_token` | Yes |
| `/cancel-account/:cancel_token` | Yes |

## G. Errors (Angular)

| Path | Reachable in React |
|------|---------------------|
| `/error` | No |
| `/not-found` | No dedicated page (browser / router) |
| `/permission-denied` | No |

---

## Coverage notes (this audit pass)

- **Visited in both apps (UI smoke):** `/login`, `/forgot-password`, `/register`, `/project/scrum/admin/project-profile/details`, `/project/scrum/admin/project-values/status`, `/project/scrum/admin/memberships`, `/user-settings/user-profile`, `/user-settings/mail-notifications`, `/profile`, `/notifications`, React `/` (redirect).
- **Angular only (no React route in this port):** home `/`, discover, all non-admin project sections (backlog, kanban, issues, wiki, team, epics, detail refs, search, create/import flows), `/projects/`, `/external-apps`, error pages.
- **React-only / structural:** global header with “Admin (React port)” and jump links; default `/` → admin deep link; placeholder “Port pending” copy on every admin/settings screen.

Inventory row count (sections A–G): **60+** distinct route entries when counting parameterized routes once each.
