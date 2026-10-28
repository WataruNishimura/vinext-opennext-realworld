#!/bin/sh
# Prepare the local state (Wrangler default `.wrangler/state`) the Worker reads under `wrangler dev`: app data, the OpenNext
# tag-cache table and the prerendered cache entries. Run after `pnpm build:e2e`.
set -eu
cd "$(dirname "$0")/.."
STATE="$PWD/.wrangler/state"

rm -rf "$STATE"
wrangler d1 migrations apply DB --local
# The deterministic seed, written straight into the same Miniflare state (packages/db/scripts/d1.ts).
D1_DATABASE_ID=fd457de7-24ba-4ef7-a42f-6d53815b972e \
  pnpm --filter @realworld/db db:seed:local --persist-to "$STATE"
opennextjs-cloudflare populateCache local
