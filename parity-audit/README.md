# parity-audit

Playwright-based audit of the AngularJS-to-React port (`taiga-front` →
`web-react/`) requested in
[PR #6](https://github.com/taylor-curran/taiga-front/pull/6).

The same test suite runs against both apps:

- **AngularJS taiga-front** served by the gateway on `http://localhost:9000`
- **React port (`web-react/`)** served by Vite on `http://localhost:5173`

Each test asserts a feature/marker that the AngularJS app ships out of the
box. AngularJS is the read-only spec — this audit makes **no source-code
changes** to either app. Tests that pass on Angular and fail on React are the
parity gaps.

## Scope

Per the audit task:

- `/login`
- `/` (dashboard / home)
- `/projects/` (projects listing)
- per-project sidebar (`tg-project-menu`)
- `/project/:slug/backlog`
- `/project/:slug/kanban`
- `/project/:slug/issues`

## Layout

```
parity-audit/
├── README.md                  this file
├── REPORT.md                  generated comparison report
├── package.json
├── playwright.config.ts       PARITY_TARGET=angular|react switches baseURL
├── explore.mjs                fast reconnaissance: full-page screenshots +
│                              slim DOM snapshots of both apps
├── build-report.mjs           merges reports/{angular,react}.json + the
│                              screenshots into REPORT.md
├── tests/                     the parity specs
│   ├── _helpers.ts
│   ├── 01-login.spec.ts
│   ├── 02-dashboard.spec.ts
│   ├── 03-projects-listing.spec.ts
│   ├── 04-sidebar.spec.ts
│   ├── 05-backlog.spec.ts
│   ├── 06-kanban.spec.ts
│   └── 07-issues.spec.ts
├── screenshots/
│   ├── angular/{login,home,projects,backlog,kanban,issues}.png
│   └── react/{login,home,projects,backlog,kanban,issues}.png
└── reports/
    ├── angular.json           Playwright JSON reporter output
    ├── angular-html/          Playwright HTML report
    ├── react.json
    └── react-html/
```

## How to run

```sh
# 1) Bring up the reference stack and the React app
npm run taiga-up           # gateway / back / events on :9000
npm run taiga-seed         # admin/adminpass + 7 sample projects
npm run react              # web-react dev server on :5173

# 2) Install deps + browser
cd parity-audit
npm install
npx playwright install chromium

# 3) (optional) capture comparison screenshots and DOM dumps
node explore.mjs            # writes screenshots/{angular,react}/*.png

# 4) Run the suite against each target
PARITY_TARGET=angular npx playwright test
PARITY_TARGET=react   npx playwright test

# 5) Write REPORT.md
node build-report.mjs
```

The gateway URL, React URL, admin credentials and seeded project slug are all
overridable via env (`ANGULAR_URL`, `REACT_URL`, `TAIGA_ADMIN_USER`,
`TAIGA_ADMIN_PASS`, `TAIGA_PROJECT_SLUG`).

## Why React fails most of these

Each test docstring explains the gap (Angular markup vs. React markup) and
points to the relevant source files in both apps. See `REPORT.md` for the
full table + screenshot gallery.
