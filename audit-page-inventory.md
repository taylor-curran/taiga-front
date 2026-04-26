# Audit page inventory — Taiga Front (Angular reference vs React port)

This list is derived from the Angular `$routeProvider` table in `app/coffee/app.coffee` (ngRoute, HTML5 mode). The React app in `web-react/` implements a **subset**: shell routes under `/`, `/projects`, `/project/:pslug/*` (admin patterns only), `/user-settings/*`, and global auth/profile paths from `web-react/src/routes/adminRoutePaths.ts`. Routes below marked **React** are implemented in the port; **Angular only** are reachable in the reference client but not mirrored as product pages in React (SPA may still load an outer shell with an empty outlet).

## How to reach (Angular reference)

- **Base URL**: `http://localhost:9000` when Taiga Docker gateway is used (this audit used `http://127.0.0.1:9000`).
- **Auth**: `POST /api/v1/auth` with `admin` / `adminpass` (sample seed). Client stores `token` and `userInfo` in `localStorage` (see `app/coffee/modules/base/storage.coffee`, `app/coffee/modules/auth.coffee`).
- **Seeded projects** (member `admin`): slugs include `project-1` … `project-7` (API `GET /api/v1/projects?member=<id>`).

## Public / auth (no login required unless noted)

| Path | Purpose | Auth | Reach in Angular | Reach in React |
|------|---------|------|-------------------|----------------|
| `/login` | Email/username + password login; forgot password link | No | Direct | **React**: `/login` (same path). **Note**: `AuthGuard` redirects unauthenticated users to `/auth/login` (no matching route — SPA still loads). |
| `/register` | Self-registration | No | Only if `publicRegisterEnabled` in `conf.json` | Pattern exists in router data; page is placeholder-style via `PlaceholderPage` when reached from defined routes. |
| `/forgot-password` | Request reset email | No | Direct | `/forgot-password` |
| `/change-password/:token` | Set password from email token | No | Email link | `/change-password/:token` |
| `/invitation/:token` | Accept invitation | No | Email link | `/invitation/:token` |
| `/change-email/:email_token` | Confirm email change | No | Email link | `/change-email/:email_token` |
| `/verify-email/:email_token` | Verify email | No | Email link | `/verify-email/:email_token` |
| `/cancel-account/:cancel_token` | Cancel account | No | Email link | `/cancel-account/:cancel_token` |
| `/external-apps` | OAuth / external app handoff | No | Direct | **Angular only** (no React route). |

## Discover / marketing-style

| Path | Purpose | Auth | Reach in Angular | Reach in React |
|------|---------|------|-------------------|----------------|
| `/` | Home dashboard — working on, watching, recent projects | Yes | After login | `/` (implemented `HomeDashboardPage`) |
| `/discover` | Discover home | No | Direct | **Angular only** |
| `/discover/search` | Discover search | No | Direct | **Angular only** |

## Authenticated — global

| Path | Purpose | Auth | Reach in Angular | Reach in React |
|------|---------|------|-------------------|----------------|
| `/projects/` | My projects list, create project, reorder | Yes | Nav / direct | `/projects` (`ProjectsListingPage`) |
| `/profile` | Current user profile tabs | Yes | Direct | `/profile` (placeholder) |
| `/profile/:slug` | Public profile by username | Optional | Direct | `/profile/:slug` (placeholder) |
| `/notifications` | Notification center | Yes | Direct | `/notifications` (placeholder) |

## Project — main app (scrum/kanban/wiki/issues)

