#!/usr/bin/env bash

set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1}"
USER_ID="${USER_ID:-u_10001}"

echo "Using API_BASE_URL=$API_BASE_URL"

curl -fsS "$API_BASE_URL/" >/dev/null
echo "OK /"

curl -fsS "$API_BASE_URL/api/v1/home/overview" >/dev/null
echo "OK /api/v1/home/overview"

curl -fsS -H "X-User-Id: $USER_ID" "$API_BASE_URL/api/v1/account/profile" >/dev/null
echo "OK /api/v1/account/profile"

curl -fsS "$API_BASE_URL/api/v1/trade/quote/00700" >/dev/null
echo "OK /api/v1/trade/quote/00700"

echo "Checking SSE stream for one event chunk..."
curl -fsS -N --max-time 15 "$API_BASE_URL/api/v1/trade/quote/stream?stockCode=00700" | head -n 5

echo "Smoke test finished."
