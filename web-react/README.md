# taiga-front · React port

This is a React/TypeScript port of the AngularJS Taiga front-end. The
AngularJS source under `../app/` is the read-only spec. This app talks to the
same `taiga-back` + `taiga-events` API surface served by the
[`taiga-docker`](https://github.com/taylor-curran/taiga-docker) reference stack
on `http://localhost:9000`.

## Stack

| Concern        | Choice                              |
| -------------- | ----------------------------------- |
| Build / dev    | Vite                                |
| Routing        | `react-router-dom` v7               |
| State          | `zustand`                           |
| Data fetching  | `@tanstack/react-query`             |
| HTTP client    | `axios`                             |
| Styling        | Tailwind CSS                        |
| Realtime       | Native `WebSocket` (mirrors `tgEvents`) |
| Tests (unit)   | Vitest + React Testing Library      |
| Tests (e2e)    | Playwright (Chromium)               |

The Vite dev server proxies the same paths the AngularJS app uses
(`/conf.json`, `/api`, `/events`, `/media`, `/static`) to the gateway. The
React app reads `/conf.json` exactly like the AngularJS bootstrap does and
opens a WebSocket against `eventsUrl`.

## Routes

Every AngularJS route is implemented in React under the same path:

- `/login`, `/forgot-password`, `/change-password/:token`, `/invitation/:token`,
  `/external-apps`
- `/`, `/discover`, `/discover/search`
- `/projects/`, `/project/new`, `/project/new/scrum`, `/project/new/kanban`,
  `/project/new/duplicate`, `/project/new/import/:platform?`
- `/project/:pslug/`, `/project/:pslug/timeline`, `/project/:pslug/backlog`,
  `/project/:pslug/kanban`, `/project/:pslug/taskboard/:sslug`,
  `/project/:pslug/issues`, `/project/:pslug/issue/:issueref`,
  `/project/:pslug/us/:usref`, `/project/:pslug/task/:taskref`,
  `/project/:pslug/epics`, `/project/:pslug/epic/:epicref`,
  `/project/:pslug/wiki`, `/project/:pslug/wiki/:slug`,
  `/project/:pslug/wiki-list`, `/project/:pslug/team`,
  `/project/:pslug/search`, `/project/:pslug/t/:ref` (ref resolver)
- `/project/:pslug/admin/project-profile/{details,default-values,modules,export,reports}`
- `/project/:pslug/admin/project-values/{status,points,priorities,severities,types,custom-fields,tags,due-dates,kanban-power-ups}`
- `/project/:pslug/admin/{memberships,roles}`
- `/project/:pslug/admin/third-parties/{webhooks,github,gitlab,bitbucket,gogs}`
- `/profile`, `/profile/:slug`, `/notifications`
- `/user-settings/{user-profile,user-change-password,user-project-settings,mail-notifications,live-notifications,web-notifications}`
- `/blocked-project/:pslug/`, `/error`, `/not-found`, `/permission-denied`
- `/change-email/:email_token`, `/verify-email/:email_token`, `/cancel-account/:cancel_token`

## Auth, sessions, refresh tokens

- Login posts to `/api/v1/auth` exactly like the AngularJS app
  (`{ type: 'normal', username, password }`).
- The `auth_token`, `refresh` token and the user payload are persisted in
  `localStorage` under the same keys (`token`, `refresh`, `userInfo`) as the
  AngularJS app — so the AngularJS app and the React port can be swapped in/out
  in the same browser without re-logging in.
- A response interceptor on 401 attempts a `POST /api/v1/auth/refresh` once and
  re-issues the original request, mirroring `authHttpIntercept` in
  `app/coffee/app.coffee`.
- Every request sends the same `X-Session-Id` header the reference does.

## Realtime events (`taiga-events`)

`src/api/events.ts` is a port of `app/coffee/modules/events.coffee`. It opens a
WebSocket against `eventsUrl`, sends `{ cmd: 'subscribe', routing_key }` on
subscribe, drops messages whose `session_id` matches our own (so we don't react
to our own writes), keeps a heartbeat ping/pong, and reconnects with backoff.

Use `useEvents(routingKey, callback)` from any component to subscribe — the hook
takes care of unsubscribing on unmount.

Subscribed routing keys:

- `project.{id}.userstory`, `project.{id}.task`, `project.{id}.issue`,
  `project.{id}.epic`, `project.{id}.milestone`, `project.{id}.wikipage`,
  `project.{id}.timeline`
- `live_notifications.{user_id}`, `web_notifications.{user_id}`

## Local development

The reference stack and the React app boot together via the scripts in the
root `package.json`:

```sh
# from repo root
npm run taiga-up      # start the docker reference stack on :9000
npm run taiga-seed    # idempotent: creates admin/adminpass + sample_data
npm run react         # this app on :5173 (proxies /api, /events to :9000)
```

Sample logins (created by `npm run taiga-seed`):

| user           | password    |
| -------------- | ----------- |
| `admin`        | `adminpass` |
| `user1` … `userN` | `123123`    |

The seed creates 7 sample projects with stories, tasks, issues, wiki pages,
epics and ~10 sample users. All side-by-side parity work in this PR was done
against that seed data.

### Custom gateway image

In environments where the docker daemon and the agent have different
filesystem views, the upstream `taiga-docker` compose file's bind mount of
`./taiga-gateway/taiga.conf` fails. The `scripts/gateway-image/` Dockerfile
bakes the same nginx config into a `taiga-gateway-custom:latest` image and the
local `taiga-docker/docker-compose.yml` is patched to use it. To rebuild after
editing the nginx config:

```sh
DOCKER_HOST=tcp://localhost:2375 docker build -t taiga-gateway-custom:latest scripts/gateway-image
DOCKER_HOST=tcp://localhost:2375 docker compose -f taiga-docker/docker-compose.yml up -d
```

## Scripts

```sh
npm run dev          # vite dev server on :5173
npm run build        # type-check + production build (dist/)
npm run preview      # serve dist/
npm test             # vitest unit tests
npm run e2e          # Playwright e2e (requires gateway + dev server up)
npm run e2e:install  # Playwright browser binaries
```

## Tests

The `e2e/` suite exercises the React app against the live seeded back-end:

- `e2e/auth.spec.ts` – login form happy & sad paths.
- `e2e/projects.spec.ts` – project list, project navigation, every major
  section route renders.
- `e2e/api-parity.spec.ts` – asserts the React port emits the same HTTP
  method + path + body as the AngularJS app for login, list rendering,
  user-story CRUD, and comments.

Unit tests under `src/**/__tests__/` cover the auth store, config loader,
Markdown rendering, avatar rendering, storage wrapper, and date helpers.

Run them all locally with the gateway up:

```sh
npm test          # unit
npm run e2e       # behavioural
```
