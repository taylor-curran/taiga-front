# Running the Angular App with Sample Data

A short guide for getting the Taiga AngularJS front-end running locally with a database that already contains demo projects, users, sprints, and issues.

You'll end up with the app at <http://localhost:9000> and an admin login of `admin` / `adminpass`.

## Requirements

- Docker Engine 19.03+ with the `docker compose` plugin
- Free port `9000` on the host

If you're on a sandboxed VM (e.g. a Cursor Cloud Agent) where Docker isn't
preinstalled, see [Setting up Docker in a sandboxed VM](#setting-up-docker-in-a-sandboxed-vm)
below first.

## Quick start

From the repository root:

```bash
# 1. Bring up the full Taiga stack (db, back, events, front, gateway, rabbitmq...)
npm run taiga-up

# 2. Wait until the API is reachable (usually ~15-30s after step 1)
until curl -fsS http://localhost:9000/api/v1/ >/dev/null; do sleep 2; done

# 3. Create the admin superuser (admin / adminpass)
npm run taiga-superuser

# 4. Load the sample data (5 projects, ~14 users, milestones, issues...)
npm run taiga-sample-data
```

Then open <http://localhost:9000> in your browser and log in as **`admin` / `adminpass`**.

The sample-data users are `user1` … `user14` with the default password `123123`.

## What the npm scripts do

The scripts above are defined in [`package.json`](./package.json) and wrap the
`docker compose` invocations against [`taiga-docker/`](./taiga-docker/):

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

You should see 5 projects (`project-1`, `project-2`, `project-4`, `project-6`, `project-7`).

## Resetting the database

`sample_data` is destructive but can be re-run. To completely wipe state and
start over:

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

These steps are only needed if `docker --version` returns
`command not found`, or `dockerd` won't start with the default settings. They
were verified on a Cursor Cloud Agent (Ubuntu 24.04) sandbox where there is no
`systemd`, no `overlayfs` mount support, and the kernel's nftables `nat` table
is not available.

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

After that, you can run the [Quick start](#quick-start) above as normal.

> **Caveats of `--storage-driver=vfs`** — slower than `overlay2` and uses more
> disk because layers are copied rather than stacked. Fine for development; do
> not use for production.
>
> **State is ephemeral** — `dockerd` and the `/var/lib/docker` directory live on
> the VM's local disk, so a fresh VM means re-running these steps. To avoid
> repeating this every session, consider configuring an env-setup agent at
> [cursor.com/onboard](https://cursor.com/onboard) so new Cloud Agent VMs come
> up with Docker already installed and `dockerd` already running.

## Troubleshooting

- **Front returns `502 Bad Gateway` for a few seconds after `taiga-up`** — normal; `taiga-back` is still booting. Re-try after ~20s.
- **`docker compose` not found** — install the compose plugin: on Debian/Ubuntu, `sudo apt-get install docker-compose-v2`.
- **`docker: command not found` or `dockerd` won't start** — see [Setting up Docker in a sandboxed VM](#setting-up-docker-in-a-sandboxed-vm).
- **`Cannot connect to the Docker daemon at unix:///var/run/docker.sock`** — `dockerd` isn't running. Re-attach to the tmux session with `tmux attach -t dockerd` to see why, or restart it with the command in step 4 above.
- **`iptables ... TABLE_ADD failed (Operation not supported): table nat`** — you're on `iptables-nft` in an environment that doesn't support nftables NAT. Switch to legacy iptables (step 2 above) and restart `dockerd`.
- **`failed to mount ... overlay ... invalid argument`** — overlayfs isn't available. Restart `dockerd` with `--storage-driver=vfs` (step 4 above).

## Developing the Angular front-end against this stack

The steps above run the **prebuilt** `taigaio/taiga-front` image. If you want to
edit the AngularJS code in `app/` and see changes live, run the gulp dev server
locally and point it at the dockerized backend:

```bash
nvm use            # picks up the version pinned in .nvmrc (v16.19.1)
npm install
npm start          # gulp dev server on http://localhost:9001 with livereload
```

Make sure `conf/conf.json` (copied from `conf/conf.example.json`) has:

```json
{
  "api": "http://localhost:9000/api/v1/",
  "eventsUrl": "ws://localhost:9000/events"
}
```
