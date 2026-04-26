# Angular vs React migration audit (Playwright)

This folder holds the **dual-project** Playwright suite used for `migration-audit-results.csv`.

## Prerequisites

- Taiga API on `http://127.0.0.1:9000` (see repo `scripts/cursor-cloud-taiga.sh` or `npm run taiga-up`).
- Angular gulp dev server on `http://127.0.0.1:9001` (`npx gulp` from repo root, Node 16).
- React Vite dev server on `http://127.0.0.1:5173` (`npm run react` from repo root, Node 22).

## Run

```bash
cd e2e-comparison
npm install
npx playwright install chromium
npx playwright test
```

Environment overrides:

| Variable | Default |
|----------|---------|
| `ANGULAR_URL` | `http://127.0.0.1:9001` |
| `REACT_URL` | `http://127.0.0.1:5173` |
| `TAIGA_API_URL` | `http://127.0.0.1:9000` |
| `AUDIT_PROJECT_SLUG` | `project-1` |

`global-setup.ts` performs `POST ${TAIGA_API_URL}/api/v1/auth` as `admin` / `adminpass` and writes `.auth-cache.json` (gitignored) for Angular `localStorage` seeding.

## Outputs

- `screenshots/` — paired PNGs where visual evidence is required
- `test-results/results.json` — Playwright JSON report
- `playwright-report/` — HTML report (gitignored)
