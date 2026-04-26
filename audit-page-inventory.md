# Audit page inventory — Taiga Front (AngularJS reference vs React shell)

Source of Angular routes: `app/coffee/app.coffee` (`$routeProvider.when`).  
React shell: `web-react/src/App.tsx` + `web-react/src/LegacyFrame.tsx` (iframe to `/legacy/...`).

Legend for **Status**: `compared` = visited in both apps during this audit with executable checks; `not started` = not yet compared with automated assertions; `blocked` = comparison blocked by missing credentials, data, or environment for this audit run.

---

## Home (dashboard)

- Route/path: `/`
- Angular source files: `app/modules/home/home.controller.coffee`, `app/partials/home/`
- React source files, if present: `web-react/src/App.tsx` (route), `web-react/src/LegacyFrame.tsx`
- Auth required: no (unauthenticated users redirect to discover in Angular)
- Role/permission gating: none
- How to reach it: open `/` when logged in, or follow app home link
- Backend/API dependencies: user session, project listing APIs when authenticated
- Important UI states to compare: empty vs populated dashboard, joyride hints
- Status: not started
- Notes: Shell document title/meta parity with Angular applies when reached through React (same pattern as `/login` findings).

---

## Discover — home

- Route/path: `/discover`
- Angular source files: `app/modules/discover/discover-home/`
- React source files, if present: `web-react/src/App.tsx`, `LegacyFrame.tsx`
- Auth required: no
- Role/permission gating: none
- How to reach it: navigation “Discover” or direct URL
- Backend/API dependencies: discover listing APIs
- Important UI states to compare: project cards, filters, loading
- Status: compared (document title / shell meta only)
- Notes: Automated check validated translated **top-level** document title on Angular vs React shell.

---

## Discover — search

- Route/path: `/discover/search`
- Angular source files: `app/modules/discover/discover-search/`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: no
- Role/permission gating: none
- How to reach it: discover search UI, query params preserved in iframe URL
- Backend/API dependencies: search API
- Important UI states to compare: results list, empty state, pagination
- Status: not started
- Notes:

---

## My projects listing

- Route/path: `/projects/`
- Angular source files: `app/partials/projects/listing/`
- React source files, if present: `App.tsx` (`/projects/*`), `LegacyFrame.tsx`
- Auth required: yes (`access.requiresLogin`)
- Role/permission gating: authenticated user
- How to reach it: “Projects” in nav when logged in
- Backend/API dependencies: projects API
- Important UI states to compare: list, sorting, empty state
- Status: blocked
- Notes: No authenticated Playwright session in this audit artifact set.

---

## Create project — hub

- Route/path: `/project/new`
- Angular source files: `app/modules/projects/create/`
- React source files, if present: `App.tsx` (`/project/new/*`)
- Auth required: no (creation may require login at submit)
- Role/permission gating: varies by deployment
- How to reach it: “Create project” entry points
- Backend/API dependencies: templates, create APIs
- Important UI states to compare: template selection, errors
- Status: not started
- Notes:

---

## Create project — Scrum template

- Route/path: `/project/new/scrum`
- Angular source files: inline template `<tg-create-project-form type="scrum">` in `app.coffee`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: implied for save
- Role/permission gating: none for form display
- How to reach it: new project flow
- Backend/API dependencies: create project API
- Important UI states to compare: form fields, validation
- Status: not started
- Notes:

---

## Create project — Kanban template

- Route/path: `/project/new/kanban`
- Angular source files: `app.coffee` inline `tg-create-project-form`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: implied for save
- Role/permission gating: none for form display
- How to reach it: new project flow
- Backend/API dependencies: create project API
- Important UI states to compare: form fields, validation
- Status: not started
- Notes:

---

## Create project — duplicate

- Route/path: `/project/new/duplicate`
- Angular source files: `tg-duplicate-project` component tree
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: typically yes
- Role/permission gating: source project access
- How to reach it: duplicate from project menu
- Backend/API dependencies: project read, duplicate API
- Important UI states to compare: project picker, confirmation
- Status: not started
- Notes:

