# Angular (Taiga) page inventory — `app/coffee/app.coffee`

This inventory lists every `$routeProvider.when` route in the reference Angular app. The React port (`web-react/`) currently exposes a single Vite page (scaffold), so project-scoped and most authenticated UIs are **not reachable in React**; those entries note **React: unreachable (scaffold)**.

Reachability legend:
- **Public**: no `requiresLogin` in route; reachable without session (some need tokens in path).
- **Auth**: `access.requiresLogin: true` or project slug required.
- **Gated**: shown only if `taigaConfig.publicRegisterEnabled` (e.g. `/register`).

| Route | Area | Auth / notes | How to open (Angular) | React (this repo) |
| --- | --- | --- | --- | --- |
| `/` | Home / dashboard | Public | Landing after load | Unreachable: no router |
| `/discover` | Discover home | Public | Direct URL or nav | Unreachable: no route |
| `/discover/search` | Discover search | Public | From discover search | Unreachable: no route |
| `/projects/` | My projects | `requiresLogin` | After login, sidebar | Unreachable: no route |
| `/project/new` | Create project | Public (wizard) | New project | Unreachable: no route |
| `/project/new/scrum` | Create Scrum project | Public | Sub-step | Unreachable: no route |
| `/project/new/kanban` | Create Kanban project | Public | Sub-step | Unreachable: no route |
| `/project/new/duplicate` | Duplicate project | Public | Sub-step | Unreachable: no route |
| `/project/new/import/:platform?` | Import project | Public | Sub-step | Unreachable: no route |
| `/project/:pslug/` | Project hub / router | Auth (project) | From projects list | Unreachable: no route |
| `/project/:pslug/timeline` | Project timeline | Auth | Project menu | Unreachable: no route |
| `/project/:pslug/t/:ref` | Item by ref | Auth | Link | Unreachable: no route |
| `/project/:pslug/search` | Project search | Auth | Project search | Unreachable: no route |
| `/project/:pslug/epics` | Epics | Auth | Project sidebar | Unreachable: no route |
| `/project/:pslug/epic/:epicref` | Epic detail | Auth | From epics | Unreachable: no route |
| `/project/:pslug/backlog` | Backlog | Auth | Project sidebar | Unreachable: no route |
| `/project/:pslug/kanban` | Kanban | Auth | Project sidebar | Unreachable: no route |
| `/project/:pslug/taskboard/:sslug` | Sprint taskboard | Auth | From backlog | Unreachable: no route |
| `/project/:pslug/us/:usref` | User story | Auth | From board/backlog | Unreachable: no route |
| `/project/:pslug/task/:taskref` | Task | Auth | From board | Unreachable: no route |
| `/project/:pslug/wiki` | Wiki | Redirects to `.../wiki/home` | — | Unreachable: no route |
| `/project/:pslug/wiki-list` | Wiki list | Auth | Wiki | Unreachable: no route |
| `/project/:pslug/wiki/:slug` | Wiki page | Auth | From wiki | Unreachable: no route |
| `/project/:pslug/team` | Team | Auth | Project sidebar | Unreachable: no route |
| `/project/:pslug/issues` | Issues | Auth | Project sidebar | Unreachable: no route |
| `/project/:pslug/issue/:issueref` | Issue detail | Auth | From issues | Unreachable: no route |
| `/project/:pslug/admin/project-profile/details` | Admin: project profile | Auth + admin | Project settings | Unreachable: no route |
| `/project/:pslug/admin/project-profile/default-values` | Admin: defaults | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-profile/modules` | Admin: modules | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-profile/export` | Admin: export | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-profile/reports` | Admin: reports | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/status` | Admin: status values | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/points` | Admin: points | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/priorities` | Admin: priorities | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/severities` | Admin: severities | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/types` | Admin: types | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/custom-fields` | Admin: custom fields | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/tags` | Admin: tags | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/due-dates` | Admin: due dates | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/project-values/kanban-power-ups` | Admin: Kanban power-ups | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/memberships` | Admin: members | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/roles` | Admin: roles | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/third-parties/webhooks` | Webhooks | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/third-parties/github` | GitHub | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/third-parties/gitlab` | GitLab | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/third-parties/bitbucket` | Bitbucket | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/third-parties/gogs` | Gogs | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/admin/contrib/:plugin` | Contrib admin | Auth + admin | — | Unreachable: no route |
| `/project/:pslug/transfer/:token` | Project transfer | Token in URL | Email link | Unreachable: no route |
| `/user-settings/user-profile` | User profile settings | `requiresLogin` (typical) | User menu | Unreachable: no route |
| `/user-settings/user-change-password` | Change password | Auth | Settings | Unreachable: no route |
| `/user-settings/user-project-settings` | Per-project notif. | Auth | Settings | Unreachable: no route |
| `/user-settings/mail-notifications` | Mail notifications | Auth | Settings | Unreachable: no route |
| `/user-settings/live-notifications` | Live notifications | Auth | Settings | Unreachable: no route |
| `/user-settings/web-notifications` | Web notifications | Auth | Settings | Unreachable: no route |
| `/user-settings/contrib/:plugin` | Contrib user settings | Auth | Settings | Unreachable: no route |
| `/change-email/:email_token` | Change email (token) | Token | Email link | Unreachable: no route |
| `/verify-email/:email_token` | Verify email | Token | Email link | Unreachable: no route |
| `/cancel-account/:cancel_token` | Cancel account | Token | Email link | Unreachable: no route |
| `/profile` | My profile | `requiresLogin` | User menu | Unreachable: no route |
| `/notifications` | Notifications | `requiresLogin` | Bell / nav | Unreachable: no route |
| `/profile/:slug` | Public profile | Public | Link | Unreachable: no route |
| `/login` | Login | Public | `/login` | Single-page app: only generic scaffold at `/` (no login UI parity) |
| `/register` | Register | Gated by config | When enabled | Unreachable: no route |
| `/forgot-password` | Password recovery | Public | From login | Unreachable: no route |
| `/change-password/:token` | Set password (recovery) | Token in URL | Email link | Unreachable: no route |
| `/invitation/:token` | Accept invite | Token | Email link | Unreachable: no route |
| `/external-apps` | External apps | Public | — | Unreachable: no route |
| `/blocked-project/:pslug/` | Blocked project message | Project context | — | Unreachable: no route |
| `/error` | Generic error | Public | — | Unreachable: no route |
| `/not-found` | 404 | Public | — | Unreachable: no route |
| `/permission-denied` | 403 | Public | — | Unreachable: no route |

**Visited in this audit (browser):** `/` and `/login` on Angular; `/` on React (scaffold) while backend (optional) was used for conf/API from Angular.

**Visits blocked by missing React implementation:** all project, settings, discover, and auth routes except the root URL (scaffold has no per-route UI).

## Self-check (coverage vs. CSV)

- Each inventory row is either compared where the React app exposes a URL (here: root only shows scaffold; login route absent on React) or noted **unreachable in React** above.
- Findings in `migration-audit-results.csv` are drawn from Playwright tests that pass on Angular and fail on React for the asserted gap.
