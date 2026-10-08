#!/usr/bin/env bash
# Weekly SEO health check of the PUBLIC website: looks at it the way Google does (sitemap addresses, titles,
# descriptions, canonical and language links, structured data, noindex) and messages the alert channel.
#   bash deploy/seo-check.sh            # runs the check and sends the result
#   bash deploy/seo-check.sh --quiet    # only messages when something FAILs
set -uo pipefail
. "$(dirname "$0")/lib.sh"
cd "$PROJECT_DIR"
site="$(env_get SITE_URL)"
[ -n "$site" ] || { echo "No SITE_URL in .env."; exit 0; }

out="$(docker compose exec -T app npx tsx scripts/seo-check.ts --base "$site" --quiet 2>&1)"; rc=$?
summary="$(printf '%s\n' "$out" | grep -E '^[0-9]+ checks' | tail -1)"
mkdir -p backups
printf '%s\n%s\n' "$(date '+%F %T')" "$out" > backups/seo-check.log

if [ "$rc" -ne 0 ]; then
  fails="$(printf '%s\n' "$out" | grep -E '^FAIL' | head -4 | tr '\n' ';' | cut -c1-600)"
  notify "SEO check found PROBLEMS on $site: $fails See backups/seo-check.log. ($summary)"
  exit 1
fi
[ "${1:-}" = "--quiet" ] || notify "SEO weekly check OK on $site: ${summary:-no summary}"
exit 0
