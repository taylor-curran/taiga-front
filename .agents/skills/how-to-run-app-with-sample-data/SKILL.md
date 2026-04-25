---
name: how-to-run-app-with-sample-data
description: Bring up the Taiga AngularJS front-end locally with a fully seeded backend (5 sample projects, ~14 users, milestones, issues) using the dockerized stack in `taiga-docker/`. Use this when the user asks to "run the app", "run the angular app", "see the UI", "start taiga", or "load sample data". Includes Docker setup steps for sandboxed VMs (e.g. Cursor Cloud Agents) where Docker is not preinstalled, systemd is absent, overlayfs cannot be mounted, or nftables NAT is unsupported.
---

# How to run the Angular app with sample data

End state: the Taiga AngularJS app served at <http://localhost:9000>, backed by
a Postgres database that already contains demo projects, users, sprints, and
issues. Default admin login is `admin` / `adminpass`.

## When to use this skill

Use this skill whenever the user asks to:

- "run the angular app", "run taiga", "start the app", "see the UI"
- "load sample data", "seed the db", "set up demo data"
- "bring up the stack", "docker compose up taiga"

## Preflight: is Docker available?

Run this first. If it succeeds, skip to [Quick start](#quick-start).

```bash
docker version >/dev/null 2>&1 && docker info >/dev/null 2>&1 \
  && echo "docker OK" \
  || echo "docker NOT ready — see 'Setting up Docker in a sandboxed VM' below"
```

If Docker is not available, do [Setting up Docker in a sandboxed VM](#setting-up-docker-in-a-sandboxed-vm)
**first**, then come back here.

## Quick start

From the repo root:

```bash
# 1. Bring up the full Taiga stack (db, back, events, front, gateway, rabbitmq, ...)
npm run taiga-up

# 2. Wait until the API is reachable (~15-30s after step 1; 502s during warmup are normal)
until curl -fsS http://localhost:9000/api/v1/ >/dev/null; do sleep 2; done

# 3. Create the admin superuser (admin / adminpass)
npm run taiga-superuser

# 4. Load the sample data (5 projects, ~14 users, milestones, issues, ...)
npm run taiga-sample-data
```

Open <http://localhost:9000> and log in as **`admin` / `adminpass`**.
Sample-data users are `user1` … `user14` with default password `123123`.

## What the npm scripts do

Defined in [`package.json`](../../../package.json), wrapping the
`docker compose` files in [`taiga-docker/`](../../../taiga-docker/):

| Script | What it does |
| --- | --- |
| `npm run taiga-up` | `docker compose -f docker-compose.yml up -d` — start every service |
| `npm run taiga-superuser` | Run Django's `createsuperuser --noinput` with `admin` / `adminpass` |
| `npm run taiga-sample-data` | Run Django's `sample_data` management command to seed the DB |
| `npm run taiga-logs` | Tail logs from `taiga-back` and `taiga-events` |
| `npm run taiga-down` | `docker compose down` — stop all services (keeps volumes) |

## Verify everything is up

```bash
docker compose -f taiga-docker/docker-compose.yml ps
curl -s http://localhost:9000/api/v1/projects | python3 -c \
  'import json,sys; d=json.load(sys.stdin); print(f"{len(d)} projects"); [print(" -", p["slug"], p["name"]) for p in d]'
```

Expected: 5 projects (`project-1`, `project-2`, `project-4`, `project-6`, `project-7`).

## Resetting the database

`sample_data` is destructive but can be re-run. To wipe state and start over:

```bash
npm run taiga-down
docker volume rm \
  taiga-docker_taiga-db-data \
  taiga-docker_taiga-static-data \
  taiga-docker_taiga-media-data
npm run taiga-up
# then re-run taiga-superuser and taiga-sample-data
```

## Setting up Docker in a sandboxed VM

Only needed if `docker --version` returns `command not found`, or `dockerd`
won't start with the default settings. Verified on a Cursor Cloud Agent
(Ubuntu 24.04) sandbox where there is no `systemd`, no `overlayfs` mount
support, and the kernel's nftables `nat` table is not available.

```bash
# 1. Install the engine and the compose plugin
sudo apt-get update
sudo DEBIAN_FRONTEND=noninteractive apt-get install -y docker.io docker-compose-v2

# 2. Use the legacy iptables backend (nftables NAT is unsupported in this sandbox)
sudo update-alternatives --set iptables  /usr/sbin/iptables-legacy
sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy

# 3. Allow your user to talk to the daemon without sudo
sudo usermod -aG docker "$USER"
# (group membership is picked up on next login — for the current shell, just
#  loosen the socket perms once the daemon is running, see step 5)

# 4. Start dockerd manually (no systemd in this environment).
#    --storage-driver=vfs is required because overlayfs cannot be mounted here.
#    Run it inside a tmux session so it survives across shell invocations:
tmux new-session -d -s dockerd \
  'sudo dockerd --storage-driver=vfs 2>&1 | tee /tmp/dockerd.log'

# 5. Wait for the socket and (optionally) make it world-writable for this session
until [ -S /var/run/docker.sock ]; do sleep 1; done
sudo chmod 666 /var/run/docker.sock

# 6. Sanity check
docker version
docker run --rm hello-world
```

After that, return to [Quick start](#quick-start).

> **Caveats of `--storage-driver=vfs`** — slower than `overlay2` and uses more
> disk because layers are copied rather than stacked. Fine for development; do
> not use for production.
>
> **State is ephemeral** — `dockerd` and `/var/lib/docker` live on the VM's
> local disk, so a fresh VM means re-running these steps. To make Docker
> available out of the box on every new Cloud Agent VM, configure an env-setup
> agent at [cursor.com/onboard](https://cursor.com/onboard).

## Troubleshooting

- **Front returns `502 Bad Gateway` for a few seconds after `taiga-up`** — normal; `taiga-back` is still booting. Re-try after ~20s.
- **`docker compose` not found** — install the compose plugin: `sudo apt-get install docker-compose-v2`.
- **`docker: command not found` or `dockerd` won't start** — see [Setting up Docker in a sandboxed VM](#setting-up-docker-in-a-sandboxed-vm).
- **`Cannot connect to the Docker daemon at unix:///var/run/docker.sock`** — `dockerd` isn't running. Re-attach to the tmux session with `tmux attach -t dockerd` to see why, or restart it with the command in step 4 above.
- **`iptables ... TABLE_ADD failed (Operation not supported): table nat`** — you're on `iptables-nft` in an environment that doesn't support nftables NAT. Switch to legacy iptables (step 2 above) and restart `dockerd`.
- **`failed to mount ... overlay ... invalid argument`** — overlayfs isn't available. Restart `dockerd` with `--storage-driver=vfs` (step 4 above).
- **Port 9000 already in use** — stop whatever is on it, or run `npm run taiga-down` first.

## Developing the Angular front-end against this stack

The steps above run the **prebuilt** `taigaio/taiga-front` image. If you want
to edit the AngularJS code in `app/` and see changes live, run the gulp dev
server locally and point it at the dockerized backend:

```bash
nvm use            # uses the version pinned in .nvmrc (v16.19.1)
npm install
npm start          # gulp dev server on http://localhost:9001 with livereload
```

Make sure `conf/conf.json` (copy `conf/conf.example.json`) has:

```json
{
  "api": "http://localhost:9000/api/v1/",
  "eventsUrl": "ws://localhost:9000/events"
}
```
