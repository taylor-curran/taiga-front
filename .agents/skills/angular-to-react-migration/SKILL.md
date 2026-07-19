---
name: angular-to-react-migration
description: Migrate an AngularJS/Angular page or feature to the React app while preserving behavior, API contracts, and visual design. Use when porting routes/components from the Angular frontend to React. Encodes recurring migration bugs so they are prevented up front rather than caught in review.
---

# AngularJS-to-React Migration (Defensive Driving)

Migrate one page/feature at a time against the existing React scaffold. Do **not** attempt a big-bang rewrite — prior big-bang PRs were never merged as-is.

## Before You Start
- Identify the specific Angular route(s)/page(s)/feature(s) to migrate this session.
- Confirm the target React repo/branch (or the existing `*-react` scaffold).
- Get the backend/API base URL and test credentials for a smoke-test login.

## Procedure
1. **Inventory the Angular source**: list every route, controller/component, service call, template, and sub-component (charts, filters, drag-and-drop, modals) in scope. Write it to `migration-inventory.md` — dropped sub-components are the #1 user complaint.
2. **Extract the exact API contract from the Angular services** (not guesswork): for each endpoint capture method, URL path, query params, request/response shape, headers, and which mutations use optimistic concurrency (`version`). Save to `api-contract.md`.
3. **Learn the scaffold conventions first**: locate the central API client / `resources.ts`, the router, and the state store (e.g. Zustand). Reuse the central client — never hand-build a URL that re-adds a prefix it already applies (double `/api/v1/` → 404s).
4. **Route all mutations through a `patchWithVersion` helper** that always sends the current `version` on PATCH/PUT. A missing/hardcoded `version` causes silent 400/409 on every write.
5. **Port component-by-component**, including ALL sub-components and BOTH read and write paths (status transitions, comment create/edit, drag-drop reorder). Match the Angular endpoint shape exactly (correct verb, numeric IDs not `me`/username, real endpoints not invented ones).
6. **Match the visual design**: pull colors/spacing/typography from the Angular SCSS variables & HTML, not generic defaults. Replace HTML entities (`&#9776;`, `&rsaquo;`, `&copy;`) with Unicode equivalents (`☰`, `›`, `©`) — Vite serves 0-byte modules for JSX containing HTML entities.
7. **Guard React correctness**: no side effects during render (no `navigate()` in render body — use `useEffect`); don't put store function refs / unstable values in `useEffect` deps (infinite loops, WebSocket never connects); never overwrite the auth token in a store update.
8. **Sanitize** any `dangerouslySetInnerHTML` with DOMPurify — unsanitized rich text is a stored-XSS vector.
9. **Dependency hygiene**: build-only packages stay in `devDependencies`, don't weaken `.gitignore`, match the repo's required Node version.
10. **Write a Playwright golden-path smoke test** (login → navigate → read → mutate → verify) and run it against the live backend. Version/auth/state bugs only surface here, not in unit tests.
11. **Visual proof**: start the dev server (and backend if needed), open the migrated page, click through the main flows, and capture a screen recording confirming it works and matches the Angular design.
12. **Open a PR** listing ported routes/components, API endpoints touched, any behavior deviations, and embed the smoke-test result + recording. Self-complete — don't stop to wait for "please continue".

## Success Criteria
- Every route/component/sub-component from the inventory is ported or explicitly listed out-of-scope in the PR.
- All mutations send the correct `version`; every endpoint maps to a real Angular service call (none invented).
- The React page visually matches the Angular app (palette, typography, layout).
- No render-phase side effects, no infinite render loops, no XSS via unsanitized HTML.
- Playwright golden-path smoke test passes against the live API; screen recording attached to the PR.

## Taiga API Specifics (if migrating taiga-front)
- API base URL: `https://api.taiga.io/api/v1`.
- `/search` requires a `project` param — there is no global cross-project search; only render search inside project-scoped pages where a `projectId` exists, not the global header.
- Notifications use `/notify-policies`, not `/notifications`.
- Angular palette: primary teal `#25A28C`, secondary green `#A7CB23`, link primary `#008AA8`, greys `#F9F9FB` (100) → `#2E3440` (900).

## Forbidden
- Don't hardcode `version` (e.g. always `1`) or omit it on mutations.
- Don't bypass the central API client and re-prepend the base URL.
- Don't render untrusted HTML without DOMPurify.
- Don't drop sub-components (charts, filters, drag-drop) to finish faster.
- Don't block waiting for user confirmation mid-task when the next step is clear.
