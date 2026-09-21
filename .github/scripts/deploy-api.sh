#!/usr/bin/env bash
set -euo pipefail

release_id="${1:?A Git commit SHA is required}"
if [[ ! "$release_id" =~ ^[0-9a-f]{40}$ ]]; then
  echo 'Invalid release ID' >&2
  exit 1
fi

live=/var/www/illustriober
release="$HOME/.illustriober-deploy/$release_id"
backup="$HOME/.illustriober-backup"

test -f "$release/apps/api/package.json"
test -f "$release/apps/api/prisma/schema.prisma"
test -f "$live/apps/api/.env"
curl -fsS --max-time 5 http://127.0.0.1:4000/health | grep -q '"status":"ok"'

# The service reads this existing server-only file. Never transfer it to GitHub.
ln -sfn "$live/apps/api/.env" "$release/apps/api/.env"
cd "$release"
npm ci --no-audit --no-fund
npm run prisma:generate --workspace apps/api
npm run build --workspace apps/api

umask 077
mkdir -p "$backup/files"
rsync -a --delete "$live/" "$backup/files/"
sudo -n -u postgres /usr/bin/pg_dump -Fc illustrioberdb > "$backup/illustrioberdb.dump"

# Apply additive migrations while the old API is still serving requests.
npm run prisma:migrate:deploy --workspace apps/api

deployment_ok=1
rsync -a --delete --exclude=.env "$release/apps/api/" "$live/apps/api/" || deployment_ok=0
if (( deployment_ok )); then
  rsync -a --delete "$release/packages/shared/" "$live/packages/shared/" || deployment_ok=0
fi
if (( deployment_ok )); then
  rsync -a --delete "$release/node_modules/" "$live/node_modules/" || deployment_ok=0
fi
if (( deployment_ok )); then
  rsync -a "$release/package.json" "$release/package-lock.json" "$live/" || deployment_ok=0
fi
if (( deployment_ok )); then
  sudo -n /usr/bin/systemctl restart illustriober-api.service || deployment_ok=0
fi

if (( deployment_ok )); then
  deployment_ok=0
  for attempt in 1 2 3 4 5 6 7 8 9 10; do
    if curl -fsS --max-time 5 http://127.0.0.1:4000/health | grep -q '"status":"ok"'; then
      deployment_ok=1
      break
    fi
    sleep 2
  done
fi

if (( ! deployment_ok )); then
  echo 'Deployment failed; restoring the previous app files' >&2
  rsync -a --delete "$backup/files/" "$live/"
  sudo -n /usr/bin/systemctl restart illustriober-api.service
  curl -fsS --max-time 5 http://127.0.0.1:4000/health | grep -q '"status":"ok"'
  exit 1
fi

echo "API release $release_id is healthy"
rm -rf -- "$release"