---

## Create project — import

- Route/path: `/project/new/import/:platform?`
- Angular source files: `tg-import-project`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: typically yes
- Role/permission gating: importer flags in `conf.json`
- How to reach it: import wizard entry
- Backend/API dependencies: external importers, project API
- Important UI states to compare: platform steps, errors
- Status: not started
- Notes:

---

## Project router (default project landing)

- Route/path: `/project/:pslug/`
- Angular source files: `ProjectRouter` controller
- React source files, if present: `App.tsx` (`/project/:pslug/*`)
- Auth required: depends on project visibility
- Role/permission gating: membership / public project
- How to reach it: project link
- Backend/API dependencies: project by slug
- Important UI states to compare: redirect to backlog/kanban/wiki default
- Status: not started
- Notes:

---

## Project timeline

- Route/path: `/project/:pslug/timeline`
- Angular source files: `app/modules/projects/project/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: project membership
- How to reach it: project sidebar “Timeline”
- Backend/API dependencies: timeline API
- Important UI states to compare: feed items, filters
- Status: not started
- Notes:

---

## Detail by ref (router)

- Route/path: `/project/:pslug/t/:ref`
- Angular source files: `DetailController`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: project permissions
- How to reach it: cross-link with ref
- Backend/API dependencies: item resolution API
- Important UI states to compare: US/task/issue routing
- Status: not started
- Notes:

---

## Project search

- Route/path: `/project/:pslug/search`
- Angular source files: `app/coffee/modules/search.coffee`, `app/partials/search/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: project permissions
- How to reach it: project search field / URL
- Backend/API dependencies: search API
- Important UI states to compare: filters, results, empty state
- Status: not started
- Notes:

---

## Epics dashboard

- Route/path: `/project/:pslug/epics`
- Angular source files: `app/modules/epics/dashboard/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: epics module enabled
- How to reach it: sidebar Epics
- Backend/API dependencies: epics API
- Important UI states to compare: epic list, filters, create epic
- Status: not started
- Notes:

---

## Epic detail

- Route/path: `/project/:pslug/epic/:epicref`
- Angular source files: `app/modules/epics/`, `app/partials/epic/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: epics module
- How to reach it: epic link from dashboard
- Backend/API dependencies: epic API
- Important UI states to compare: related stories, edit, permissions
- Status: not started
- Notes:

---

## Backlog

- Route/path: `/project/:pslug/backlog`
- Angular source files: `app/coffee/modules/backlog/`, `app/partials/backlog/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: backlog permissions
- How to reach it: sidebar Backlog
- Backend/API dependencies: user stories, milestones APIs
- Important UI states to compare: sprint planning, drag-drop, filters
- Status: not started
- Notes:

---

## Kanban

- Route/path: `/project/:pslug/kanban`
- Angular source files: `app/coffee/modules/kanban/`, `app/partials/kanban/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: kanban enabled
- How to reach it: sidebar Kanban
- Backend/API dependencies: statuses, US APIs
- Important UI states to compare: swimlanes, WIP, drag-drop
- Status: not started
- Notes:

---

## Taskboard (sprint)

- Route/path: `/project/:pslug/taskboard/:sslug`
- Angular source files: `app/coffee/modules/taskboard/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: milestone access
- How to reach it: open sprint from backlog
- Backend/API dependencies: tasks, US, milestone APIs
- Important UI states to compare: task states, bulk ops
- Status: not started
- Notes:

---

## User story detail

- Route/path: `/project/:pslug/us/:usref`
- Angular source files: `app/coffee/modules/userstories/`, `app/partials/us/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: story visibility
- How to reach it: story ref links
- Backend/API dependencies: US API, attachments, comments
- Important UI states to compare: edit, watch, custom fields
- Status: not started
- Notes:

---

## Task detail

