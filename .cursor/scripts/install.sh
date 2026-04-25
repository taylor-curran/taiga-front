#!/usr/bin/env bash
set -euo pipefail

bash .cursor/scripts/docker-start.sh

if [ ! -d taiga-docker ]; then
  git clone https://github.com/taylor-curran/taiga-docker.git taiga-docker
fi

(cd taiga-docker && docker compose pull)
npm --prefix web-react install
