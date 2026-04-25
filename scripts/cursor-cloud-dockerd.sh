#!/usr/bin/env bash
set -euo pipefail

# Cursor Cloud VMs do not boot with systemd, so run dockerd in the foreground.
# The sandbox cannot mount overlayfs; vfs is slower but works reliably here.
(while [ ! -S /var/run/docker.sock ]; do sleep 1; done; sudo chmod 666 /var/run/docker.sock) &
sudo dockerd --storage-driver=vfs
