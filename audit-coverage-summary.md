# Audit Coverage Summary

## Provenance

- Migration PR: https://github.com/taylor-curran/taiga-front/pull/30
- Audit branch: `cursor/angular-react-migration-audit-31ec`
- Angular commit: `a09cced13207c9fdd9ab24ed079336ec8267de9b`
- React commit: `a09cced13207c9fdd9ab24ed079336ec8267de9b` (same tree as migration branch in this clone)
- Angular URL: `http://localhost:9001` (Playwright `webServer`: `e2e-comparison/scripts/serve-angular-dist.mjs` — serves `dist/` using `TAIGA_VERSION` from `dist/index.html`, avoiding `gulp express` per-process version skew)
- React URL: `http://localhost:5173` (Vite dev: `web-react`, `npm run dev`)
- API/backend URL: `http://localhost:9000` (from `dist/conf.json`; used by Angular inside iframe for XHR; not required for the shell-level title/meta checks in this audit)

## Inventory

- Pages/states inventoried: **40** (see `audit-page-inventory.md`)
- Pages/states fully compared: **3** (`/login`, `/forgot-password`, `/discover`) for **host document** title/meta and shell structure
- Pages/states blocked: **1** group (`/projects/` and downstream authenticated routes — no scripted login in this audit)
- Pages/states matching: **not enumerated** (only discrepancies are recorded in the CSV)
- Pages/states not reached: **36** (no automated visit beyond the three routes above)

## Blockers

| route/state | blocker | Angular reachable? | React reachable? | notes |
|---|---|---:|---:|---|
| `/projects/` and nested project/admin routes | No Playwright login + seeded project navigation in this audit | yes (with credentials) | yes (with credentials) | Same shell/iframe pattern as public routes; deeper parity not executed here |

## CSV rows by category

| category | count |
|---|---:|
| missing functionality | 1 |
| missing content | 5 |
| visual difference | 0 |
| behavior difference | 1 |
| navigation difference | 0 |
| form UX difference | 0 |
| data display difference | 0 |
| auth/permission difference | 0 |
| api parity difference | 0 |

## CSV rows by priority

| priority | count |
|---|---:|
| high | 2 |
| medium | 4 |
| low | 1 |

## Tests

- Total checks: **14** (7 tests × 2 projects in Playwright)
- Angular passing: **7**
- React failing as intended: **7**
- Excluded/flaky/invalid checks: **0** (React failures are stable assertion mismatches on the parent document / shell DOM)
- Notes: `gulp express` was **not** used for the audit server because each `gulp` process generates a new `v-<timestamp>` while `dist/index.html` keeps the version from the last `gulp deploy`, which breaks locale JSON loads. The custom static server fixes that for reproducible audits. Playwright machine-readable summary: `e2e-comparison/playwright-report.json` (includes `stats.expected` / `stats.unexpected`). HTML report under `e2e-comparison/test-results/html-report/` is gitignored.

## Red flags (per audit instructions)

- CSV rows only span **three** categories (`missing content`, `missing functionality`, `behavior difference`) because the React port is currently a **routing shell + iframe host**; automated checks in this pass focused on **shell-level** document parity, not in-iframe UI. Deeper inventory entries are listed but not yet covered by failing React tests.

## Reproduction commands

```bash
# From repo root — build Angular dist (Node 16 per legacy gulp toolchain)
source "$HOME/.nvm/nvm.sh" && nvm use 16.19.1
cd /workspace
npm ci
npx gulp deploy

# Run comparison tests (Playwright starts Angular static server + Vite React)
source "$HOME/.nvm/nvm.sh" && nvm use 22
cd /workspace/e2e-comparison
npm ci
npx playwright install
npx playwright test

# Angular-only (reference oracle)
npx playwright test --project=angular

# React-only (migration target; expect 7 failures vs this audit’s assertions)
npx playwright test --project=react
```
