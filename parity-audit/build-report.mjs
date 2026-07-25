// Reads reports/angular.json and reports/react.json, plus the screenshots/
// captured by the spec setup, and emits REPORT.md — a side-by-side comparison
// table for each spec, with green checks for pass and red X for fail, and the
// matching screenshots embedded.

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { existsSync } from 'node:fs';

const ROOT = new URL('.', import.meta.url).pathname;

async function readJSON(p) {
  try { return JSON.parse(await readFile(p, 'utf8')); }
  catch { return null; }
}

function flattenSuites(suites, parentTitles = []) {
  const out = [];
  for (const s of suites || []) {
    const titles = [...parentTitles, s.title].filter(Boolean);
    for (const spec of s.specs || []) {
      const result = spec.tests?.[0]?.results?.[0];
      out.push({
        file: s.file,
        suite: titles.join(' › '),
        title: spec.title,
        status: result?.status || 'skipped',
        error: result?.error?.message || '',
        duration: result?.duration ?? 0,
      });
    }
    if (s.suites) out.push(...flattenSuites(s.suites, titles));
  }
  return out;
}

function emojiFor(status) {
  if (status === 'passed') return '✅';
  if (status === 'failed' || status === 'timedOut') return '❌';
  if (status === 'skipped') return '⏭️';
  return '❔';
}

