# Running the Angular App with Sample Data

A short guide for getting the Taiga AngularJS front-end running locally with a database that already contains demo projects, users, sprints, and issues.

You'll end up with the app at <http://localhost:9000> and an admin login of `admin` / `adminpass`.

## Requirements

- Docker Engine 19.03+ with the `docker compose` plugin
- Free ports `9000` on the host

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

## Troubleshooting

- **Front returns `502 Bad Gateway` for a few seconds after `taiga-up`** — normal; `taiga-back` is still booting. Re-try after ~20s.
- **`docker compose` not found** — install the compose plugin: on Debian/Ubuntu, `sudo apt-get install docker-compose-v2`.
- **Sandboxed environments without `overlayfs` / nftables NAT** (e.g. some CI or Cloud Agent VMs) — start the daemon with `sudo dockerd --storage-driver=vfs` and switch the iptables alternative to `iptables-legacy`:

  ```bash
  sudo update-alternatives --set iptables  /usr/sbin/iptables-legacy
  sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
  ```

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
