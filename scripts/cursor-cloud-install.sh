#!/usr/bin/env bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
    sudo apt-get update
    sudo apt-get install -y docker.io docker-compose-v2
fi

if command -v update-alternatives >/dev/null 2>&1; then
    if [ -x /usr/sbin/iptables-legacy ]; then
        sudo update-alternatives --set iptables /usr/sbin/iptables-legacy
    fi
    if [ -x /usr/sbin/ip6tables-legacy ]; then
        sudo update-alternatives --set ip6tables /usr/sbin/ip6tables-legacy
    fi
fi

sudo usermod -aG docker "${USER:-ubuntu}" || true

if [ ! -d taiga-docker ]; then
    git clone https://github.com/taylor-curran/taiga-docker.git taiga-docker
fi

if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "$HOME/.nvm/nvm.sh"
    nvm install 16.19.1
    nvm use 16.19.1
fi
npm ci

if [ -s "$HOME/.nvm/nvm.sh" ]; then
    # shellcheck source=/dev/null
    . "$HOME/.nvm/nvm.sh"
    nvm install 22
    nvm use 22
fi
npm --prefix web-react ci