function shorten(msg, n = 220) {
  if (!msg) return '';
  const oneLine = msg.replace(/\u001b\[[0-9;]*m/g, '').replace(/\s+/g, ' ').trim();
  return oneLine.length > n ? oneLine.slice(0, n - 1) + '…' : oneLine;
}

function specKey(s) {
  return `${s.suite} › ${s.title}`;
}

const SCREENSHOT_PAGES = ['login', 'home', 'projects', 'backlog', 'kanban', 'issues'];

function exists(p) { return existsSync(p); }

(async () => {
  const ang = (await readJSON(path.join(ROOT, 'reports/angular.json'))) || { suites: [] };
  const rea = (await readJSON(path.join(ROOT, 'reports/react.json')))   || { suites: [] };

  const angSpecs = flattenSuites(ang.suites);
  const reaSpecs = flattenSuites(rea.suites);
  const reaByKey = new Map(reaSpecs.map((s) => [specKey(s), s]));

  const sections = new Map();
  for (const a of angSpecs) {
    const r = reaByKey.get(specKey(a));
    if (!sections.has(a.suite)) sections.set(a.suite, []);
    sections.get(a.suite).push({ title: a.title, ang: a, rea: r });
  }

  let md = '';
  md += '# Taiga AngularJS → React parity audit\n\n';
  md += `_Generated: ${new Date().toISOString()}_\n\n`;
  md += '> **Scope:** login · dashboard (home) · projects listing · project sidebar · backlog · kanban · issues. ';
  md += 'Both apps boot off the same `taiga-back` + `taiga-events` stack with the same seeded data, the same admin session is replayed into each, and the same Playwright suite asserts AngularJS behaviour against both targets.\n\n';
  md += '## How to read this report\n\n';
  md += 'Each test asserts a feature/marker that the **AngularJS** taiga-front (the read-only spec) ships out of the box. ';
  md += 'The exact same test runs against the **React port** (`web-react/`). Where the React port has not implemented (or has implemented differently) the asserted feature, the test **fails on React** and **passes on Angular**. ';
  md += 'Each red ❌ on the React side is a parity gap.\n\n';
  md += '- ✅ — pass\n- ❌ — fail (parity gap)\n- ⏭️ — skipped\n\n';
  md += '## Reproduce locally\n\n';
  md += '```sh\n';
  md += 'npm run taiga-up        # gateway + back + events on :9000\n';
  md += 'npm run taiga-seed      # admin/adminpass + 7 sample projects\n';
  md += 'npm run react           # web-react dev server on :5173\n';
  md += 'cd parity-audit && npm install && npx playwright install chromium\n';
  md += 'PARITY_TARGET=angular npx playwright test\n';
  md += 'PARITY_TARGET=react   npx playwright test\n';
  md += 'node build-report.mjs   # writes REPORT.md\n';
  md += '```\n\n';

  // Summary block
  const totals = (specs) => {
    let p = 0, f = 0, s = 0;
    for (const x of specs) {
      if (x.status === 'passed') p++;
      else if (x.status === 'failed' || x.status === 'timedOut') f++;
      else s++;
    }
    return { p, f, s, total: specs.length };
  };
  const ta = totals(angSpecs);
  const tr = totals(reaSpecs);
  md += '## Summary\n\n';
  md += '| target  | total | passed | failed | skipped |\n';
  md += '| ------- | ----: | -----: | -----: | ------: |\n';
  md += `| Angular | ${ta.total} | ${ta.p} | ${ta.f} | ${ta.s} |\n`;
  md += `| React   | ${tr.total} | ${tr.p} | ${tr.f} | ${tr.s} |\n\n`;
  md += `**Parity gaps detected:** ${tr.f} (tests passing on Angular but failing on React).\n\n`;

  // Highlight reel
  md += '## Top differences observed\n\n';
  md += '| Page | AngularJS (current) | React port (`web-react`) |\n';
  md += '| --- | --- | --- |\n';
  md += '| Login | "LOVE YOUR PROJECT" tagline, Taiga star logo (multi-path SVG), placeholder "Username or email (case sensitive)", "LOGIN" button (uppercase), inline "Forgot it?" link, document title `Login - Taiga` | "A simple project management platform" tagline, generic cube logo, separate field labels (no placeholder), "Sign in" button, separate "Forgot your password?" link, document title `Taiga (React port)` |\n';
  md += '| Dashboard (`/`) | Page heading "Projects Dashboard", split into "Working on" and "Watching" sections, each row shows ticket project + type + status + ref, navbar includes a Projects dropdown with "View all projects" link | "Working on" tile + "Activity" timeline (no Watching, no Projects Dashboard heading), flat NavLinks "Home / Discover / My Projects", no Projects dropdown |\n';
  md += '| My projects (`/projects/`) | "NEW PROJECT" CTA (uppercase), reorder helper aside, projects ordered by user-defined `project_index_order` (newest first), no in-page search input, key icon for private projects | "+ New project" CTA, no reorder hint, projects in ascending order, adds a Filter projects search box, "Public"/"Private" text labels |\n';
  md += '| Project sidebar | "Scrum" group containing Backlog + sprint links, "Settings" link (admin gate), "collapse menu" toggle, top-of-rail project link uses the project logo image, no top-level "Timeline" link | Flat list Timeline / Epics / Backlog / Kanban / Issues / Wiki / Team / Search / Admin (renamed from "Settings"), no Scrum group, no collapse, no project logo |\n';
  md += '| Backlog | Section heading "Scrum", project burndown summary (5 stat tiles + Flot canvas), Filters/search/Tags toolbar, each row has status pill + points popover + 3-dot menu + checkbox + tag chips, right-rail per-sprint card with "SPRINT TASKBOARD" CTA | Heading "Backlog", no summary or chart, no filters/search/tags, rows are colored dot + ref + subject + points pill + ×, sprint shown as a plain card with story refs, no taskboard link |\n';
  md += '| Kanban | UPPERCASE column headers ("NEW", "READY", "IN PROGRESS", "READY FOR TEST"), Filters + reference search + ZOOM control, swimlanes per epic/folder, cards show assignee badge ("Not assigned") | Title-case headers ("New", "Ready", "In progress", "Ready for test"), no filters/search/zoom, single row of columns (no swimlanes), cards show only ref+subject+tags |\n';
  md += '| Issues | 7-column table (TYPE, SEVERITY, PRIORITY, ISSUE, STATUS, MODIFIED, ASSIGN TO) with sort arrows; type/severity/priority rendered as small colored *dots*, tag chips inline, assignee avatar control, "+ NEW ISSUE" toolbar with Filters/search/Tags toggle | 6-column table (#, SUBJECT, STATUS, TYPE, PRIORITY, SEVERITY), no MODIFIED/ASSIGN TO, no sort arrows, type/severity/priority as full text pills, no tag chips, "Search issues..." + status select + sort select, "+ New issue" CTA |\n';
  md += '\n';

  // Per-suite tables
  md += '## Findings by section\n\n';
  for (const [suite, rows] of sections) {
    md += `### ${suite}\n\n`;
    md += '| Assertion (Angular feature) | Angular | React | Notes (React failure) |\n';
    md += '| --- | :---: | :---: | --- |\n';
    for (const r of rows) {
      const a = r.ang.status; const re = r.rea?.status || 'skipped';
      const note = re === 'failed' || re === 'timedOut'
        ? '`' + shorten(r.rea?.error || '', 200) + '`'
        : (re === 'skipped' ? '_skipped_' : '_parity_');
      md += `| ${r.title} | ${emojiFor(a)} | ${emojiFor(re)} | ${note} |\n`;
    }
    md += '\n';
  }

  // Screenshot gallery
  md += '## Screenshot gallery\n\n';
  md += 'Captured by `parity-audit/explore.mjs` (full-page, 1366×900 viewport, both apps loaded with the same admin session).\n\n';
  for (const page of SCREENSHOT_PAGES) {
    const aPath = `screenshots/angular/${page}.png`;
    const rPath = `screenshots/react/${page}.png`;
    if (!exists(path.join(ROOT, aPath)) || !exists(path.join(ROOT, rPath))) continue;
    md += `### ${page}\n\n`;
    md += '| AngularJS (taiga-front, :9000) | React port (web-react, :5173) |\n';
    md += '| --- | --- |\n';
    md += `| ![angular-${page}](${aPath}) | ![react-${page}](${rPath}) |\n\n`;
  }

  // Appendix: raw failures from the React side, useful for triage.
  md += '## Appendix: full React failure list\n\n';
  const reaFails = reaSpecs.filter((s) => s.status === 'failed' || s.status === 'timedOut');
  if (!reaFails.length) {
    md += '_None._\n';
  } else {
    for (const f of reaFails) {
      md += `- **${f.suite} › ${f.title}**  \n  ${shorten(f.error, 600)}\n\n`;
    }
  }

  await writeFile(path.join(ROOT, 'REPORT.md'), md);
  console.log(`wrote ${path.join(ROOT, 'REPORT.md')}`);
})();
