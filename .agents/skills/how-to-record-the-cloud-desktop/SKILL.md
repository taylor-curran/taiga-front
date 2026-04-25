---
name: how-to-record-the-cloud-desktop
description: Capture screenshots or video of a running app inside the Cursor Cloud agent VM. Use when the user wants to "see the app", "watch it", "record a demo", or asks for screenshots/video of a UI. Covers when to drive the real desktop on DISPLAY=:1 vs. when to use headless Chrome + puppeteer for bulk screenshot galleries.
---

# Record the Cloud Agent desktop

Use this skill when the user asks to **see** a running app (web UI, native app),
record interactions, or capture screenshots/video. The Cursor Cloud agent VM ships
with an Xfce desktop on `DISPLAY=:1` (1920x1200) plus headless Chrome, ffmpeg,
and xdotool, so you have two valid recording strategies.

Pick the right one before you start; switching mid-task wastes minutes.

## Decision: which approach?

```
Is the user going to WATCH the agent desktop tab live,
or do they want a video/interaction demo?
   YES -> Real Chrome on DISPLAY=:1  (Strategy A)
   NO, they just want artifacts -> Headless Chrome + puppeteer  (Strategy B)

Do you need many routes / scripted login / parallel pages?
   YES -> Strategy B (headless), it's much faster per-shot
   NO  -> Strategy A is fine and shows up in the desktop
```

If the user says any of "show me", "let me see", "in the desktop", "open the
app", "record", "demo", "watch it", default to **Strategy A** and only fall
back to B for bulk artifact generation.

## Environment that's preinstalled

- `DISPLAY=:1` - Xfce desktop, 1920x1200, visible in the user's Cursor Cloud
  desktop tab.
- `/usr/local/bin/google-chrome` - **a Cursor wrapper** around
  `/usr/bin/google-chrome-stable` that always injects
  `--no-sandbox --remote-debugging-port=9222 --user-data-dir=/home/ubuntu/.config/google-chrome --window-size=1820,1100 --window-position=50,50`
  plus a few rendering flags. Two consequences:
  - Chrome on the desktop is **always** reachable via CDP at
    `http://127.0.0.1:9222` (`curl http://127.0.0.1:9222/json/version`).
  - If you want a *separate* Chrome instance (e.g. fresh profile, different
    window size), pass `--user-data-dir=/tmp/<your-dir>` to override; the last
    `--user-data-dir` wins. Skip the wrapper entirely with
    `/usr/bin/google-chrome-stable` if you want a clean argv.
- `/usr/bin/ffmpeg` - for screen capture (still + video via `x11grab`).
- `/usr/bin/xdotool` - for finding windows, sending keys/clicks.
- `tmux` at `/exec-daemon/tmux.portal.conf` - keep long-running processes here.
- `/opt/cursor/artifacts/` - world-writable; the Cursor Cloud Agents API serves
  files placed here as artifacts that can be referenced from PR walkthroughs
  and downloaded via `/v0/agents/{id}/artifacts`. Use this for anything you
  want to be retrievable later. Subdirs like `/opt/cursor/artifacts/screenshots/`
  and `/opt/cursor/artifacts/videos/` are fine.

`wmctrl`, `import` (ImageMagick), `scrot`, and `gnome-screenshot` are NOT
installed. Don't reach for them.

## Strategy A: real Chrome on the cloud desktop

This is what the user sees in their browser tab.

### Launch Chrome on the desktop

First check if a Chrome is already running on the desktop (the cloud agent VM
sometimes ships with one auto-started by Plank):

```bash
DISPLAY=:1 xdotool search --onlyvisible --class chrome getwindowname %@ || true
```

If a window is already open you can just navigate it via CDP at
`http://127.0.0.1:9222` (see "Drive the UI" below) instead of launching a
second one.

Otherwise, run Chrome inside a tmux session so it survives between tool calls
and you can re-attach to inspect the log:

```bash
tmux -f /exec-daemon/tmux.portal.conf has-session -t "=desktop-chrome" 2>/dev/null \
  && tmux -f /exec-daemon/tmux.portal.conf kill-session -t desktop-chrome
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s desktop-chrome -c "$PWD" -- bash -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "desktop-chrome:0.0" \
  'rm -rf /tmp/chrome-desktop-profile && DISPLAY=:1 google-chrome \
     --no-sandbox --no-first-run --no-default-browser-check \
     --disable-features=Translate \
     --user-data-dir=/tmp/chrome-desktop-profile \
     --start-maximized --new-window http://localhost:9001/ \
     2>&1 | tee /tmp/chrome-desktop.log' C-m
```

Why these flags:

