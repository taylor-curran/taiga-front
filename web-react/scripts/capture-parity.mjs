// Capture side-by-side before/after screenshots of every major route.
// Drives the AngularJS reference (gateway :9000) and the React port (:5173)
// against the seeded data so reviewers can compare on real records.
//
// Output: web-react/screenshots/<route>__angular.png, <route>__react.png

import { chromium } from "playwright";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdirSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, "../screenshots");
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  { name: "login", path: "/login", login: false },
  { name: "home", path: "/", login: true },
  { name: "backlog", path: "/project/project-1/backlog", login: true },
  { name: "kanban", path: "/project/project-1/kanban", login: true },
  { name: "issues", path: "/project/project-1/issues", login: true },
  { name: "team", path: "/project/project-1/team", login: true },
  { name: "wiki", path: "/project/project-1/wiki/home", login: true },
  { name: "epics", path: "/project/project-1/epics", login: true },
  { name: "search", path: "/project/project-1/search", login: true },
];

const TARGETS = {
  angular: "http://localhost:9000",
  react: "http://localhost:5173",
};

async function login(page, base) {
  await page.goto(`${base}/login`);
  await page.waitForTimeout(1500);
  await page.fill('input[name="username"]', "admin");
  await page.fill('input[name="password"]', "adminpass");
  await page.click('button[type="submit"], input[type="submit"]');
  await page.waitForTimeout(2500);
}

async function capture(target, base) {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await login(page, base);
  for (const r of ROUTES) {
    if (r.path !== "/login") {
      await page.goto(`${base}${r.path}`);
      await page.waitForTimeout(2500);
    } else {
      // logout for login screen
      const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const p2 = await ctx2.newPage();
      await p2.goto(`${base}${r.path}`);
      await p2.waitForTimeout(1500);
      await p2.screenshot({ path: path.join(OUT, `${r.name}__${target}.png`), fullPage: false });
      await ctx2.close();
      continue;
    }
    await page.screenshot({ path: path.join(OUT, `${r.name}__${target}.png`), fullPage: false });
  }
  await browser.close();
}

for (const [target, base] of Object.entries(TARGETS)) {
  console.log(`-> ${target} (${base})`);
  await capture(target, base);
}
console.log("Done. Screenshots in", OUT);
