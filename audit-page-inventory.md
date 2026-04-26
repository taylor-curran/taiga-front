# Angular–React migration audit — page inventory

**Environment:** Taiga API + gateway at `http://localhost:9000` (Docker). Angular reference: static build from `gulp deploy` + `e2e-comparison/scripts/serve-angular.mjs` on `http://127.0.0.1:9001`. React port: Vite on `http://127.0.0.1:5173` (proxy to API). **Admin test user:** `admin` / `adminpass`. **Sample project used in tests:** `project-1` (“Project Example 1”), from seeded data.

This list is derived from `app/coffee/app.coffee` (`$routeProvider`) and `web-react/src/App.tsx` (`<Routes>`). “Visited in BOTH” means: same logical URL was opened in Angular and React during this audit; **note:** some Angular-only behaviors (e.g. dynamic `document.title`) were validated via the Angular app and automated tests; full manual walkthrough of every sub-admin screen in React was not a separate pass after tests were added.

| Route (pattern) | Purpose | Auth | How to reach |
|-----------------|---------|------|--------------|
| `/` | Home / dashboard | Yes | After login, or logo (Angular) / brand link (React) |
| `/login` | Login | No | Unauthenticated or logout |
| `/register` | Public registration (if `publicRegisterEnabled`) | No | Link from login |
| `/forgot-password` | Password recovery | No | Link from login |
| `/change-password/:token` | Set password from email link | No | Email deep link |
| `/invitation/:token` | Accept project invite | No | Email link |
| `/external-apps` | OAuth / external app consent | No (often redirects to login without params) | API-driven |
| `/discover` | Discover homepage (featured, most liked/active in Angular) | Public (React: open; Angular: with nav) | Top nav (when logged in) |
| `/discover/search` | Discover search | Public | Discover → search |
| `/projects/` | My projects | Yes | Top nav “Projects” |
| `/project/new` (+ `/scrum`, `/kanban`, `/duplicate`, `/import`, `/import/:platform`) | Create / duplicate / import project | Yes | “New project” / create flows |
| `/project/:pslug` | Project router (index → timeline in React) | Yes | From project list |
| `/project/:pslug/timeline` | Project timeline | Yes | Default project view |
| `/project/:pslug/t/:ref` | Short link to work item (user story) | Yes | API / notifications |
| `/project/:pslug/search` | In-project search | Yes | Project menu |
| `/project/:pslug/epics` | Epics | Yes | Sidebar |
| `/project/:pslug/epic/:epicref` | Epic detail | Yes | From epics list |
| `/project/:pslug/backlog` | Backlog | Yes | Sidebar |
| `/project/:pslug/kanban` | Kanban | Yes | Sidebar |
| `/project/:pslug/taskboard/:sslug` | Sprint taskboard | Yes | Backlog / sprint |
| `/project/:pslug/us/:usref` | User story detail | Yes | From backlog/kanban |
| `/project/:pslug/task/:taskref` | Task detail | Yes | From story/taskboard |
| `/project/:pslug/wiki` | Redirects to `wiki/home` | Yes | Sidebar |
| `/project/:pslug/wiki-list` | Wiki list (Angular) | Yes | Wiki area |
| `/project/:pslug/wiki/:slug` | Wiki page | Yes | From wiki list |
| `/project/:pslug/team` | Team / memberships view | Yes | Sidebar |
| `/project/:pslug/issues` | Issues list | Yes | Sidebar |
| `/project/:pslug/issue/:issueref` | Issue detail | Yes | From issues |
| `/project/:pslug/admin/...` | Project admin (profile, values, members, roles, third parties) | Yes (admin) | Sidebar “Admin” |
| `/project/:pslug/transfer/:token` | Project ownership transfer | Yes | Email link |
| `/profile` | Current user profile | Yes | User menu / avatar |
| `/profile/:slug` | Public user profile | Varies | From contacts / @mention |
| `/notifications` | In-app notifications | Yes | Top bar |
| `/user-settings` (+ `user-profile`, `user-change-password`, `user-project-settings`, `mail-`, `live-`, `web-` notifications, `contrib/:plugin`) | User settings | Yes | User menu |
| `/change-email/:email_token` | Change email (token) | No | Email link |
| `/verify-email/:email_token` | Verify email | No | Email link |
| `/cancel-account/:cancel_token` | Cancel account | No | Email link |
| `/blocked-project/:pslug` | Blocked project message | Varies | API / project state |
| `/error` | Generic error | No | Error handler |
| `/permission-denied` | 403 | No | Direct URL / guards |
| `/not-found` | 404 (explicit) | No | |
| `*` / unknown | Catch-all 404 | No | Bad URL |

**React-only routes in port:** `Register`, `ForgotPassword` mirror Angular; `BlockedProject`, `GenericError`, `NotFound`, `PermissionDenied` mirror error routes.

**Coverage notes**

- All **public auth** and **error** routes above were loaded in both apps (login, register, forgot, not-found, permission-denied, sample 404 path).
- **Authenticated** flows used `/`, `/projects/`, `/discover`, `/discover/search`, `/project/project-1/*` (timeline, backlog, kanban, epics, issues, team, search, admin subtrees, wiki, taskboard, us/task/issue/epic details), `/profile`, `/notifications`, `/user-settings/user-profile`.
- **Not exhaustively re-opened in React in a second manual pass** after the Playwright suite (same session): every third-party admin screen content (GitLab/Bitbucket/Gogs) beyond title checks; all wiki slugs; all user-settings tabs beyond profile.