- `--no-sandbox` - the cloud sandbox blocks Chrome's own sandbox.
- `--user-data-dir=/tmp/chrome-desktop-profile` - a fresh profile avoids "Chrome
  is already running" lock errors when re-launching.
- `--start-maximized --new-window` - fills the visible 1920x1200 desktop.
- `--no-first-run --no-default-browser-check --disable-features=Translate` - no
  modal popups stealing focus on first launch.
- The DBus errors in the log are expected and harmless (no system bus inside
  the sandbox); ignore them.

Wait ~5 seconds, then verify Chrome is up:

```bash
DISPLAY=:1 xdotool search --onlyvisible --class chrome getwindowname %@
```

### Snap a still from the live desktop

ImageMagick's `import` is missing. Use ffmpeg's `x11grab`:

```bash
DISPLAY=:1 ffmpeg -y -f x11grab -video_size 1920x1200 -i :1 \
  -frames:v 1 -update 1 /opt/cursor/artifacts/screenshots/frame.png
```

The `-update 1` silences the "use a pattern such as %03d" warning when writing
a single image.

To shoot just the Chrome window (cropped, no titlebar wasted):

```bash
WID=$(DISPLAY=:1 xdotool search --onlyvisible --class chrome | head -1)
eval $(DISPLAY=:1 xdotool getwindowgeometry --shell "$WID")
DISPLAY=:1 ffmpeg -y -f x11grab -video_size ${WIDTH}x${HEIGHT} \
  -i :1+${X},${Y} -frames:v 1 -update 1 /opt/cursor/artifacts/screenshots/window.png
```

### Drive the UI

Best to use Chrome DevTools Protocol since `--remote-debugging-port=9222` is
already exposed by the default Chrome on the cloud desktop. Connect with
`puppeteer-core`'s `connect({ browserURL: 'http://127.0.0.1:9222' })` to drive
the **same** visible window the user is watching. This is much more reliable
than `xdotool key/type` for web UIs, and the user sees it happen live.

Lightweight option for native focus or non-web apps:

```bash
DISPLAY=:1 xdotool search --onlyvisible --class chrome windowactivate
DISPLAY=:1 xdotool key --clearmodifiers ctrl+l
DISPLAY=:1 xdotool type --delay 25 'http://localhost:9001/login'
DISPLAY=:1 xdotool key Return
```

### Record video

`x11grab` to mp4 in a long-lived tmux session:

```bash
tmux -f /exec-daemon/tmux.portal.conf new-session -d -s rec -c /tmp -- bash -l
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "rec:0.0" \
  'DISPLAY=:1 ffmpeg -y -f x11grab -framerate 15 -video_size 1920x1200 -i :1 \
     -c:v libx264 -preset veryfast -pix_fmt yuv420p \
     /opt/cursor/artifacts/videos/demo.mp4' C-m
```

To stop cleanly (so the mp4 finalizes its moov atom), send `q`, never SIGKILL:

```bash
tmux -f /exec-daemon/tmux.portal.conf send-keys -t "rec:0.0" 'q'
```

Tips:

- 15 fps is plenty for a UI walkthrough and keeps file size reasonable.
- `-pix_fmt yuv420p` makes the mp4 play in browsers and the Cursor PR preview.
- For big crops, narrow `-video_size`/offset to the Chrome window geometry
  (same `xdotool getwindowgeometry --shell` trick as above).

## Strategy B: headless Chrome + puppeteer-core

Use this when the user wants a **gallery** of routes, an automated login flow,
or anything where they don't need to literally watch it happen. It's faster
per-screenshot and totally deterministic.

### One-time setup

The cloud agent VM has `/usr/local/bin/google-chrome` already; you just need
`puppeteer-core`. Don't install full `puppeteer` - it tries to download a
Chromium binary you don't need.

```bash
. "$HOME/.nvm/nvm.sh" && nvm use 22 >/dev/null
mkdir -p /tmp/pup && cd /tmp/pup
npm init -y >/dev/null
npm i --no-audit --no-fund --prefer-offline puppeteer-core@23
```

### Capture script template

