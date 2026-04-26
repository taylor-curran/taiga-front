# Angular → React migration audit — page inventory

**Reference app:** Taiga AngularJS front served by docker gateway at `http://127.0.0.1:9000` (matches `taiga-docker` + seeded API).  
**Migration app:** `web-react/` Vite dev server at `http://127.0.0.1:5173` (branch under PR #26).

**Auth note:** Angular inventory entries that require login were verified after UI login as `admin` / `adminpass` against the seeded stack. React uses a skeleton `AuthGuard` (store defaults to authenticated) and does not implement Taiga credential login.

---

## 1. Global and marketing

| Route | Purpose | Auth | How reached (Angular) | React status |
|-------|---------|------|------------------------|--------------|
| `/` | Home dashboard (logged-in) or redirect | Mixed | Direct; unauthenticated users redirect to discover per `Home` controller | React: redirects to `/project/scrum/admin/project-profile/details` (demo stub) |
| `/discover` | Discover home (featured, most liked/active) | No | Nav / direct URL | **Not implemented** — no route |
| `/discover/search` | Discover search | No | From discover search bar | **Not implemented** |

---

## 2. Authentication and account recovery

| Route | Purpose | Auth | Angular | React |
|-------|---------|------|---------|-------|
| `/login` | Sign in | No | Full form (placeholders, tagline, forgot link, optional register teaser per `conf.json`) | Placeholder page inside `AuthLayout` + global header (no fields) |
| `/register` | Self-registration | No | Only if `publicRegisterEnabled` (false in current docker `conf.json`) | Route exists; placeholder |
| `/forgot-password` | Password recovery request | No | Full copy + form | Placeholder |
| `/change-password/:token` | Set password from email token | No | Template | Placeholder route |
| `/invitation/:token` | Accept invitation | No | Template | Placeholder route |
| `/change-email/:email_token` | Confirm email change | No | Template | Placeholder route |
| `/verify-email/:email_token` | Verify email | No | Template | Placeholder route |
| `/cancel-account/:cancel_token` | Cancel account | No | Template | Placeholder route |
| `/external-apps` | External app handoff | No | Dedicated layout | **Not in React router** |

---

## 3. Projects (workspace level)

| Route | Purpose | Auth | Angular | React |
|-------|---------|------|---------|-------|
| `/projects/` | My projects listing | Yes | Full listing + create CTA | **Not implemented** |

---

## 4. Project creation and import

| Route | Purpose | Auth | React |
|-------|---------|------|-------|
| `/project/new` | Create project hub | No | **Not implemented** |
| `/project/new/scrum` | Scrum wizard | No | **Not implemented** |
| `/project/new/kanban` | Kanban wizard | No | **Not implemented** |
| `/project/new/duplicate` | Duplicate project | No | **Not implemented** |
| `/project/new/import/:platform?` | Import | No | **Not implemented** |

---

## 5. Inside a project (`:pslug` = e.g. `project-1` in seeded data)

| Route | Section | Auth | Angular | React |
|-------|---------|------|---------|-------|
| `/project/:pslug/` | Project router landing | Yes | Resolves to project home | Guarded; timeline and admin child routes only in scaffold |
| `/project/:pslug/timeline` | Project home / timeline + intro + team | Yes | Full `project.jade` | **Partial:** timeline fetch + simplified list; no project intro/team/looking-for-people |
| `/project/:pslug/t/:ref` | Generic ref detail | Yes | Detail router | **Not implemented** |
| `/project/:pslug/search` | Project search | Yes | Full | **Not implemented** |
| `/project/:pslug/epics` | Epics dashboard | Yes | Full | **Not implemented** |
| `/project/:pslug/epic/:epicref` | Epic detail | Yes | Full | **Not implemented** |
| `/project/:pslug/backlog` | Backlog | Yes | Full | **Not implemented** |
| `/project/:pslug/kanban` | Kanban | Yes | Full | **Not implemented** |
| `/project/:pslug/taskboard/:sslug` | Sprint taskboard | Yes | Full | **Not implemented** |
| `/project/:pslug/us/:usref` | User story detail (incl. history WYSIWYG) | Yes | Full | **Not implemented** (React uses dev-only `admin/sample-us-history` slice for parity testing) |
| `/project/:pslug/task/:taskref` | Task detail | Yes | Full | **Not implemented** |
| `/project/:pslug/wiki` | Wiki (redirect) | Yes | Redirect | **Not implemented** |
| `/project/:pslug/wiki-list` | Wiki list | Yes | Full | **Not implemented** |
| `/project/:pslug/wiki/:slug` | Wiki page | Yes | Full | **Not implemented** |
| `/project/:pslug/team` | Team | Yes | Full | **Not implemented** |
| `/project/:pslug/issues` | Issues | Yes | Full | **Not implemented** |
| `/project/:pslug/issue/:issueref` | Issue detail | Yes | Full | **Not implemented** |
| `/project/:pslug/transfer/:token` | Ownership transfer | Yes | Full | **Not implemented** |
| `/project/:pslug/blocked-project` pattern | Blocked project | Yes | Error path | **Not in parity list** |

---

## 6. Project administration (Angular: full CRUD UI; React: mostly placeholders)

All under `/project/:pslug/admin/...`. React enumerates these in `adminRoutePaths.ts`; only **timeline** and **admin/sample-us-history** are implemented beyond `PlaceholderPage`.

Secondary nav groups in Angular: **Project**, **Attributes**, **Members**, **Permissions**, **Integrations** (+ contrib). Tertiary under Project profile: **Project details**, **Presets**, **Modules**, **Export**, **Reports**.

React sidebar uses long `featureLabel` strings instead of the short admin menu labels.

---

## 7. User settings (`/user-settings/...`)

Angular: sidebar with **User Settings**, **Change password**, per-project start pages, **Email notifications**, **Desktop notifications**, **Events**.  
React: same URL patterns exist; each page is a placeholder with different sidebar copy.

---

## 8. Profile and notifications

| Route | Purpose | Auth | React |
|-------|---------|------|-------|
| `/profile` | Current user profile (tabs: timeline, projects, …) | Yes | Placeholder |
| `/profile/:slug` | Public profile | No* | Placeholder |
| `/notifications` | My events list + dismiss | Yes | Placeholder |

---

## 9. Errors

| Route | Angular | React |
|-------|---------|-------|
| `/error`, `/not-found`, `/permission-denied` | Templates | **Not routed** in React scaffold |

---

## Coverage checklist (this audit pass)

Visited or exercised in **Angular** (gateway :9000, seeded): login (+ conditional register), forgot-password, register (when disabled: not-found behavior), discover, home redirect, `/projects/`, project admin details + nav labels, user settings profile nav labels, project timeline (`project-1`), user story `#1` detail with history, notifications, profile.

Visited in **React** (5173): same URL patterns where routed; admin placeholders, timeline (mocked API in tests), sample US history (mocked API in tests), auth placeholders, profile/notifications placeholders.

**Unreachable in React (no route):** `/discover`, `/discover/search`, `/projects/`, `/project/:pslug/us/:ref`, backlog/kanban/issues/wiki/team/search/epics/taskboard, and almost all non-slice admin functionality.
