#!/usr/bin/env bash
# Automated SEO agent: runs daily (quick) or weekly (thorough with article suggestions).
# Cron: daily at 06:00 UAE time (02:00 UTC), weekly on Sunday with --weekly.
#   bash deploy/seo-agent.sh               # daily check
#   bash deploy/seo-agent.sh --weekly      # weekly deep scan with content plan
#   bash deploy/seo-agent.sh --quiet       # only messages when score drops below 70
set -uo pipefail
. "$(dirname "$0")/lib.sh"
cd "$PROJECT_DIR"
site="$(env_get SITE_URL)"
[ -n "$site" ] || { echo "No SITE_URL in .env."; exit 0; }

mode="daily"
quiet=false
args="--base $site"
for a in "$@"; do
  case "$a" in
    --weekly) mode="weekly"; args="$args --weekly" ;;
    --quiet) quiet=true ;;
  esac
done

out="$(docker compose exec -T app npx tsx scripts/seo-agent.ts $args 2>&1)"; rc=$?
score="$(printf '%s\n' "$out" | grep -oP 'SEO SCORE: \K[0-9]+')"
mkdir -p backups
printf '%s\n%s\n' "$(date '+%F %T') ($mode)" "$out" > backups/seo-agent.log

if [ "$rc" -ne 0 ]; then
  notify "SEO Agent ($mode): PROBLEMS found on $site (score ${score:-?}/100). See backups/seo-agent.log."
  exit 1
fi

if [ "$quiet" = true ] && [ "${score:-100}" -ge 70 ]; then
  exit 0
fi

notify "SEO Agent ($mode): score ${score:-?}/100 on $site. See backups/seo-agent.log."
exit 0
