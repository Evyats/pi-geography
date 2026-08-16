#!/usr/bin/env bash
set -euo pipefail

readonly app_user="pi-geography"
readonly repository="/opt/pi-geography/app"
readonly frontend_build="${repository}/dist"
readonly web_root="/var/www/pi-server/geography"

if (( EUID != 0 )); then
    echo "Run this script with sudo." >&2
    exit 1
fi

if [[ ! -d "$repository" ]]; then
    echo "Repository not found: $repository" >&2
    exit 1
fi

current_branch="$(runuser -u "$app_user" -- git -C "$repository" branch --show-current)"
if [[ "$current_branch" != "deploy" ]]; then
    echo "Expected the repository to be on deploy, found: $current_branch" >&2
    exit 1
fi

echo "Pulling ready-to-run deployment..."
runuser -u "$app_user" -- git -C "$repository" pull --ff-only origin deploy

if [[ ! -f "${frontend_build}/index.html" ]]; then
    echo "Built frontend not found: ${frontend_build}/index.html" >&2
    exit 1
fi

echo "Publishing geography app..."
install -d -m 755 -o root -g root "$web_root"
cp -a "${frontend_build}/." "$web_root/"
find "$web_root" -type d -exec chmod 755 {} +
find "$web_root" -type f -exec chmod 644 {} +
chown -R root:root "$web_root"

echo "Geography deployment completed successfully."
