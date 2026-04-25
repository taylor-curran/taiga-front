#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DOCKER_SOCK="${DOCKER_HOST:-}"
DOCKER_SOCK="${DOCKER_SOCK#unix://}"
DOCKER_SOCK="${DOCKER_SOCK:-/var/run/docker.sock}"

cd "$ROOT_DIR"

for _ in $(seq 1 120); do
    if [ -S "$DOCKER_SOCK" ] && docker info >/dev/null 2>&1; then
        break
    fi
    sleep 1
done

if ! docker info >/dev/null 2>&1; then
    echo "Docker daemon did not become ready at $DOCKER_SOCK" >&2
    exit 1
fi

if [ ! -d taiga-docker ]; then
    git clone https://github.com/taylor-curran/taiga-docker.git taiga-docker
fi

npm run taiga-up
npm run taiga-seed
npm run taiga-logs
