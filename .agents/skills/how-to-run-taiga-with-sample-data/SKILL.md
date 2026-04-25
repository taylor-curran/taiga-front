---
name: how-to-run-taiga-with-sample-data
description: Run the Taiga reference stack with seeded sample data in Cursor Cloud. Use when asked to start Taiga, run the app, verify the UI, load sample data, or test the React port against the dockerized backend. Captures the validated Docker vfs setup for sandboxed Ubuntu VMs.
---

# Run Taiga with sample data in Cursor Cloud

Use this skill when the user asks to run Taiga, start the app, load sample data,
verify the UI, or test the React port against a real backend.

End state:

- Docker runs manually with storage driver `vfs`.
- Taiga gateway is available at <http://localhost:9000>.
- React dev server is available at <http://localhost:5173>.
- Admin login is `admin` / `adminpass`.
- Sample data is loaded; verified result is 7 projects.

## What can be preinstalled

These are machine-level prerequisites. If they are already present, do not
reinstall them unnecessarily.

- `docker.io`
- `docker-compose-v2`
- `iptables-legacy` and `ip6tables-legacy`
- `nvm` with Node `16.19.1` and Node `22`

The Cursor Cloud sandbox still needs `dockerd` to be started manually because
there is no systemd.

## Recommended flow

From the repo root:

```bash
bash scripts/cursor-cloud-install.sh
```

Start Docker in a long-lived terminal or tmux session:

```bash
bash scripts/cursor-cloud-dockerd.sh
```

Start and seed Taiga in another terminal:

```bash
bash scripts/cursor-cloud-taiga.sh
```

Start the React app if it is not already running from `.cursor/environment.json`:

```bash
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  . "$HOME/.nvm/nvm.sh"
  nvm use 22
fi
npm run react
```

## Why the scripts exist

Cursor Cloud Ubuntu VMs can have these constraints:

- Docker may not be installed.
- `systemd` is not PID 1, so `systemctl start docker` does not work.
- `overlay2` cannot mount overlayfs inside the sandbox.
- nftables NAT can fail, so Docker needs legacy iptables.
- Compose v2 is a separate Ubuntu package.

The checked-in scripts encode the validated workaround:

- `scripts/cursor-cloud-install.sh`
  - Installs `docker.io` and `docker-compose-v2` if missing.
  - Switches iptables alternatives to legacy.
  - Clones `taiga-docker` if missing.
  - Installs root dependencies under Node `16.19.1`.
  - Installs React dependencies under Node `22`.
- `scripts/cursor-cloud-dockerd.sh`
  - Runs `sudo dockerd --storage-driver=vfs`.
  - Waits for `/var/run/docker.sock` and makes it usable in the current session.
- `scripts/cursor-cloud-taiga.sh`
  - Waits for Docker.
  - Runs `npm run taiga-up`.
  - Runs idempotent `npm run taiga-seed`.
  - Tails Taiga backend/events logs.

## Verification

Run these checks after startup:

```bash
docker info --format 'driver={{.Driver}}'
docker compose -f taiga-docker/docker-compose.yml ps
curl -sS http://localhost:9000/conf.json
```

Authenticate and verify seeded projects:

```bash
token="$(
  curl -sS -X POST http://localhost:9000/api/v1/auth \
    -H 'Content-Type: application/json' \
    -d '{"type":"normal","username":"admin","password":"adminpass"}' \
    | node -e "let s=''; process.stdin.on('data', d => s += d); process.stdin.on('end', () => console.log(JSON.parse(s).auth_token || ''))"
)"

curl -sS http://localhost:9000/api/v1/projects \
  -H "Authorization: Bearer $token" \
  | node -e "let s=''; process.stdin.on('data', d => s += d); process.stdin.on('end', () => console.log(JSON.parse(s).length + ' projects'))"
```

Expected:

- Docker driver is `vfs`.
- Taiga compose services are running.
- `conf.json` points API traffic at `http://localhost:9000/api/v1/`.
- Project count is `7 projects`.

## Common problems

- `docker: command not found`: run `bash scripts/cursor-cloud-install.sh`.
- `Cannot connect to the Docker daemon`: start `bash scripts/cursor-cloud-dockerd.sh`.
- `TABLE_ADD failed ... table nat`: use legacy iptables; the install script does this.
- `failed to mount ... overlay ... invalid argument`: start Docker with `--storage-driver=vfs`; the dockerd script does this.
- React build fails with `crypto.getRandomValues is not a function`: switch to Node `22`.
- Legacy Angular/Gulp or `node-sass` fails under Node `22`: switch to Node `16.19.1`.

