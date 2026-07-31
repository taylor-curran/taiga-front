# taiga-front · React port

A first-pass migration of the AngularJS Taiga frontend (`../app/`) to React 18 +
TypeScript. The legacy AngularJS app under `../app/` is **untouched** and still
builds/serves via `npx gulp deploy` — `web-react/` is a sibling that proxies to
the same backend.

## Stack

- **Build**: Vite 5 + TypeScript 5 + `@vitejs/plugin-react`
- **Routing**: `react-router-dom` v6 with all 74 legacy routes mapped (real
  pages where ported, `NotPorted` placeholder cards for the rest so the URL
  space stays complete)
- **Data**: `axios` + `@tanstack/react-query` against `/api/v1/`
- **State**: `zustand` for auth/session, react-query for server state
- **Styling**: Tailwind CSS with a small Taiga-flavoured theme
  (`tailwind.config.js`)
- **Markdown**: `marked` for wiki page rendering
- **Realtime**: minimal `WebSocket` client at `/events`

See `src/` for the full layout. Highlights:

| Path                                  | Purpose                                       |
| ------------------------------------- | --------------------------------------------- |
| `src/lib/config.ts`                   | Runtime `/conf.json` loader                   |
| `src/lib/api.ts`                      | Axios client + auth interceptor + refresh     |
| `src/lib/auth.ts`                     | Zustand auth store (login/logout/me)          |
| `src/lib/events.ts`                   | WebSocket subscription helper                 |
| `src/services/*.ts`                   | API wrappers + react-query hooks              |
| `src/components/Layout/*.tsx`         | App shell, project shell, auth shell          |
| `src/pages/**/*.tsx`                  | One file per route                            |
| `src/routes/index.tsx`                | The full router (74 routes)                   |

## What's actually ported (read-only)

- Auth: `login`, `register`, `forgot-password`, `change-password/:token`,
  `change-email/:token`, `verify-email/:token`, `cancel-account/:token`,
  `invitation/:token`
- Public: home, `discover`, `discover/search`, `projects/`, `profile/:slug`,
  `notifications`, `external-apps`, `error`, `not-found`, `blocked-project/:pslug/`
- Project shell: top-nav + project sidebar + project loader (mirrors the legacy
  `projectLoaded` resolver)
- Project pages: `timeline`, `search`, `epics`, `epic/:epicref`, `backlog`,
  `kanban`, `taskboard/:sslug`, `us/:usref`, `task/:taskref`, `wiki`,
  `wiki-list`, `wiki/:slug`, `team`, `issues`, `issue/:issueref`
- User settings: profile (read-only); other tabs are placeholders

## What's not ported yet

These render a styled "Not yet ported" page, but the URL space is preserved so
follow-up PRs can swap in real pages without touching `routes/index.tsx`:

- All `admin/...` views (project profile, project values, memberships, roles,
  third-party integrations, contrib plugins)
- New project flows (`/project/new/*`)
- Project transfer
- Editing on every entity (drag-drop sprint planning, status transitions, edit
  forms, comments, attachments, custom fields)
- Wiki editor (CKEditor)

## Reference stack

Same as before — see the root `package.json`:

```sh
npm run taiga-up           # start the reference stack on :9000
npm run taiga-seed         # idempotent: superuser + sample_data
npm run react              # this app on :5173 (proxies to :9000)
```

Default credentials: `admin` / `adminpass`. Sample users: `user1`…`userN` /
`123123`.

## Scripts

```sh
npm run dev        # Vite dev server on :5173 (proxies to :9000)
npm run typecheck  # tsc --noEmit
npm run build      # typecheck + vite build → dist/
npm run preview    # serve dist/
```
