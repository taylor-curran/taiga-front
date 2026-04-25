# taiga-front · React port (scaffold)

Bare Vite + React + TypeScript scaffold. **No migration code.** A future agent races to port the AngularJS app under `../app/` to React inside this directory.

## Pick your own stack

This scaffold is intentionally minimal. The only dependencies are `react`, `react-dom`, `vite`, `@vitejs/plugin-react`, `typescript`, `@types/react`, `@types/react-dom`. Pick your own:

- **Router** (e.g. React Router, TanStack Router)
- **UI / styling** (e.g. Tailwind, Mantine, Chakra, plain CSS)
- **Forms** (e.g. React Hook Form, TanStack Form, Formik)
- **State / data fetching** (e.g. TanStack Query, Redux Toolkit, Zustand, SWR)
- **Test runner** (e.g. Vitest, Jest, Playwright for e2e)

## Reference stack (`taiga-docker`) — the contract

The AngularJS source under `../app/` is a **read-only spec**. Don't run `gulp` or `npm start`. Instead, run the prebuilt reference stack via [`taiga-docker`](https://github.com/taylor-curran/taiga-docker), which the root `package.json` wraps with `taiga-up` / `taiga-down` / `taiga-superuser` / `taiga-logs`.

Once the stack is up, the **taiga-gateway** serves everything on:

```
http://localhost:9000
```

Routes the gateway exposes (and that this Vite dev server proxies in `vite.config.ts`):

| Path         | Purpose                                                  |
| ------------ | -------------------------------------------------------- |
| `/conf.json` | Frontend runtime config (`{ api, eventsUrl, ... }`)       |
| `/api/v1/`   | Self-describing REST root (~80 endpoints)                |
| `/events`    | WebSocket stream from `taiga-events`                     |
| `/media`     | User-uploaded files                                      |
| `/static`    | Static assets served by `taiga-back`                     |

So during `npm run dev` (or root `npm run react`), the React app runs on `http://localhost:5173` and any of those paths transparently round-trip to the gateway.

## Seeded login + sample data

The root `taiga-seed` script (run automatically by the `taiga` terminal) creates:

- **username:** `admin`
- **password:** `adminpass`
- **email:** `admin@example.com`

…and, on a fresh DB only, runs `taiga-manage sample_data` to populate **7 example projects + ~10 example users with stories, tasks, issues, and wiki pages**. The fixture lives in the prebuilt `taigaio/taiga-back` image (`taiga/projects/management/commands/sample_data.py`), so no extra repos are needed. The script no-ops on warm boots (it skips `sample_data` whenever `/api/v1/projects` already returns a non-empty list).

Sample users are `user1` … `userN` (typically up to ~`user10`), all with password `123123` (hard-coded in `sample_data.py`).

Smoke-test login round-trip through the Vite proxy:

```sh
curl -sS -X POST http://localhost:5173/api/v1/auth \
  -H 'Content-Type: application/json' \
  -d '{"type":"normal","username":"admin","password":"adminpass"}'
```

## Routes & feature inventory (where to look in the spec)

AngularJS routing lives in `../app/coffee/`. Enumerate routes with:

```sh
grep -REn "\$routeProvider\.when|\$stateProvider\.state" ../app/coffee/
```

Each route maps to:

- a controller/module under `../app/coffee/modules/<feature>/`
- a Pug template under `../app/partials/<feature>/`

Use those three (route table + module + partial) as the per-screen migration unit.

## Scripts

```sh
npm run dev      # Vite on :5173, proxy to :9000
npm run build    # tsc -b && vite build
npm run preview  # serve dist/
```

From the repo root:

```sh
npm run taiga-up           # start the 8-container reference stack
npm run taiga-seed         # idempotent: superuser + sample_data on a fresh db
npm run taiga-superuser    # just the admin (safe to fail if it exists)
npm run taiga-sample-data  # just sample_data (re-runs unconditionally)
npm run taiga-logs         # tail back-end + events
npm run taiga-down         # stop the stack
npm run react              # this app (proxies to gateway)
```
