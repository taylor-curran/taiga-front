# Audit Coverage Summary

## Provenance

- Migration PR: https://github.com/taylor-curran/taiga-front/pull/29
- Audit branch: `cursor/angular-react-migration-audit-d2d9`
- Angular commit: `20a9f8083c06dadd36b0da62fa9d5ce8b3be4a50`
- React commit: `20a9f8083c06dadd36b0da62fa9d5ce8b3be4a50`
- Angular URL: `http://127.0.0.1:9001`
- React URL: `http://127.0.0.1:5173`
- API/backend URL: `http://127.0.0.1:9000`

## Inventory

- Pages/states inventoried: **51** (see `audit-page-inventory.md`; grouped some admin/settings siblings under shared headings while listing each distinct route in prose)
- Pages/states fully compared: **10** (those covered by Playwright evidence in `migration-audit-results.csv`)
- Pages/states blocked: **0** (Taiga API and both dev servers were available in this run)
- Pages/states matching: **not enumerated** (inventory marks most non-tested routes as `not started`; parity was not claimed)
- Pages/states not reached: **41** (inventory entries still `not started` or only partially noted in Notes)

## Blockers

| route/state | blocker | Angular reachable? | React reachable? | notes |
|-------------|---------|-------------------:|-----------------:|-------|
| — | — | — | — | No auth or API blocker in this run. |

## CSV rows by category

| category | count |
|----------|------:|
| missing functionality | 6 |
| missing content | 1 |
| visual difference | 2 |
| behavior difference | 0 |
| navigation difference | 0 |
| form UX difference | 1 |
| data display difference | 0 |
| auth/permission difference | 0 |
| api parity difference | 0 |

## CSV rows by priority

| priority | count |
|----------|------:|
| high | 7 |
| medium | 1 |
| low | 2 |

## Tests

- Total checks: **10** Playwright scenarios, each executed twice (Playwright projects `angular-baseline` and `react-parity`) with **identical** assertions encoding Angular reference DOM.
- Angular passing: **10** (`npx playwright test --project=angular-baseline`)
- React failing as intended: **10** (`npx playwright test --project=react-parity` — same assertions; failures are the evidence of mismatch)
- Excluded/flaky/invalid checks: **0** in the final run
- Notes: Machine-readable output is `e2e-comparison/test-results/results.json`. Paired screenshots are under `e2e-comparison/screenshots/`. `e2e-comparison/.auth-cache.json` is produced by `global-setup.ts` and is gitignored.

## Reproduction commands

```bash
# One-time / environment (Cursor Cloud): Taiga backend + sample data
bash scripts/cursor-cloud-install.sh
bash scripts/cursor-cloud-dockerd.sh   # long-lived terminal
bash scripts/cursor-cloud-taiga.sh     # long-lived terminal

# Angular reference (Node 16.x per repo README / skill)
cd /workspace
source "$HOME/.nvm/nvm.sh" && nvm use 16.19.1
npm install   # if needed
npx gulp      # serves http://127.0.0.1:9001

# React migration app (Node 22; proxies /api to :9000)
source "$HOME/.nvm/nvm.sh" && nvm use 22
npm run react   # http://127.0.0.1:5173

# Audit Playwright suite (Node 22)
cd /workspace/e2e-comparison
source "$HOME/.nvm/nvm.sh" && nvm use 22
npm install
npx playwright install chromium
export ANGULAR_URL=http://127.0.0.1:9001
export REACT_URL=http://127.0.0.1:5173
export TAIGA_API_URL=http://127.0.0.1:9000
# optional: export AUDIT_PROJECT_SLUG=project-1
npx playwright test
```

## Red-flag notes (per audit instructions)

- **CSV rows only cover four category buckets** (`missing functionality`, `missing content`, `visual difference`, `form UX difference`) because the executable checks written in this pass targeted those dimensions; inventory lists many additional routes still `not started` for deeper behavioral/API parity.
- **Angular `/project/new` automated compare** was attempted but **skipped** in tests: `CreateProjectCtrl` calls `authService.refresh()` which invalidated the seeded session during investigation, so create-project parity is inventory-only here.
