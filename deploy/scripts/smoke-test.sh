#!/usr/bin/env bash

set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1}"
USER_ID="${USER_ID:-u_10001}"
RUN_TRADE_REGRESSION="${RUN_TRADE_REGRESSION:-0}"

echo "Using API_BASE_URL=$API_BASE_URL"

root_status="$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE_URL/" || true)"
if [[ "$root_status" =~ ^2 ]]; then
  echo "OK /"
else
  echo "WARN / returned HTTP $root_status (non-blocking)"
fi

curl -fsS "$API_BASE_URL/api/v1/home/overview" >/dev/null
echo "OK /api/v1/home/overview"

curl -fsS -H "X-User-Id: $USER_ID" "$API_BASE_URL/api/v1/account/profile" >/dev/null
echo "OK /api/v1/account/profile"

curl -fsS "$API_BASE_URL/api/v1/trade/quote/00700" >/dev/null
echo "OK /api/v1/trade/quote/00700"

echo "Checking SSE stream for one event chunk..."
if stream_chunk="$(curl -sS -N --max-time 15 "$API_BASE_URL/api/v1/trade/quote/stream?stockCode=00700" | head -n 5)"; then
  if [[ -n "$stream_chunk" ]]; then
    echo "$stream_chunk"
    echo "OK SSE /api/v1/trade/quote/stream"
  else
    echo "WARN SSE stream returned no event chunk within timeout (non-blocking)"
  fi
else
  echo "WARN SSE stream check failed or timed out (non-blocking)"
fi

if [[ "$RUN_TRADE_REGRESSION" == "1" ]]; then
  echo "Running multilingual trade regression..."
  API_BASE_URL="$API_BASE_URL" USER_ID="$USER_ID" ./deploy/scripts/trade-regression-multilang.sh
fi

echo "Smoke test finished."
