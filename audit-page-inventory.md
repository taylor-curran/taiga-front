# Angular app — page and route inventory

Source: `app/coffee/app.coffee` (`$routeProvider` / `ngRoute`). Base URL in dev: `http://localhost:9001/`. The API is expected at `http://localhost:9000` per `conf/conf.example.json` (`taiga-docker` stack).

**Auth notes**

- Routes marked **login required** use `access: { requiresLogin: true }` (only `Projects listing`, `Profile` self-view, and `Notifications` in the config snippet reviewed).
- Other “workspace” routes are still behind the auth interceptor: unauthenticated access typically redirects to `/login?unauthorized&next=…` (see e2e `auth.e2e.js`).
- `/register` is only registered when `window.taigaConfig.publicRegisterEnabled` is true (matches `publicRegisterEnabled` in `conf.json`).

**How to reach (typical nav)**

- Log in → home `/` or discover `/discover` / `/discover/search`.
- Sidebar project links → `/project/:pslug/…` (default project home is routed via `ProjectRouter` from `/project/:pslug/`).
- User menu → user settings under `/user-settings/…`, profile `/profile` or `/profile/:slug`, notifications `/notifications`.
- Project settings → admin routes under `/project/:pslug/admin/…`.

| # | Route pattern | Description | Auth / notes |
|---|---------------|-------------|--------------|
| 1 | `/` | Home / dashboard (working on, watching, projects) | Logged-in experience expected |
| 2 | `/discover` | Discover home | Public |
| 3 | `/discover/search` | Discover search | Public |
| 4 | `/projects/` | My projects listing | `requiresLogin: true` |
| 5 | `/project/new` | Create project (wizard entry) | Public or logged-in (product flow) |
| 6 | `/project/new/scrum` | New Scrum project | Same |
| 7 | `/project/new/kanban` | New Kanban project | Same |
| 8 | `/project/new/duplicate` | Duplicate project | Same |
| 9 | `/project/new/import/:platform?` | Import project | Optional platform segment |
| 10 | `/project/:pslug/` | Project router (resolves default section) | Member / login as needed |
| 11 | `/project/:pslug/timeline` | Project timeline | Authenticated project |
| 12 | `/project/:pslug/t/:ref` | Ref detail (generic) | Deep link |
| 13 | `/project/:pslug/search` | Project search | Project member |
| 14 | `/project/:pslug/epics` | Epics dashboard | Project |
| 15 | `/project/:pslug/epic/:epicref` | Epic detail | Project |
| 16 | `/project/:pslug/backlog` | Backlog | Project |
| 17 | `/project/:pslug/kanban` | Kanban | Project |
| 18 | `/project/:pslug/taskboard/:sslug` | Sprint taskboard | Project |
| 19 | `/project/:pslug/us/:usref` | User story detail | Project |
| 20 | `/project/:pslug/task/:taskref` | Task detail | Project |
| 21 | `/project/:pslug/wiki` | Redirects to `/project/:pslug/wiki/home` | — |
| 22 | `/project/:pslug/wiki-list` | Wiki list | Project |
| 23 | `/project/:pslug/wiki/:slug` | Wiki page | Project |
| 24 | `/project/:pslug/team` | Team | Project |
| 25 | `/project/:pslug/issues` | Issues list | Project |
| 26 | `/project/:pslug/issue/:issueref` | Issue detail | Project |
| 27 | `/project/:pslug/admin/project-profile/details` | Admin: project details | Project admin |
| 28 | `/project/:pslug/admin/project-profile/default-values` | Admin: default values | Project admin |
| 29 | `/project/:pslug/admin/project-profile/modules` | Admin: modules | Project admin |
| 30 | `/project/:pslug/admin/project-profile/export` | Admin: export | Project admin |
| 31 | `/project/:pslug/admin/project-profile/reports` | Admin: reports | Project admin |
| 32 | `/project/:pslug/admin/project-values/status` | Admin: status values | Project admin |
| 33 | `/project/:pslug/admin/project-values/points` | Admin: story points | Project admin |
| 34 | `/project/:pslug/admin/project-values/priorities` | Admin: priorities | Project admin |
| 35 | `/project/:pslug/admin/project-values/severities` | Admin: severities | Project admin |
| 36 | `/project/:pslug/admin/project-values/types` | Admin: types | Project admin |
| 37 | `/project/:pslug/admin/project-values/custom-fields` | Admin: custom fields | Project admin |
| 38 | `/project/:pslug/admin/project-values/tags` | Admin: tags | Project admin |
| 39 | `/project/:pslug/admin/project-values/due-dates` | Admin: due dates | Project admin |
| 40 | `/project/:pslug/admin/project-values/kanban-power-ups` | Admin: kanban power-ups | Project admin |
| 41 | `/project/:pslug/admin/memberships` | Admin: memberships | Project admin |
| 42 | `/project/:pslug/admin/roles` | Admin: roles | Project admin |
| 43 | `/project/:pslug/admin/third-parties/webhooks` | Admin: webhooks | Project admin |
| 44 | `/project/:pslug/admin/third-parties/github` | Admin: GitHub | Project admin |
| 45 | `/project/:pslug/admin/third-parties/gitlab` | Admin: GitLab | Project admin |
| 46 | `/project/:pslug/admin/third-parties/bitbucket` | Admin: Bitbucket | Project admin |
| 47 | `/project/:pslug/admin/third-parties/gogs` | Admin: Gogs | Project admin |
| 48 | `/project/:pslug/admin/contrib/:plugin` | Admin: contrib plugin | Project admin |
| 49 | `/project/:pslug/transfer/:token` | Project transfer | Token in URL |
| 50 | `/user-settings/user-profile` | User profile settings | Logged in |
| 51 | `/user-settings/user-change-password` | Change password | Logged in |
| 52 | `/user-settings/user-project-settings` | Per-project user settings | Logged in |
| 53 | `/user-settings/mail-notifications` | Mail notifications | Logged in |
| 54 | `/user-settings/live-notifications` | Live notifications | Logged in |
| 55 | `/user-settings/web-notifications` | Web notifications | Logged in |
| 56 | `/change-email/:email_token` | Change email (token) | Link from email |
| 57 | `/verify-email/:email_token` | Verify email | Link from email |
| 58 | `/cancel-account/:cancel_token` | Cancel account | Link from email |
| 59 | `/user-settings/contrib/:plugin` | Contrib user settings | Logged in |
| 60 | `/profile` | Current user profile | `requiresLogin: true` |
| 61 | `/notifications` | Notifications center | `requiresLogin: true` |
| 62 | `/profile/:slug` | Public user profile by slug | Public |
| 63 | `/login` | Login | Public; `disableHeader: true` |
| 64 | `/register` | Register | If `publicRegisterEnabled` |
| 65 | `/forgot-password` | Password recovery | Public |
| 66 | `/change-password/:token` | Set password from recovery | Public (token) |
| 67 | `/invitation/:token` | Accept invitation | Public (token) |
| 68 | `/external-apps` | External app page | Public |
| 69 | `/blocked-project/:pslug/` | Blocked project notice | Varies |
| 70 | `/error` | Generic error | — |
| 71 | `/not-found` | 404 | — |
| 72 | `/permission-denied` | 403 | — |
| 73 | *(catch-all)* | Unmatched → `not-found` template | — |

**React app (`web-react/`) in this branch**

- Vite app on `http://localhost:5173/`; only `App.tsx` rendering a single scaffold heading — **no routes, no Taiga UI**. Downstream Angular-equivalent pages are **not implemented** in React; the inventory above documents coverage of the reference app only. Comparison tests treat React as the migration target and record gaps per validated assertion.

**Visited in this audit (both servers where applicable)**

- Angular: visited programmatically in Playwright (login, home, discover, a project path, and spot-checks). Full manual visit of all 70+ permutations is not required by the test harness; **Reachability in React** is N/A for Taiga feature parity until routes exist (see CSV).
