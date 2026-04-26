# Taiga Angular vs React (scaffold) — comparison tests

**Angular:** serve the current `../dist` build. The `angular-static-server` script uses the `TAIGA_VERSION` from `dist/index.html` (running `npx gulp express` in a *separate* process can pick a different version id and break JavaScript). Point `../dist/conf.json` at your gateway so `conf.json` and API CORS line up (same host as the browser, e.g. `http://localhost:9000`).

**React:** Vite on port 5173 (`npm run react` from repo root) with the default proxy in `web-react/vite.config.ts` when the stack runs on 9000.

```bash
# From repository root: build Angular once
nvm use 16.19.1
npx gulp deploy

# Terminal 1: Taiga API (optional but recommended for Angular API calls)
npm run taiga-up
npm run taiga-seed

# Terminal 2: Angular static (from this folder)
cd e2e-comparison && npm run start:angular   # 9001

# Terminal 3: React
cd .. && nvm use 22 && npm run react   # 5173

# Terminal 4: tests
cd e2e-comparison
ANGULAR_BASE=http://localhost:9001 REACT_BASE=http://localhost:5173 npx playwright test
```

`migration-audit-results.csv` in the repository root is keyed to `specs/parity-migration-audit.spec.ts` (one test name per row).
