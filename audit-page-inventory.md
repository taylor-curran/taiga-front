# Angular-to-React migration audit — page inventory

This inventory is derived from `app/coffee/app.coffee` (`$routeProvider`) for the **Angular reference** and from `web-react/src/routes/adminRouter.tsx` + `web-react/src/routes/adminRoutePaths.ts` for the **React admin/auth slice** in this repository.

**How this audit was exercised:** Angular was served from a local build of `dist/` with a small same-origin mock API (see `e2e-comparison/scripts/mock-taiga-api.mjs`). React was served via Vite on port 5173 with `conf.json` pointing the API at that mock. Credentials for authenticated flows: `admin` / `adminpass`.

---

## Legend

| Column | Meaning |
|--------|---------|
| **Route** | URL path pattern |
| **Angular** | Present in Angular routing |
| **React** | Present in React routing (may be placeholder) |
| **Auth** | `public` = no login; `login` = requires session |
| **Reach notes** | How the page was opened during the audit |

---

## Global and marketing / discovery (Angular)

| Route | Angular | React | Auth | Reach notes |
|-------|---------|-------|------|-------------|
| `/` | Yes | Redirect only | login for full home | Angular: dashboard after login. React: redirects to `/project/scrum/admin/project-profile/details`. |
| `/discover` | Yes | No | public | Not in React router. |
| `/discover/search` | Yes | No | public | Not in React router. |
| `/projects/` | Yes | No | login | Not in React router. |
| `/profile` | Yes | Yes (shell) | login | Angular: profile. React: guarded shell + placeholder under `web-react` admin slice. |
| `/profile/:slug` | Yes | Yes (shell) | public | React route exists; content is placeholder in this slice. |
| `/notifications` | Yes | Yes (shell) | login | React route exists; placeholder. |

---

## Project lifecycle (Angular) — not in React admin slice

| Route | Angular | React | Auth | Reach notes |
|-------|---------|-------|------|-------------|
| `/project/new` | Yes | No | varies | Create project wizard. |
| `/project/new/scrum` | Yes | No | varies | |
| `/project/new/kanban` | Yes | No | varies | |
| `/project/new/duplicate` | Yes | No | varies | |
| `/project/new/import/:platform?` | Yes | No | varies | |
| `/project/:pslug/` | Yes | No | login | Project router → homepage. |
| `/project/:pslug/timeline` | Yes | No | login | |
| `/project/:pslug/t/:ref` | Yes | No | login | Generic ref deep link. |
| `/project/:pslug/search` | Yes | No | login | |
| `/project/:pslug/epics` | Yes | No | login | |
| `/project/:pslug/epic/:epicref` | Yes | No | login | |
| `/project/:pslug/backlog` | Yes | No | login | |
| `/project/:pslug/kanban` | Yes | No | login | |
| `/project/:pslug/taskboard/:sslug` | Yes | No | login | |
| `/project/:pslug/us/:usref` | Yes | No | login | |
| `/project/:pslug/task/:taskref` | Yes | No | login | |
| `/project/:pslug/wiki` → `/wiki/home` | Yes | No | login | |
| `/project/:pslug/wiki-list` | Yes | No | login | |
| `/project/:pslug/wiki/:slug` | Yes | No | login | |
| `/project/:pslug/team` | Yes | No | login | |
| `/project/:pslug/issues` | Yes | No | login | |
| `/project/:pslug/issue/:issueref` | Yes | No | login | |
| `/project/:pslug/transfer/:token` | Yes | No | login | |
| `/blocked-project/:pslug/` | Yes | No | varies | |

**React coverage note:** The PR under audit implements **auth + admin shell + placeholders** only. All Scrum/Kanban/Issue/Wiki/Team/Search routes above are **missing functionality** relative to full Taiga Angular; they were listed for inventory completeness and were **not** individually opened in React during this pass (React app has no routes for them).

---

## Auth (Angular + React)

