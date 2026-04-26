# Audit page inventory (Taiga front)

Sources: Angular `$routeProvider` in `app/coffee/app.coffee`, `web-react/src/routes.tsx`, navigation templates under `app/modules/navigation-bar/`, and spot checks against running dev servers.

Convention: `:pslug` is project slug; other `:param` tokens are route params. React `PlaceholderPage` indicates route exists but UI is explicitly stubbed.

---

## Home (authenticated dashboard)

- Route/path: `/`
- Angular source files: `app/modules/home/home.jade`, `app/modules/home/home.controller.coffee`, `app/coffee/app.coffee` (route `/`)
- React source files: `web-react/src/pages/home/HomeGate.tsx`, `web-react/src/pages/home/HomePage.tsx`
- Auth required: yes (anonymous users redirect to discover in both apps)
- Role/permission gating: none beyond login
- How to reach it: log in as a user with projects; open `/`
- Backend/API dependencies: `users/me`-style home APIs (WIP, projects list)
- Important UI states to compare: empty vs populated working-on; project sidebar
- Status: **compared** (top nav logo only in this audit run)
- Notes: Full dashboard parity not exhaustively compared in tests.

---

## Discover home

- Route/path: `/discover`
- Angular source files: `app/modules/discover/discover-home/discover-home.jade`, `discover-home.controller.coffee`
- React source files: `web-react/src/pages/discover/DiscoverHomePage.tsx`
- Auth required: no
- Role/permission gating: none
- How to reach it: anonymous home redirect or nav Discover
- Backend/API dependencies: public project listing APIs
- Important UI states to compare: featured, most liked/active, search submit
- Status: **compared** (authenticated nav discover icon)
- Notes: Public discover page itself not screenshot-compared in this run beyond nav.

---

## Discover search

- Route/path: `/discover/search` (query: `text`, filters)
- Angular source files: `app/modules/discover/discover-search/*`
- React source files: `web-react/src/pages/discover/DiscoverSearchPage.tsx`
- Auth required: no
- Role/permission gating: none
- How to reach it: search from discover home
- Backend/API dependencies: discover search API
- Important UI states to compare: filters, pagination, empty results
- Status: **not started**
- Notes: —

---

## My projects listing

- Route/path: `/projects/`
- Angular source files: `app/modules/projects/listing/projects-listing.jade`, `projects-listing.controller.coffee`
- React source files: `web-react/src/routes.tsx` → `PlaceholderPage`
- Auth required: yes
- Role/permission gating: none
- How to reach it: top nav “My projects” when logged in
- Backend/API dependencies: user projects list
- Important UI states to compare: reorder, create project CTA, blocked/archived badges
- Status: **compared**
- Notes: React is placeholder-only.

---

## Create project (template chooser)

- Route/path: `/project/new`
- Angular source files: `app/modules/projects/create/create-project.jade`, `create-project.controller.coffee`
- React source files: `web-react/src/routes.tsx` → `PlaceholderPage`
- Auth required: implicit (wizard expects user session)
- Role/permission gating: quota / private project limits in Angular
- How to reach it: nav “New project” or direct URL
- Backend/API dependencies: project create APIs
- Important UI states to compare: scrum vs kanban cards, import/duplicate entry points
- Status: **not started**
- Notes: Automated compare skipped: Angular `CreateProjectCtrl` calls `authService.refresh()` which cleared seeded token in early attempts.

---

## Create project Scrum

- Route/path: `/project/new/scrum`
- Angular source files: `app/coffee/app.coffee` (inline template `tg-create-project-form`)
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: same as create
- How to reach it: from `/project/new` or deep link
- Backend/API dependencies: project create
- Important UI states to compare: full multi-step form
- Status: **not started**
- Notes: —

---

## Create project Kanban

- Route/path: `/project/new/kanban`
- Angular source files: same pattern as scrum
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: same as create
- How to reach it: template chooser or deep link
- Backend/API dependencies: project create
- Important UI states to compare: template-specific defaults
- Status: **not started**
- Notes: —

---

## Duplicate project

- Route/path: `/project/new/duplicate`
- Angular source files: `tg-duplicate-project` component tree
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: project membership for source project
- How to reach it: create flow
- Backend/API dependencies: duplicate API
- Important UI states to compare: project picker, validation
- Status: **not started**
- Notes: —

---

## Import project

