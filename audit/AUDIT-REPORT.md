# Taiga Frontend Migration Audit: AngularJS vs React

## Overview

This audit compares the original AngularJS Taiga frontend (`:9000`) with the React migration (PR #2, `:5173`). The test suite documents **42 proven differences** across 9 test files using Playwright.

## Running the Tests

```bash
cd audit
npm install
npx playwright install chromium
npx playwright test
```

**Prerequisites**: Both apps must be running:
- AngularJS: `npm run taiga-up && npm run taiga-seed` (Docker on `:9000`)
- React: `npm run react` (Vite on `:5173`)

---

## Summary of Differences

### 1. Login Page (5 tests)

```
AngularJS (:9000)                          React (:5173)
┌───────────────────────┐                  ┌───────────────────────┐
│      (flower SVG)     │                  │    [T] (blue square)  │
│        Taiga          │                  │       Taiga           │
│  LOVE YOUR PROJECT    │                  │      Sign in          │
│                       │                  │                       │
│ [Username or email..] │                  │  Username or email    │
│ [Password..] Forgot?  │                  │  [____________]       │
│ [===== LOGIN =====]   │                  │  Password             │
│       (teal)          │                  │  [____________]       │
│                       │                  │  [=== Sign in ===]    │
│  white background     │                  │      (slate blue)     │
└───────────────────────┘                  │  Forgot your password?│
                                           │  gray bg + card       │
                                           └───────────────────────┘
```

| Difference | AngularJS | React |
|---|---|---|
| Tagline | "LOVE YOUR PROJECT" | None (shows "Sign in") |
| Submit button | "LOGIN" (teal) | "Sign in" (slate blue) |
| Input style | Placeholder text inside inputs | Labels above inputs |
| Case sensitivity | "(case sensitive)" in placeholder | Not shown |
| Forgot password | "Forgot it?" inline | "Forgot your password?" below |
| Background | White | Gray with white card |

### 2. Global Navigation (5 tests)

```
AngularJS (:9000)                   React (:5173)
┌──────┬──────────────┐            ┌──────────────────────────────┐
│ LOGO │              │            │ [T] Projects          [avatar]│
│──────│              │            └──────────────────────────────┘
│ Proj │   content    │            (simple horizontal header bar)
│ Disc │              │
│ Help │              │
│ Evts │              │
│ User │              │
│ Srch │              │
└──────┴──────────────┘
(rich left sidebar with icons)
```

| Missing in React | Description |
|---|---|
| Discover link | No "Discover trending projects" page |
| Help link | No link to community.taiga.io |
| Events/Notifications | No notifications bell icon |
| Search toggle | No global search button |
| Rich sidebar | Only "Projects" + avatar in header |

### 3. Home / Dashboard (3 tests)

| Difference | AngularJS | React |
|---|---|---|
| Heading | "Projects Dashboard" | "My Projects" |
| Working on | Linked work items with project logos, type badges (Epic/US/Task/Issue), and status | Plain timeline events list ("wiki change 3m ago") |
| Project logos | Real project logo images | Letter avatars ("P") |

### 4. Project Sidebar (5 tests)

| Difference | AngularJS | React |
|---|---|---|
| Icons | SVG icons per nav item | Text-only links |
| Settings | "Settings" label | "Admin" label |
| Scrum nav | "Scrum" dropdown menu | Flat "Backlog" link |
| Collapse | "collapse menu" button | None |
| Project logo | Image from API | Letter avatar |

### 5. Backlog Page (5 tests)

| Missing in React | Description |
|---|---|
| Burndown stats | No project points / defined / closed / per-sprint stats |
| Page heading | "Backlog" instead of "Scrum" |
| Filters / Search | No filter button, no search input |
| Tags | No tag display on user stories |
| Burndown chart | No chart toggle |
| Doomline | No project scope doomline |

### 6. Kanban Board (5 tests)

| Missing in React | Description |
|---|---|
| Zoom control | No zoom level control |
| Filters / Search | No filter button, no search input |
| Column actions | No +add, bulk-add, or fold buttons per column |
| Card avatars | No user avatar images on cards |
| Card actions | No action menu buttons on cards |
| Card layout | Concatenated text (e.g. "a55.5oditmaiores" instead of spaced metadata) |

### 7. Issues Page (6 tests)

| Difference | AngularJS | React |
|---|---|---|
| New Issue button | "NEW ISSUE" button present | Missing |
| Search | Search input present | Missing |
| Filters | Custom filter button | Native `<select>` dropdowns |
| Sort | Clickable column headers with arrows | No sorting |
| Avatars | User avatar images for assignees | Text names only |
| Modified dates | Shows "25 Apr 2026" dates | Not shown |

### 8. Project Blocking (2 tests)

```
API: project-7 has blocked_code = "blocked-by-staff"

AngularJS (:9000)                   React (:5173)
┌────────────────────────┐          ┌────────────────────────┐
│  Project Example 7     │          │  Backlog               │
│                        │          │                        │
│  ⚠ Blocked project    │          │  ▼ Sprint 2026-3-1     │
│  In order to unblock   │          │  #1 Fixing templates   │
│  your projects,        │          │  #4 Added file copy    │
│  contact the           │          │  ...                   │
│  administrator.        │          │  (shows full content   │
│                        │          │   ignoring blocked     │
│  (forest illustration) │          │   status entirely)     │
└────────────────────────┘          └────────────────────────┘
```

**Critical**: React does not check `blocked_code` from the API. Blocked projects are fully accessible.

### 9. Missing Features (4 tests)

| Feature | Status |
|---|---|
| Discover/trending page | Not implemented in React |
| Kanban card formatting | Text concatenated without spacing |
| User story detail | Simpler layout vs Angular's rich detail |
| Issue detail | Simpler layout vs Angular's rich detail |

---

## Test Files

| File | Tests | Area |
|---|---|---|
| `01-login-page.spec.ts` | 6 | Login page visual/functional diffs |
| `02-global-navigation.spec.ts` | 5 | Global nav bar differences |
| `03-home-dashboard.spec.ts` | 3 | Home/dashboard layout diffs |
| `04-project-sidebar.spec.ts` | 5 | Project sidebar differences |
| `05-backlog-page.spec.ts` | 5 | Backlog page feature gaps |
| `06-kanban-board.spec.ts` | 5 | Kanban board feature gaps |
| `07-issues-page.spec.ts` | 6 | Issues page differences |
| `08-project-blocking.spec.ts` | 2 | Project blocking behavior |
| `09-missing-features.spec.ts` | 4 | General missing features |

**Total: 42 tests, all passing**