```js
import puppeteer from 'puppeteer-core';
import { setTimeout as wait } from 'node:timers/promises';
import { mkdirSync } from 'node:fs';

const OUT = '/opt/cursor/artifacts/screenshots';
mkdirSync(OUT, { recursive: true });
const HOST = 'http://localhost:9001';

const browser = await puppeteer.launch({
  executablePath: '/usr/local/bin/google-chrome',
  headless: 'new',
  args: ['--no-sandbox', '--disable-gpu', '--hide-scrollbars'],
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();
page.setDefaultTimeout(30000);

async function shot(name, url, waitMs = 3500) {
  try { await page.goto(HOST + url, { waitUntil: 'networkidle2' }); }
  catch (e) { console.log(`  goto warning: ${e.message}`); }
  await wait(waitMs);
  await page.screenshot({ path: `${OUT}/${name}.png` });
}

await shot('01-landing', '/');

// Login once, then capture authenticated routes.
await page.goto(HOST + '/login', { waitUntil: 'networkidle2' });
await page.type('input[name="username"]', 'admin', { delay: 10 });
await page.type('input[name="password"]', 'adminpass', { delay: 10 });
await Promise.all([
  page.click('.submit-button, button[type=submit]').catch(() => {}),
  page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 20000 }).catch(() => {}),
]);
await wait(2500);

await shot('02-dashboard', '/');
await browser.close();
```

Run it under Node 22 (`puppeteer-core@23` requires a recent Node):

```bash
. "$HOME/.nvm/nvm.sh" && nvm use 22 >/dev/null
node /tmp/pup/capture.mjs
```

### Don't use bare `google-chrome --headless --screenshot`

It works for one shot of a public page but:

- It can't share state between pages, so you can't log in once and screenshot
  10 authenticated routes.
- It collides with the user-data-dir of the Chrome that's already running on
  `:1` and silently hangs in some Chrome versions. (The 600s "did not complete
  in 600000ms" timeout I hit was this.) Always pass `--user-data-dir=/tmp/...`
  if you go this route.

## Where to write outputs

| File type | Path | Why |
|---|---|---|
| Screenshots/videos you want the user (or PR) to see | `/opt/cursor/artifacts/...` | Served by Cursor Cloud Agents API; embeddable in PR walkthrough via `<img src="/opt/cursor/artifacts/...">` and `<video src="/opt/cursor/artifacts/...">`; cleaned up properly by the platform. |
| Throwaway / scratch | `/tmp/...` | Cheap, ignored, won't pollute the repo. |
| Intentional, repo-tracked artifacts | `screenshots/` (already in `.gitignore` for taiga-front) | Avoid unless asked - usually you want `/opt/cursor/artifacts/` instead. |

When you reference these in PR descriptions or walkthroughs, use absolute
paths starting with `/opt/cursor/artifacts/...`. The PR tool rewrites them to
stable public URLs automatically.

## Lessons learned

These are the mistakes worth not repeating:

1. **Default to the visible desktop when the user says "show" or "see".** The
   user can be staring at a blank desktop tab while you produce 20 perfect
   headless PNGs - which is technically "recording" but feels like nothing
   happened. If in doubt, launch the visible Chrome first, then add headless
   captures.

2. **Don't run `google-chrome --headless --screenshot` without
   `--user-data-dir`.** It can deadlock on the existing profile lock. Always
   pass a unique `--user-data-dir=/tmp/<something>` when invoking Chrome from
   any direction. Do this for both headless and visible launches.

3. **`import` (ImageMagick) is not installed.** Use
   `ffmpeg -f x11grab ... -frames:v 1 -update 1 out.png`. Add `-update 1` to
   suppress the pattern warning.

4. **For multi-page captures, use `puppeteer-core`, not 20 Chrome subprocesses.**
   Spinning up Chrome takes ~2-3s each; `puppeteer-core` reuses one process
   and one logged-in session. The whole capture for ~20 routes runs in under
   90 seconds end-to-end.

5. **Use Node 22 for `puppeteer-core@23`.** The taiga-front gulp toolchain
   needs Node 16. Always `nvm use 22` in the shell where you run the capture
   script, separate from the shell that runs `gulp`.

6. **Run video recording in tmux and stop with `q`, not SIGKILL.** Killing
   ffmpeg leaves the mp4 without a moov atom and no browser will play it.

7. **Headless screenshots take ~3-5s after `networkidle2`.** Single-page Angular
   apps (like Taiga) need a `await wait(3000)` after `goto()`; their initial
   render fires several XHRs that don't all settle by `networkidle2`. Without
   the extra wait you get blank or half-loaded screenshots.

8. **Prefer CDP over xdotool for web UIs.** Connect puppeteer to Chrome's
   `--remote-debugging-port=9222` (already enabled on the cloud desktop's
   default Chrome) so you can drive the visible window the user is watching,
   instead of typing keystrokes blindly with `xdotool`.

9. **Write artifacts to `/opt/cursor/artifacts/`, not the repo.** They're
   discoverable via the Cursor Cloud Agents API (`/v0/agents/{id}/artifacts`)
   and embeddable in PR descriptions. Repo-local screenshots usually end up
   in `.gitignore` and lost.
