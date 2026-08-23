#!/usr/bin/env bash
set -euo pipefail

readonly app_user="pi-geography"
readonly repository="/opt/pi-geography/app"
readonly frontend_build="${repository}/dist"
readonly web_root="/var/www/pi-server/geography"
readonly state_directory="/var/lib/pi-geography"
readonly deployment_marker="${state_directory}/last-deployed-sha"
readonly deployment_lock="/run/lock/pi-geography-deploy.lock"

if (( EUID != 0 )); then
    echo "Run this script with sudo." >&2
    exit 1
fi

exec 9>"$deployment_lock"
if ! flock --nonblock 9; then
    echo "Another Pi Geography deployment is already running; skipping." >&2
    exit 0
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

install -d -m 755 -o "$app_user" -g "$app_user" "$state_directory"

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

echo "Refreshing update timer..."
install -m 644 "${repository}/deploy/systemd/pi-geography-update.service" /etc/systemd/system/
install -m 644 "${repository}/deploy/systemd/pi-geography-update.timer" /etc/systemd/system/
systemctl daemon-reload
systemctl enable --now pi-geography-update.timer

deployed_sha="$(runuser -u "$app_user" -- git -C "$repository" rev-parse HEAD)"
marker_temp="${deployment_marker}.tmp"
printf '%s\n' "$deployed_sha" >"$marker_temp"
chmod 644 "$marker_temp"
mv -- "$marker_temp" "$deployment_marker"

echo "Geography deployment completed successfully."
