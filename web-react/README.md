# Taiga front — React port

This directory holds the React 18 + TypeScript port of the AngularJS 1.5 Taiga
admin dashboard that lives in `app/` (the spec). The app talks to the same
Taiga REST API (`/api/v1`) that the AngularJS reference uses, so both stacks
exercise the same `taiga-back` instance and the same `db.json` of seeded data.

## Stack

| Concern         | Choice                                 |
| --------------- | -------------------------------------- |
| Runtime         | React 18 + Vite + TypeScript           |
| Routing         | `react-router-dom` v6                  |
| Data fetching   | `@tanstack/react-query`                |
| Auth/state      | `zustand` (auth store) + `localStorage`|
| Forms           | `react-hook-form`                      |
| Unit tests      | `vitest` + `@testing-library/react`    |
| E2E tests       | `@playwright/test`                     |

## Scripts

```bash
npm run dev          # Vite dev server on :5173 (proxies /api -> :9000)
npm run build        # tsc -b && vite build
npm run test         # vitest unit/integration suite (jsdom)
npm run test:e2e     # Playwright suite (--project=react|angular|visuals)
```

## Layout

```
src/
  api/              # client, config, storage, shared types
  auth/             # zustand store + react-query hooks
  components/       # Topbar, ProjectShell, RequireAuth, Avatar, StatusPill
  lib/              # format helpers
  pages/            # one folder per top-level area
    auth/           # Login, Register, ForgotPassword, ChangePassword,
                    # Invitation, ChangeEmail, VerifyEmail, CancelAccount
    project/        # Backlog, Kanban, Taskboard, Issues, Team, Timeline,
                    # Wiki, Epics, Search, ItemDetail, Admin (sub-routes)
    projects/       # ProjectsListing, CreateProject (+ scrum/kanban/dup/import)
  projects/         # react-query hooks for project resources
  styles/global.css

tests/
  unit/             # vitest specs (32 tests)
  e2e/              # playwright parity specs against React + Angular
  visuals/          # screenshot capture + demo recording
```

## Routes ported (from `app/coffee/app.coffee`)

Auth & accounts: `/login`, `/register`, `/forgot-password`,
`/change-password/:token`, `/change-email/:email_token`,
`/verify-email/:email_token`, `/cancel-account/:cancel_token`,
`/invitation/:token`, `/external-apps`.

Top-level: `/`, `/discover`, `/discover/search`, `/projects/`,
`/project/new[/scrum|kanban|duplicate|import[/:platform]]`,
`/profile`, `/profile/:slug`, `/notifications`,
`/user-settings/{user-profile,user-change-password,user-project-settings,
mail-notifications,live-notifications,web-notifications,contrib/:plugin}`.

Project: `/project/:pslug/{timeline,search,backlog,kanban,issues,team,
epics,wiki[/:slug],wiki-list,taskboard/:sslug,us/:usref,task/:taskref,
issue/:issueref,epic/:epicref,t/:ref,transfer/:token}`,
plus the full `admin/...` sub-tree (project profile/details, default
values, modules, export, reports; project values for status, points,
priorities, severities, types, custom fields, tags, due dates,
kanban power-ups; memberships; roles; third-parties for webhooks,
github, gitlab, bitbucket, gogs; contrib plugins).

Errors: `/blocked-project/:pslug`, `/error`, `/permission-denied`,
`/not-found` (catch-all).

## Verifying parity

The Angular reference is the `taiga-front` build served by the Taiga
gateway on `:9000`. The React port runs at `:5173`.

```bash
# unit/integration
npm test

# e2e: same actions on both apps, asserting the same HTTP requests
npx playwright test --project=react
npx playwright test --project=angular

# screenshots: writes 15 routes for both apps to docs/screenshots/
npx playwright test --project=visuals -g screenshot
node scripts/compose-screenshots.mjs   # writes side-by-side composites

# demo video: writes docs/video/demo.webm (and demo.mp4 if ffmpeg available)
npx playwright test --project=visuals tests/visuals/demo-video.spec.ts
```

The Playwright suites use the `loginViaApi` helper to obtain an
`auth_token` from the live backend and write it into each app's
own `localStorage` (Angular uses unprefixed keys, React uses the
`taiga.` prefix). They then navigate the UIs and assert the URLs of
the requests that hit `/api/v1`, so both apps must emit the same
`POST /api/v1/auth` body and the same `GET /api/v1/projects?member=…`
query string for the same user action.

## Scope notes

The AngularJS reference is a very large (~525 CoffeeScript files,
~378 Jade templates) frontend with many features whose behavior
goes beyond reading data — notably the full WYSIWYG editor, drag &
drop on the backlog/kanban/taskboard, lightboxes, real-time event
streaming, OAuth-style integrations, attachments upload, voting/
watching widgets, and joyride tutorials. The React port covers
read paths and the most common write paths (status changes,
comments, profile/password updates) and intentionally does not
re-implement WYSIWYG or DnD. The route structure, API contract,
and visible content are however 1:1 with the reference.
