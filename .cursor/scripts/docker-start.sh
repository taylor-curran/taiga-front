#!/usr/bin/env bash
set -euo pipefail

DOCKER_DATA_ROOT="${DOCKER_DATA_ROOT:-$HOME/.docker-data}"
DOCKER_EXEC_ROOT="${DOCKER_EXEC_ROOT:-$HOME/.docker-exec}"
DOCKER_PID_FILE="${DOCKER_PID_FILE:-$DOCKER_EXEC_ROOT/docker.pid}"
DOCKER_CONTAINERD_ROOT="${DOCKER_CONTAINERD_ROOT:-$HOME/.docker-containerd}"
DOCKER_CONTAINERD_PID_FILE="${DOCKER_CONTAINERD_PID_FILE:-$DOCKER_EXEC_ROOT/containerd.pid}"
DOCKER_CONTAINERD_SOCKET="${DOCKER_CONTAINERD_SOCKET:-$DOCKER_EXEC_ROOT/containerd/containerd.sock}"
DOCKER_HOST_SOCKET="${DOCKER_HOST_SOCKET:-/var/run/docker.sock}"

mkdir -p "$DOCKER_DATA_ROOT" "$DOCKER_EXEC_ROOT" "$DOCKER_CONTAINERD_ROOT" "$(dirname "$DOCKER_CONTAINERD_SOCKET")" /var/run

if [ -S "$DOCKER_HOST_SOCKET" ]; then
  sudo chmod 666 "$DOCKER_HOST_SOCKET" || true
fi

if docker info >/dev/null 2>&1; then
  echo "[docker-start] Docker daemon already running."
  exit 0
fi

if ! command -v dockerd >/dev/null 2>&1; then
  echo "[docker-start] dockerd is not installed. Rebuild the Cursor environment from .cursor/Dockerfile." >&2
  exit 1
fi

if ! command -v containerd >/dev/null 2>&1; then
  echo "[docker-start] containerd is not installed. Rebuild the Cursor environment from .cursor/Dockerfile." >&2
  exit 1
fi

if [ -f "$DOCKER_CONTAINERD_PID_FILE" ]; then
  pid="$(cat "$DOCKER_CONTAINERD_PID_FILE" 2>/dev/null || true)"
  if [ -z "${pid:-}" ] || ! kill -0 "$pid" >/dev/null 2>&1; then
    rm -f "$DOCKER_CONTAINERD_PID_FILE"
  fi
fi

if [ ! -f "$DOCKER_CONTAINERD_PID_FILE" ]; then
  echo "[docker-start] Starting containerd at $DOCKER_CONTAINERD_SOCKET."
  sudo containerd \
    --address "$DOCKER_CONTAINERD_SOCKET" \
    --root "$DOCKER_CONTAINERD_ROOT/root" \
    --state "$DOCKER_CONTAINERD_ROOT/state" \
    >"$DOCKER_EXEC_ROOT/containerd.log" 2>&1 &
  echo "$!" > "$DOCKER_CONTAINERD_PID_FILE"
fi

for _ in $(seq 1 60); do
  if sudo ctr --address "$DOCKER_CONTAINERD_SOCKET" version >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

if [ -f "$DOCKER_PID_FILE" ]; then
  pid="$(cat "$DOCKER_PID_FILE" 2>/dev/null || true)"
  if [ -n "${pid:-}" ] && kill -0 "$pid" >/dev/null 2>&1; then
    echo "[docker-start] Waiting for existing dockerd pid $pid."
  else
    rm -f "$DOCKER_PID_FILE"
  fi
fi

if [ ! -f "$DOCKER_PID_FILE" ]; then
  echo "[docker-start] Starting dockerd with fuse-overlayfs at $DOCKER_DATA_ROOT."
  sudo dockerd \
    --host="unix://$DOCKER_HOST_SOCKET" \
    --storage-driver=fuse-overlayfs \
    --data-root="$DOCKER_DATA_ROOT" \
    --exec-root="$DOCKER_EXEC_ROOT" \
    --pidfile="$DOCKER_PID_FILE" \
    --containerd="$DOCKER_CONTAINERD_SOCKET" \
    >"$DOCKER_EXEC_ROOT/dockerd.log" 2>&1 &
fi

for _ in $(seq 1 120); do
  if [ -S "$DOCKER_HOST_SOCKET" ]; then
    sudo chmod 666 "$DOCKER_HOST_SOCKET" || true
  fi
  if docker info >/dev/null 2>&1; then
    sudo chmod 666 "$DOCKER_HOST_SOCKET" || true
    echo "[docker-start] Docker daemon ready."
    exit 0
  fi
  sleep 1
done

echo "[docker-start] Docker daemon failed to become ready. Recent logs:" >&2
if command -v tail >/dev/null 2>&1; then
  tail -n 80 "$DOCKER_EXEC_ROOT/dockerd.log" >&2 || true
fi
exit 1