- Route/path: `/project/:pslug/task/:taskref`
- Angular source files: `app/coffee/modules/tasks/`, `app/partials/task/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: task visibility
- How to reach it: task ref links
- Backend/API dependencies: task API
- Important UI states to compare: status, assignees, blocking
- Status: not started
- Notes:

---

## Wiki — redirect and pages

- Route/path: `/project/:pslug/wiki` → redirects to `/project/:pslug/wiki/home`
- Angular source files: `app/coffee/modules/wiki/`, `app/partials/wiki/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: wiki module
- How to reach it: sidebar Wiki
- Backend/API dependencies: wiki pages API
- Important UI states to compare: editor, history, links
- Status: not started
- Notes: Includes `/wiki-list` and `/wiki/:slug` routes.

---

## Team

- Route/path: `/project/:pslug/team`
- Angular source files: `app/coffee/modules/team/`, `app/partials/team/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: membership visibility
- How to reach it: sidebar Team
- Backend/API dependencies: memberships API
- Important UI states to compare: roles, invitations
- Status: not started
- Notes:

---

## Issues list

- Route/path: `/project/:pslug/issues`
- Angular source files: `app/coffee/modules/issues/list.coffee`, `app/partials/issue/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: issues module
- How to reach it: sidebar Issues
- Backend/API dependencies: issues API
- Important UI states to compare: filters, bulk edit
- Status: not started
- Notes:

---

## Issue detail

- Route/path: `/project/:pslug/issue/:issueref`
- Angular source files: `app/coffee/modules/issues/detail.coffee`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical member access
- Role/permission gating: issue visibility
- How to reach it: issue ref links
- Backend/API dependencies: issue API
- Important UI states to compare: attachments, watchers, severity
- Status: not started
- Notes:

---

## Admin — project profile (details, defaults, modules, export, reports)

