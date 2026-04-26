# Angular vs React migration audit (Playwright)

Run the **Angular** dev server on port **9001** and the **React** app on **5173** before tests.

```bash
# Terminal A — Angular (Node 16)
nvm use 16.19.1
cd /path/to/repo
npm start

# Terminal B — React (Node 22)
nvm use 22
npm run react

# Optional — Taiga API for authenticated Angular routes (sample data)
# From repo root: npm run taiga-up && npm run taiga-seed
```

Then:

```bash
cd e2e-comparison
npm install
npx playwright install chromium
npm test
```

Environment:

- `ANGULAR_BASE_URL` (default `http://127.0.0.1:9001`)
- `REACT_BASE_URL` (default `http://127.0.0.1:5173`)
- `TAIGA_API_URL` (default `http://127.0.0.1:9000/api/v1`) — used to seed Angular `localStorage` for admin/profile tests

Angular admin assertions use project slug **`project-1`** from seeded sample data. React assertions use the scaffold slug **`scrum`** (`DEMO_PROJECT_SLUG`).
