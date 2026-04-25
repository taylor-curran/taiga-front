# Taiga React Scaffold

Bare Vite + React + TypeScript scaffold for the Taiga frontend migration.

## Getting started

```sh
npm install
npm run dev      # starts Vite on http://localhost:5173
npm run build    # type-check + production build
```

## Architecture decisions

This is intentionally empty. Pick your own:

- **Router** (React Router, TanStack Router, etc.)
- **UI library** (MUI, Chakra, Tailwind, etc.)
- **Forms** (React Hook Form, Formik, etc.)
- **State management** (Zustand, Jotai, Redux, React Query, etc.)
- **Test runner** (Vitest, Jest, Playwright, etc.)

## Reference stack

The full Taiga reference stack runs via Docker (see root `package.json` scripts).

| Service | URL |
|---------|-----|
| Gateway (reference AngularJS UI + API) | `http://localhost:9000` |
| React dev server | `http://localhost:5173` |

The Vite dev server proxies `/api`, `/events`, `/media`, `/static`, and
`/conf.json` to the gateway so you can develop against the real back-end
without CORS issues.

## Seeded credentials

| Username | Password |
|----------|----------|
| `admin`  | `adminpass` |

Create the superuser with:

```sh
npm run taiga-superuser   # from repo root
```