| Path | Purpose | Auth | Reach in Angular | Reach in React |
|------|---------|------|-------------------|----------------|
| `/project/new` | Create project wizard entry | No* | Direct | **Angular only** |
| `/project/new/scrum` | Create scrum | No* | Direct | **Angular only** |
| `/project/new/kanban` | Create kanban | No* | Direct | **Angular only** |
| `/project/new/duplicate` | Duplicate project | No* | Direct | **Angular only** |
| `/project/new/import/:platform?` | Import | No* | Direct | **Angular only** |
| `/project/:pslug/` | Project router shell | Yes | From listing | **React**: `/project/:pslug/<admin>` only; bare `/project/x/` not used as product home in port |
| `/project/:pslug/timeline` | Project timeline | Yes | Project menu | **Angular only** |
| `/project/:pslug/t/:ref` | Redirect to US/task/issue by ref | Yes | Deep link | **Angular only** |
| `/project/:pslug/search` | Project search | Yes | Nav | **Angular only** |
| `/project/:pslug/epics` | Epics dashboard | Yes | Nav | **Angular only** |
| `/project/:pslug/epic/:epicref` | Epic detail | Yes | Nav | **Angular only** |
| `/project/:pslug/backlog` | Scrum backlog | Yes | Nav | **Angular only** |
| `/project/:pslug/kanban` | Kanban | Yes | Nav | **Angular only** |
| `/project/:pslug/taskboard/:sslug` | Sprint taskboard | Yes | Nav | **Angular only** |
| `/project/:pslug/us/:usref` | User story detail | Yes | Nav / link | **Angular only** |
| `/project/:pslug/task/:taskref` | Task detail | Yes | Nav / link | **Angular only** |
| `/project/:pslug/wiki` | Redirect to wiki home | Yes | Nav | **Angular only** |
| `/project/:pslug/wiki-list` | Wiki list | Yes | Nav | **Angular only** |
| `/project/:pslug/wiki/:slug` | Wiki page | Yes | Nav | **Angular only** |
| `/project/:pslug/team` | Team | Yes | Nav | **Angular only** |
| `/project/:pslug/issues` | Issues list | Yes | Nav | **Angular only** |
| `/project/:pslug/issue/:issueref` | Issue detail | Yes | Nav | **Angular only** |
| `/project/:pslug/transfer/:token` | Accept project transfer | Yes | Email link | **Angular only** |
| `/blocked-project/:pslug/` | Blocked project message | Yes | When blocked | **Angular only** |

\*Create/import flows are often used logged-in; inventory classifies as “public route” in Angular table without `requiresLogin` on some entries — reachability depends on guard middleware.

## Project — administration (subset ported)

All under `/project/:pslug/` with **admin** prefix (see `adminRoutePaths.ts` for the exact list). Angular renders full Jade templates + controllers; React uses `PlaceholderPage` for most patterns and dedicated listing pages for **members** and **roles**.

| Path pattern | Purpose | Auth (typical) | React |
|--------------|---------|----------------|-------|
| `admin/project-profile/details` | Project details | Project member / admin | Placeholder |
| `admin/project-profile/default-values` | Default values | Admin | Placeholder |
| `admin/project-profile/modules` | Modules on/off | Admin | Placeholder |
| `admin/project-profile/export` | Export | Admin | Placeholder |
| `admin/project-profile/reports` | Reports | Admin | Placeholder |
| `admin/project-values/*` | Statuses, points, priorities, … | Admin | Placeholder |
| `admin/memberships` | Members | Admin | `AdminMembershipsPage` |
| `admin/roles` | Roles & permissions | Admin | `AdminRolesPage` |
| `admin/third-parties/*` | GitHub, GitLab, … | Admin | Placeholder |
| `admin/contrib/:plugin` | Contrib plugin host | Admin | Placeholder |

## User settings

| Path | Purpose | Auth | React |
|------|---------|------|-------|
| `/user-settings/user-profile` | Profile settings | Yes | Placeholder under `UserSettingsLayout` |
| `/user-settings/user-change-password` | Password | Yes | Placeholder |
| `/user-settings/user-project-settings` | Per-project prefs | Yes | Placeholder |
| `/user-settings/mail-notifications` | Email prefs | Yes | Placeholder |
| `/user-settings/live-notifications` | Live prefs | Yes | Placeholder |
| `/user-settings/web-notifications` | Web prefs | Yes | Placeholder |
| `/user-settings/contrib/:plugin` | Contrib | Yes | Placeholder |

## Errors

| Path | Purpose | React |
|------|---------|-------|
| `/error`, `/not-found`, `/permission-denied` | Error pages | **Angular only** (React relies on router fallthrough / blank for unknown paths) |

---

## Audit coverage notes (both apps visited)

- **Angular**: Pages exercised via Playwright against `http://127.0.0.1:9000` with seeded backend; auth primed via API token + `localStorage` consistent with `$tgStorage`.
- **React**: `http://127.0.0.1:5173` with Vite proxy to the same API (`vite.config.ts` proxies `/api` to `127.0.0.1:3000` by default — for this audit, override `VITE_DEV_PROXY_TARGET` to `http://127.0.0.1:9000` so listing pages load against Docker). Token set as **raw** string in `localStorage['token']` per `web-react/src/api/authStorage.ts`.
- **Unreachable parity in React** for this build: discover, project backlog/kanban/issues/wiki/team/timeline, project create/import, external-apps, and dedicated Angular error routes — inventory above marks **Angular only** where no React product route exists.