- Route/path: `/project/new/import`, `/project/new/import/:platform`
- Angular source files: `tg-import-project`
- React source files: `PlaceholderPage` (both paths)
- Auth required: yes
- Role/permission gating: importer flags in `conf.json`
- How to reach it: create flow
- Backend/API dependencies: importer integrations
- Important UI states to compare: platform steps, OAuth callbacks
- Status: **not started**
- Notes: —

---

## Project root (default section)

- Route/path: `/project/:pslug/` (and `/project/:pslug` in React)
- Angular source files: `ProjectRouter` controller, `project.jade` shell
- React source files: `web-react/src/pages/project/ProjectRootRedirect.tsx` → timeline
- Auth required: yes (typical)
- Role/permission gating: membership, public project read
- How to reach it: project link from listing or discover
- Backend/API dependencies: project detail, homepage resolution
- Important UI states to compare: redirect target (timeline vs user homepage)
- Status: **compared** (timeline shell vs placeholder on React)
- Notes: React always redirects to `/timeline` per `ProjectRootRedirect`.

---

## Project timeline

- Route/path: `/project/:pslug/timeline`
- Angular source files: `app/modules/projects/project/project.jade`, timeline section
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: membership
- How to reach it: project root default
- Backend/API dependencies: timeline API
- Important UI states to compare: events feed, filters, empty
- Status: **compared**
- Notes: React shows migration placeholder.

---

## Project reference detail (generic `t/:ref`)

- Route/path: `/project/:pslug/t/:ref`
- Angular source files: `DetailController` + type-specific detail
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: object visibility
- How to reach it: reference links
- Backend/API dependencies: detail by ref
- Important UI states to compare: US/task/issue routing
- Status: **not started**
- Notes: —

---

## Project search

- Route/path: `/project/:pslug/search`
- Angular source files: `app/partials/search/search.html`, `app/coffee/modules/search.coffee`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: membership
- How to reach it: project menu Search
- Backend/API dependencies: project-scoped search
- Important UI states to compare: tabs, filters, result tables
- Status: **not started**
- Notes: —

---

## Epics dashboard

- Route/path: `/project/:pslug/epics`
- Angular source files: `app/modules/epics/dashboard/*`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: epics module enabled
- How to reach it: project sidebar Epics
- Backend/API dependencies: epics list
- Important UI states to compare: drag order, filters, empty
- Status: **not started**
- Notes: —

---

## Epic detail

- Route/path: `/project/:pslug/epic/:epicref`
- Angular source files: `app/partials/epic/epic-detail.html`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: epics module
- How to reach it: epic link from dashboard
- Backend/API dependencies: epic detail
- Important UI states to compare: related US, status workflow
- Status: **not started**
- Notes: —

---

## Backlog

- Route/path: `/project/:pslug/backlog`
- Angular source files: `app/partials/backlog/backlog.jade`, backlog controllers/directives
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: scrum module
- How to reach it: project sidebar Backlog
- Backend/API dependencies: user stories, milestones, graphs
- Important UI states to compare: burndown, US table, filters, sprint selection
- Status: **compared**
- Notes: React placeholder only.

---

## Kanban board