- Route/path: `/project/:pslug/admin/project-profile/details` (and siblings: `default-values`, `modules`, `export`, `reports`)
- Angular source files: `app/coffee/modules/admin/project-profile.coffee`, `app/partials/admin/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: admin / project admin
- How to reach it: project settings → admin sections
- Backend/API dependencies: project settings APIs
- Important UI states to compare: toggles, validation, save errors
- Status: not started
- Notes:

---

## Admin — project values (status, points, priorities, severities, types, custom fields, tags, due dates, kanban power-ups)

- Route/path: `/project/:pslug/admin/project-values/*`
- Angular source files: `app/coffee/modules/admin/project-values.coffee`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: project admin
- How to reach it: admin sidebar subtabs
- Backend/API dependencies: attributes APIs
- Important UI states to compare: CRUD tables, reorder, colors
- Status: not started
- Notes:

---

## Admin — memberships

- Route/path: `/project/:pslug/admin/memberships`
- Angular source files: `app/coffee/modules/admin/memberships.coffee`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: project admin
- How to reach it: admin → members
- Backend/API dependencies: memberships API, invitations
- Important UI states to compare: invite, role change, remove
- Status: not started
- Notes:

---

## Admin — roles

- Route/path: `/project/:pslug/admin/roles`
- Angular source files: `app/coffee/modules/admin/roles.coffee`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: project admin
- How to reach it: admin → roles
- Backend/API dependencies: roles API
- Important UI states to compare: permissions matrix
- Status: not started
- Notes:

---

## Admin — third parties (webhooks, GitHub, GitLab, Bitbucket, Gogs)

- Route/path: `/project/:pslug/admin/third-parties/*`
- Angular source files: `app/coffee/modules/admin/third-parties.coffee`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: project admin
- How to reach it: integrations admin
- Backend/API dependencies: integration APIs
- Important UI states to compare: tokens, test connection, errors
- Status: not started
- Notes:

---

## Admin — contrib plugin slot

- Route/path: `/project/:pslug/admin/contrib/:plugin`
- Angular source files: `app/partials/contrib/main.html`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: plugin-specific
- How to reach it: contrib menu when plugins installed
- Backend/API dependencies: plugin APIs
- Important UI states to compare: plugin UI load failures
- Status: not started
- Notes:

---

## Project transfer

- Route/path: `/project/:pslug/transfer/:token`
- Angular source files: `app/modules/projects/transfer/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes (tokenized flow)
- Role/permission gating: transfer token validity
- How to reach it: email transfer link
- Backend/API dependencies: transfer API
- Important UI states to compare: accept / decline, errors
- Status: not started
- Notes:

---

## User settings — profile

- Route/path: `/user-settings/user-profile`
- Angular source files: `app/partials/user/user-profile.html`
- React source files, if present: `App.tsx` (`/user-settings/*`)
- Auth required: yes
- Role/permission gating: self
- How to reach it: user menu → settings
- Backend/API dependencies: user API
- Important UI states to compare: avatar, bio, theme
- Status: not started
- Notes:

---

## User settings — change password

- Route/path: `/user-settings/user-change-password`
- Angular source files: `app/partials/user/user-change-password.html`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: self
- How to reach it: settings tabs
- Backend/API dependencies: password API
- Important UI states to compare: validation, success message
- Status: not started
- Notes:

---

## User settings — project settings

- Route/path: `/user-settings/user-project-settings`
- Angular source files: `app/partials/user/user-project-settings.html`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: self
- How to reach it: settings tabs
- Backend/API dependencies: notifications per project
- Important UI states to compare: toggles per project
- Status: not started
- Notes:

---

## User settings — mail / live / web notifications

- Route/path: `/user-settings/mail-notifications`, `/user-settings/live-notifications`, `/user-settings/web-notifications`
- Angular source files: `app/partials/user/mail-notifications.html`, etc.
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: self
- How to reach it: settings tabs
- Backend/API dependencies: notification prefs API
- Important UI states to compare: frequency options
- Status: not started
- Notes:

---

## User settings — contrib plugin

- Route/path: `/user-settings/contrib/:plugin`
- Angular source files: `app/partials/contrib/user-settings.html`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: plugin-specific
- How to reach it: settings plugins section
- Backend/API dependencies: plugin APIs
- Important UI states to compare: plugin errors
- Status: not started
- Notes:

---

## Email change / verify / cancel account (token routes)

- Route/path: `/change-email/:email_token`, `/verify-email/:email_token`, `/cancel-account/:cancel_token`
- Angular source files: `app/partials/user/change-email.html`, etc.
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: varies by flow
- Role/permission gating: token validity
- How to reach it: emailed links
- Backend/API dependencies: account APIs
- Important UI states to compare: success, invalid token
- Status: not started
- Notes:

---

## Profile (self)

- Route/path: `/profile`
- Angular source files: `app/modules/profile/`
- React source files, if present: `App.tsx` (`/profile/*`)
- Auth required: yes
- Role/permission gating: self
- How to reach it: user menu → profile
- Backend/API dependencies: user timeline API
- Important UI states to compare: tabs, activity feed
- Status: not started
- Notes:

---

## Profile (public by slug)

- Route/path: `/profile/:slug`
- Angular source files: `app/modules/profile/profile.controller.coffee`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: no
- Role/permission gating: public profile visibility
- How to reach it: username links
- Backend/API dependencies: public profile API
- Important UI states to compare: 404 user, private profile
- Status: not started
- Notes:

---

## Notifications center

- Route/path: `/notifications`
- Angular source files: `app/modules/notifications/`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: yes
- Role/permission gating: self
- How to reach it: bell icon / `/notifications`
- Backend/API dependencies: notifications API
- Important UI states to compare: mark read, filters
- Status: not started
- Notes:

---

## Login

- Route/path: `/login`
- Angular source files: `app/coffee/modules/auth.coffee`, `app/partials/auth/login.jade`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`, `legacyUrls.ts`
- Auth required: no
- Role/permission gating: none
- How to reach it: unauthenticated navigation, `/login`
- Backend/API dependencies: `POST /auth` for submit (not required for static meta checks)
- Important UI states to compare: validation, caps lock hint, errors, **document title and meta**
- Status: compared (shell document title, description, og:title, iframe presence, tg-legacy host)
- Notes: Primary executable evidence row set in `migration-audit-results.csv`.

---

## Register

- Route/path: `/register` (when `publicRegisterEnabled` in config)
- Angular source files: `app/partials/auth/register.jade`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: no
- Role/permission gating: `publicRegisterEnabled`
- How to reach it: login page link when enabled
- Backend/API dependencies: register API
- Important UI states to compare: terms, validation, public register message
- Status: not started
- Notes:

---

## Forgot password

- Route/path: `/forgot-password`
- Angular source files: `app/partials/auth/forgot-password.html`
- React source files, if present: `App.tsx`, `LegacyFrame.tsx`
- Auth required: no
- Role/permission gating: none
- How to reach it: login page “Forgot password”
- Backend/API dependencies: recovery request API
- Important UI states to compare: email validation, success message
- Status: compared (top-level document title only)
- Notes:

---

## Change password from recovery token

- Route/path: `/change-password/:token`
- Angular source files: `app/partials/auth/change-password-from-recovery.html`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: no (token)
- Role/permission gating: token validity
- How to reach it: emailed recovery link
- Backend/API dependencies: password reset API
- Important UI states to compare: invalid token, success redirect
- Status: not started
- Notes:

---

## Invitation accept

- Route/path: `/invitation/:token`
- Angular source files: `app/partials/auth/invitation.html`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: varies
- Role/permission gating: invitation token
- How to reach it: invitation email link
- Backend/API dependencies: invitations API
- Important UI states to compare: accept/decline, logged-in vs logged-out
- Status: not started
- Notes:

---

## External apps

- Route/path: `/external-apps`
- Angular source files: `app/modules/external-apps/`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: flow-dependent
- Role/permission gating: integration
- How to reach it: external app launchers
- Backend/API dependencies: integration APIs
- Important UI states to compare: mobile viewport meta flag (`mobileViewport` route)
- Status: not started
- Notes: Route sets mobile viewport via `tgAppMetaService` in Angular; shell-level parity not covered by current tests.

---

## Blocked project

- Route/path: `/blocked-project/:pslug/`
- Angular source files: `app/partials/projects/project/blocked-project.html`
- React source files, if present: `LegacyFrame.tsx`
- Auth required: typical
- Role/permission gating: blocked_code from API
- How to reach it: API-driven redirect when project blocked
- Backend/API dependencies: project payload with `blocked_code`
- Important UI states to compare: messaging, support link
- Status: not started
- Notes:

---

## Error pages (generic, not found, permission denied)

- Route/path: `/error`, `/not-found`, `/permission-denied`
- Angular source files: `app/partials/error/`
- React source files, if present: `App.tsx`, catch-all `Navigate` to `/not-found`
- Auth required: no
- Role/permission gating: none
- How to reach it: bad links, API 403 flows
- Backend/API dependencies: error interceptors
- Important UI states to compare: copy, navigation actions
- Status: not started
- Notes: React adds explicit `*` → `/not-found` route; Angular uses `$routeProvider.otherwise`.

---

## Catch-all / deep links

- Route/path: unmatched paths (Angular: `otherwise` → not-found template; React: `*` → `/not-found`)
- Angular source files: `app.coffee` `otherwise`
- React source files, if present: `App.tsx` last route
- Auth required: no
- Role/permission gating: none
- How to reach it: unknown path
- Backend/API dependencies: none
- Important UI states to compare: redirect vs inline error handling
- Status: not started
- Notes: Potential navigation difference for unknown routes (not validated with a dedicated test in this audit).

---

## Summary counts

- Total inventory sections above: **40** (Taiga-scale route groups and key states).
- Compared with executable checks in this audit: **3** route groups (`/login`, `/forgot-password`, `/discover`) focused on **host document** shell parity.
- Blocked for deeper UI/data comparison: authenticated project and admin routes (no scripted login + project fixture in this artifact set).