| Route | Angular | React | Auth | Reach notes |
|-------|---------|-------|------|-------------|
| `/login` | Yes | Yes | public | Compared in detail (Playwright). |
| `/register` | Yes (if `publicRegisterEnabled`) | Yes | public | Compared. |
| `/forgot-password` | Yes | Yes | public | Compared. |
| `/change-password/:token` | Yes | Yes | public | Compared with dummy token. |
| `/invitation/:token` | Yes | Yes | public | Compared with mock token. |
| `/change-email/:email_token` | Yes | Yes | public | Not deep-audited in this run (token flow). |
| `/verify-email/:email_token` | Yes | Yes | public | Not deep-audited in this run. |
| `/cancel-account/:cancel_token` | Yes | Yes | public | Not deep-audited in this run. |
| `/external-apps` | Yes | No | varies | Not in React. |

---

## User settings (Angular + React shell)

Parent: `/user-settings/...` — React nests under `/user-settings` layout.

| Route | Angular | React | Auth | Reach notes |
|-------|---------|-------|------|-------------|
| `/user-settings/user-profile` | Yes | Yes | login | Visited both apps with seeded session (Angular: real login; React: store seed). |
| `/user-settings/user-change-password` | Yes | Yes | login | In inventory; spot-checked via nav existence. |
| `/user-settings/user-project-settings` | Yes | Yes | login | |
| `/user-settings/mail-notifications` | Yes | Yes | login | |
| `/user-settings/live-notifications` | Yes | Yes | login | |
| `/user-settings/web-notifications` | Yes | Yes | login | |
| `/user-settings/contrib/:plugin` | Yes | Yes | login | Plugin-dependent; not exercised. |

---

## Project administration (Angular + React)

Base: `/project/:pslug/admin/...` — React mirrors patterns under `projectAdminRoutes`.

| Route | Angular | React | Auth | Reach notes |
|-------|---------|-------|------|-------------|
| `.../admin/project-profile/details` | Yes | Yes | login + admin gate | Visited both. |
| `.../admin/project-profile/default-values` | Yes | Yes | login + admin | Visited both. |
| `.../admin/project-profile/modules` | Yes | Yes | login + admin | Visited both. |
| `.../admin/project-profile/export` | Yes | Yes | login + admin | Visited both. |
| `.../admin/project-profile/reports` | Yes | Yes | login + admin | Visited both. |
| `.../admin/project-values/status` | Yes | Yes | login + admin | Visited both. |
| `.../admin/project-values/points` | Yes | Yes | login + admin | Visited both. |
| `.../admin/project-values/priorities` | Yes | Yes | login + admin | In inventory; same placeholder pattern. |
| `.../admin/project-values/severities` | Yes | Yes | login + admin | In inventory. |
| `.../admin/project-values/types` | Yes | Yes | login + admin | In inventory. |
| `.../admin/project-values/custom-fields` | Yes | Yes | login + admin | In inventory. |
| `.../admin/project-values/tags` | Yes | Yes | login + admin | Visited both. |
| `.../admin/project-values/due-dates` | Yes | Yes | login + admin | In inventory. |
| `.../admin/project-values/kanban-power-ups` | Yes | Yes | login + admin | In inventory. |
| `.../admin/memberships` | Yes | Yes | login + admin | Visited both. |
| `.../admin/roles` | Yes | Yes | login + admin | Visited both. |
| `.../admin/third-parties/webhooks` | Yes | Yes | login + admin | Visited both. |
| `.../admin/third-parties/github` | Yes | Yes | login + admin | Visited both. |
| `.../admin/third-parties/gitlab` | Yes | Yes | login + admin | In inventory. |
| `.../admin/third-parties/bitbucket` | Yes | Yes | login + admin | In inventory. |
| `.../admin/third-parties/gogs` | Yes | Yes | login + admin | In inventory. |
| `.../admin/contrib/:plugin` | Yes | Yes | login + admin | In inventory. |

---

## Error pages (Angular)

| Route | Angular | React | Auth | Reach notes |
|-------|---------|-------|------|-------------|
| `/error` | Yes | No | public | |
| `/not-found` | Yes | Yes | public | React: `/not-found` + catch-all redirect. |
| `/permission-denied` | Yes | No | public | |

---

## Inventory count sanity

- **Angular-only project workspace routes** listed: 25+ (backlog, kanban, issues, wiki, etc.).
- **Shared auth + user settings + admin** routes audited in Playwright: **54** automated checks (see `e2e-comparison/specs/`).
- **React unreachable in this session:** all `/discover`, `/projects/`, and in-project non-admin URLs (no routes).