- Route/path: `/project/:pslug/kanban`
- Angular source files: `app/partials/kanban/kanban.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: kanban module
- How to reach it: project sidebar Kanban
- Backend/API dependencies: kanban swimlanes, US statuses
- Important UI states to compare: drag between columns, WIP limits
- Status: **not started**
- Notes: —

---

## Sprint taskboard

- Route/path: `/project/:pslug/taskboard/:sslug`
- Angular source files: `app/partials/taskboard/*`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: milestone access
- How to reach it: sprint link from backlog
- Backend/API dependencies: milestone tasks/US
- Important UI states to compare: US rows, task expand, status changes
- Status: **not started**
- Notes: —

---

## User story detail

- Route/path: `/project/:pslug/us/:usref`
- Angular source files: `app/partials/us/us-detail.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: membership
- How to reach it: ref links
- Backend/API dependencies: US detail, comments, attachments
- Important UI states to compare: editor, custom fields, watchers
- Status: **not started**
- Notes: —

---

## Task detail

- Route/path: `/project/:pslug/task/:taskref`
- Angular source files: `app/partials/task/task-detail.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: membership
- How to reach it: ref links from US/taskboard
- Backend/API dependencies: task detail
- Important UI states to compare: related US, blocking links
- Status: **not started**
- Notes: —

---

## Wiki home redirect

- Route/path: `/project/:pslug/wiki` → redirects to `/project/:pslug/wiki/home` (Angular)
- Angular source files: `app/coffee/app.coffee` (`redirectTo`), wiki detail
- React source files: `WikiHomeRedirect.tsx` → `/wiki/home` + `PlaceholderPage` on child
- Auth required: yes
- Role/permission gating: wiki module
- How to reach it: project sidebar Wiki
- Backend/API dependencies: wiki pages API
- Important UI states to compare: WYSIWYG, sidebar page list
- Status: **compared**
- Notes: Angular loads real wiki UI; React placeholder after redirect.

---

## Wiki page list

- Route/path: `/project/:pslug/wiki-list`
- Angular source files: `app/partials/wiki/wiki-list.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: wiki module
- How to reach it: wiki nav
- Backend/API dependencies: wiki list
- Important UI states to compare: sort, search, empty
- Status: **not started**
- Notes: —

---

## Wiki page by slug

- Route/path: `/project/:pslug/wiki/:slug`
- Angular source files: `app/partials/wiki/wiki.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: wiki module
- How to reach it: wiki nav links
- Backend/API dependencies: wiki page CRUD
- Important UI states to compare: attachments, history
- Status: **not started**
- Notes: —

---

## Team

- Route/path: `/project/:pslug/team`
- Angular source files: `app/partials/team/team.html`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: membership
- How to reach it: project sidebar Team
- Backend/API dependencies: memberships, roles
- Important UI states to compare: invite, leave, role badges
- Status: **not started**
- Notes: —

---

## Issues list

- Route/path: `/project/:pslug/issues`
- Angular source files: `app/partials/issue/issues.html`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: issues module
- How to reach it: project sidebar Issues
- Backend/API dependencies: issues list API
- Important UI states to compare: filters, bulk ops, empty
- Status: **not started**
- Notes: —

---

## Issue detail

- Route/path: `/project/:pslug/issue/:issueref`
- Angular source files: `app/partials/issue/issues-detail.html`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: membership
- How to reach it: ref links
- Backend/API dependencies: issue detail
- Important UI states to compare: custom fields, votes, related US
- Status: **not started**
- Notes: —

---

## Admin — project profile (details, defaults, modules, export, reports)

- Route/path: `/project/:pslug/admin/project-profile/details` (and sibling routes through `reports`)
- Angular source files: `app/partials/admin/admin-project-*.html`
- React source files: `PlaceholderPage` per route
- Auth required: yes
- Role/permission gating: admin on project
- How to reach it: project settings gear → profile sections
- Backend/API dependencies: project settings APIs
- Important UI states to compare: forms, toggles, export download
- Status: **not started**
- Notes: Five sibling routes inventoried as one product area.

---

## Admin — project values (status, points, priorities, severities, types, custom fields, tags, due dates, kanban power-ups)

- Route/path: `/project/:pslug/admin/project-values/*` (nine sub-routes in Angular)
- Angular source files: `app/partials/admin/admin-project-values-*.html`
- React source files: `PlaceholderPage` each
- Auth required: yes
- Role/permission gating: admin
- How to reach it: settings → values
- Backend/API dependencies: attributes CRUD
- Important UI states to compare: drag reorder, add/edit modals
- Status: **not started**
- Notes: —

---

## Admin — memberships

- Route/path: `/project/:pslug/admin/memberships`
- Angular source files: `app/partials/admin/admin-memberships.html`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: admin
- How to reach it: settings → members
- Backend/API dependencies: memberships API
- Important UI states to compare: invite, resend, remove
- Status: **not started**
- Notes: —

---

## Admin — roles

- Route/path: `/project/:pslug/admin/roles`
- Angular source files: `app/partials/admin/admin-roles.html`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: admin
- How to reach it: settings → roles
- Backend/API dependencies: roles API
- Important UI states to compare: permissions matrix
- Status: **not started**
- Notes: —

---

## Admin — third parties (webhooks, github, gitlab, bitbucket, gogs)

- Route/path: `/project/:pslug/admin/third-parties/*`
- Angular source files: `app/partials/admin/admin-third-parties-*.html`
- React source files: `PlaceholderPage` each
- Auth required: yes
- Role/permission gating: admin + integrations enabled
- How to reach it: settings → integrations
- Backend/API dependencies: integration secrets, webhooks
- Important UI states to compare: connect/disconnect flows
- Status: **not started**
- Notes: —

---

## Admin — contrib plugin slot

- Route/path: `/project/:pslug/admin/contrib/:plugin`
- Angular source files: `app/partials/contrib/main.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: plugin-specific
- How to reach it: contrib menu when plugins installed
- Backend/API dependencies: plugin-defined
- Important UI states to compare: plugin UI surface
- Status: **not started**
- Notes: Depends on `taigaContribPlugins` config.

---

## Project transfer (token)

- Route/path: `/project/:pslug/transfer/:token`
- Angular source files: `app/modules/projects/transfer/*`
- React source files: `PlaceholderPage`
- Auth required: yes (recipient)
- Role/permission gating: transfer token validity
- How to reach it: email link
- Backend/API dependencies: transfer accept/decline
- Important UI states to compare: confirmation, errors
- Status: **not started**
- Notes: —

---

## User settings — profile

- Route/path: `/user-settings/user-profile`
- Angular source files: `app/partials/user/user-profile.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: none
- How to reach it: user menu → settings
- Backend/API dependencies: user profile API
- Important UI states to compare: avatar upload, bio, theme
- Status: **not started**
- Notes: —

---

## User settings — change password

- Route/path: `/user-settings/user-change-password`
- Angular source files: `app/partials/user/user-change-password.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: none
- How to reach it: settings sidebar
- Backend/API dependencies: password change API
- Important UI states to compare: validation, success toast
- Status: **not started**
- Notes: —

---

## User settings — project start pages

- Route/path: `/user-settings/user-project-settings`
- Angular source files: `app/partials/user/user-project-settings.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: none
- How to reach it: settings sidebar
- Backend/API dependencies: per-user project prefs
- Important UI states to compare: per-project homepage selector
- Status: **not started**
- Notes: —

---

## User settings — mail / live / web notifications

- Route/path: `/user-settings/mail-notifications`, `/user-settings/live-notifications`, `/user-settings/web-notifications`
- Angular source files: corresponding `app/partials/user/*.jade`
- React source files: `PlaceholderPage` each
- Auth required: yes
- Role/permission gating: none
- How to reach it: settings sidebar
- Backend/API dependencies: notification prefs APIs
- Important UI states to compare: toggles, frequency, desktop prompt
- Status: **not started**
- Notes: Three routes grouped as one settings area.

---

## Account email change / verify / cancel flows

- Route/path: `/change-email/:email_token`, `/verify-email/:email_token`, `/cancel-account/:cancel_token`
- Angular source files: `app/partials/user/change-email.html`, `verify-email.html`, `cancel-account.html`
- React source files: `PlaceholderPage` each
- Auth required: mixed (tokenized flows)
- Role/permission gating: token validity
- How to reach it: email links from account actions
- Backend/API dependencies: token validation endpoints
- Important UI states to compare: success/error messaging
- Status: **not started**
- Notes: —

---

## User settings — contrib plugin slot

- Route/path: `/user-settings/contrib/:plugin`
- Angular source files: `app/partials/contrib/user-settings.jade`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: plugin-specific
- How to reach it: settings sidebar when contrib installed
- Backend/API dependencies: plugin-defined
- Important UI states to compare: plugin forms
- Status: **not started**
- Notes: —

---

## Profile (self)

- Route/path: `/profile`
- Angular source files: `app/partials/profile/profile.html`, `Profile` controller
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: none
- How to reach it: nav profile when logged in
- Backend/API dependencies: user timeline, stats
- Important UI states to compare: tabs, activity feed
- Status: **not started**
- Notes: —

---

## Notifications inbox

- Route/path: `/notifications`
- Angular source files: `app/partials/notifications/notifications.html`
- React source files: `PlaceholderPage`
- Auth required: yes
- Role/permission gating: none
- How to reach it: bell dropdown → see all
- Backend/API dependencies: notifications API
- Important UI states to compare: mark read, filters, empty
- Status: **not started**
- Notes: —

---

## Public user profile by slug

- Route/path: `/profile/:slug`
- Angular source files: same profile template with `:slug` param
- React source files: `PlaceholderPage`
- Auth required: no (public read)
- Role/permission gating: privacy of user activity
- How to reach it: `@username` style links from team/issues
- Backend/API dependencies: public profile API subset
- Important UI states to compare: contact button, project list
- Status: **not started**
- Notes: —

---

## Login

- Route/path: `/login`
- Angular source files: `app/partials/auth/login.jade`, `login-form.jade`, `app/coffee/modules/auth.coffee` (`LoginPage`)
- React source files: `web-react/src/pages/auth/LoginPage.tsx`
- Auth required: no
- Role/permission gating: `force_login`, `next` query handling
- How to reach it: sign in link or guarded redirect
- Backend/API dependencies: `POST /api/v1/auth`
- Important UI states to compare: branding, field UX, errors, caps lock hint
- Status: **compared**
- Notes: React uses `LOGIN_COMMON.ACTION_FORGOT_PASSWORD` key without locale string (raw key in UI).

---

## Register

- Route/path: `/register` (when `publicRegisterEnabled`)
- Angular source files: `app/partials/auth/register.jade`, `register-form.jade`
- React source files: `RegisterGate.tsx` → `PlaceholderPage`
- Auth required: no
- Role/permission gating: `publicRegisterEnabled` from `conf.json`
- How to reach it: register link on login when enabled
- Backend/API dependencies: `POST` register API
- Important UI states to compare: full registration fields, terms links
- Status: **compared**
- Notes: React shows stub message instead of form.

---

## Forgot password

- Route/path: `/forgot-password`
- Angular source files: `app/partials/auth/forgot-password.jade`, `forgot-form.jade`
- React source files: `PlaceholderPage` with `FORGOT_PASSWORD.PAGE_TITLE`
- Auth required: no
- Role/permission gating: none
- How to reach it: login “Forgot it?” / forgot-password nav
- Backend/API dependencies: password reset request API
- Important UI states to compare: username field, success messaging
- Status: **compared**
- Notes: React omits recovery form entirely.

---

## Change password from recovery token

- Route/path: `/change-password/:token`
- Angular source files: `app/partials/auth/change-password-from-recovery.html`
- React source files: `PlaceholderPage`
- Auth required: no (token proves intent)
- Role/permission gating: token validity
- How to reach it: email recovery link
- Backend/API dependencies: password reset confirm API
- Important UI states to compare: password strength, mismatch errors
- Status: **not started**
- Notes: —

---

## Invitation acceptance

- Route/path: `/invitation/:token`
- Angular source files: `app/partials/auth/invitation.jade`, invitation directives
- React source files: `PlaceholderPage` with `INVITATION.PAGE_TITLE`
- Auth required: mixed (login/register panels on same view)
- Role/permission gating: invitation validity
- How to reach it: invite email link
- Backend/API dependencies: invitation fetch/accept APIs
- Important UI states to compare: project name display, join success
- Status: **not started**
- Notes: —

---

## External application OAuth-style gate

- Route/path: `/external-apps` (expects `application`, `state` query params in Angular controller)
- Angular source files: `app/modules/external-apps/external-app.jade`, `external-app.controller.coffee`
- React source files: `PlaceholderPage` with `EXTERNAL_APP.PAGE_TITLE`
- Auth required: yes for meaningful UI
- Role/permission gating: OAuth client registration
- How to reach it: third-party authorization redirect
- Backend/API dependencies: application token APIs
- Important UI states to compare: authorize/cancel, user card
- Status: **not started**
- Notes: Deep OAuth compare skipped (needs query params + API data).

---

## Blocked project

- Route/path: `/blocked-project/:pslug/`
- Angular source files: `app/partials/projects/project/blocked-project.html`
- React source files: `PlaceholderPage`
- Auth required: typically yes
- Role/permission gating: blocked_code on project
- How to reach it: API returns blocked; router sends user here
- Backend/API dependencies: project payload `blocked_code`
- Important UI states to compare: messaging, support link
- Status: **not started**
- Notes: —

---

## Error / not found / permission denied

- Route/path: `/error`, `/not-found`, `/permission-denied`
- Angular source files: `app/partials/error/*.jade`
- React source files: `routes.tsx` `ErrorPage` → `PlaceholderPage` with `COMMON.GO_HOME` title key
- Auth required: no
- Role/permission gating: none
- How to reach it: bad links or HTTP error handling
- Backend/API dependencies: none directly
- Important UI states to compare: copy, illustration, home CTA
- Status: **not started**
- Notes: React uses generic placeholder component for all three.

---

## Catch-all unknown route

- Route/path: unmatched paths → Angular `otherwise` not-found template; React `Navigate` to `/not-found`
- Angular source files: `app/coffee/app.coffee` (`$routeProvider.otherwise`)
- React source files: `routes.tsx` wildcard
- Auth required: no
- Role/permission gating: none
- How to reach it: arbitrary unknown path
- Backend/API dependencies: none
- Important UI states to compare: 404 messaging
- Status: **not started**
- Notes: —
