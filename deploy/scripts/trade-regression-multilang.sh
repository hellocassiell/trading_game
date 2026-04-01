#!/usr/bin/env bash

set -euo pipefail

API_BASE_URL="${API_BASE_URL:-http://127.0.0.1:8080}"
STOCK_CODE="${STOCK_CODE:-00700}"
LIMIT_PRICE="${LIMIT_PRICE:-}"
AMEND_PRICE="${AMEND_PRICE:-}"
LOT_QUANTITY="${LOT_QUANTITY:-100}"
RUN_ID="${RUN_ID:-$(date +%s)}"
USER_ID="${USER_ID:-u_regression_${RUN_ID}}"
CURL_NO_PROXY_ALL="${CURL_NO_PROXY_ALL:-1}"

LANGUAGES=("zh-Hant" "zh-Hans" "en")

log() {
  printf '[%s] %s\n' "$(date '+%H:%M:%S')" "$*"
}

fail() {
  printf '[ERROR] %s\n' "$*" >&2
  exit 1
}

require_bin() {
  local bin_name="$1"
  command -v "$bin_name" >/dev/null 2>&1 || fail "Missing required command: $bin_name"
}

append_lang_param() {
  local path="$1"
  local lang="$2"
  if [[ "$path" == *"?"* ]]; then
    printf '%s&lang=%s' "$path" "$lang"
  else
    printf '%s?lang=%s' "$path" "$lang"
  fi
}

api_call() {
  local method="$1"
  local path="$2"
  local lang="$3"
  local body="${4:-}"
  local idempotency_key="${5:-}"
  local request_user_id="${6:-$USER_ID}"
  local full_path

  full_path="$(append_lang_param "$path" "$lang")"

  local args=(
    -sS
    -X "$method"
    -H "X-User-Id: $request_user_id"
    -H "X-Lang: $lang"
    -H "Accept-Language: $lang"
  )

  if [[ "$CURL_NO_PROXY_ALL" == "1" ]]; then
    args+=(--noproxy "*")
  fi

  if [[ -n "$idempotency_key" ]]; then
    args+=(-H "X-Idempotency-Key: $idempotency_key")
  fi

  if [[ -n "$body" ]]; then
    args+=(
      -H "Content-Type: application/json"
      --data "$body"
    )
  fi

  curl "${args[@]}" "${API_BASE_URL}${full_path}"
}

expect_code() {
  local response="$1"
  local expected="$2"
  local context="$3"
  local actual
  actual="$(jq -r '.code // empty' <<<"$response")"
  [[ "$actual" == "$expected" ]] || fail "$context expected code=$expected but got code=$actual; response=$response"
}

expect_data_lang() {
  local response="$1"
  local expected_lang="$2"
  local context="$3"
  local actual_lang
  actual_lang="$(jq -r '.data.lang // .data.language // empty' <<<"$response")"
  [[ -n "$actual_lang" ]] || fail "$context expected data.lang or data.language but was empty; response=$response"
  [[ "$actual_lang" == "$expected_lang" ]] || fail "$context expected lang=$expected_lang but got lang=$actual_lang; response=$response"
}

derive_price() {
  local current_price="$1"
  local tick_size="$2"
  local ticks_below="$3"
  awk -v current="$current_price" -v tick="$tick_size" -v ticks="$ticks_below" \
    'BEGIN { v=current-(tick*ticks); if (v<0.05) v=0.05; printf "%.3f", v }'
}

require_bin curl
require_bin jq

log "Running multilingual trade regression against ${API_BASE_URL}"
log "Using USER_ID=${USER_ID}, STOCK_CODE=${STOCK_CODE}, QUANTITY=${LOT_QUANTITY}"

for lang in "${LANGUAGES[@]}"; do
  lang_user_id="${USER_ID}_${lang//-/_}"

  log "[$lang] Quote"
  quote_resp="$(api_call GET "/api/v1/trade/quote/${STOCK_CODE}" "$lang")"
  expect_code "$quote_resp" "200" "[$lang] quote"
  expect_data_lang "$quote_resp" "$lang" "[$lang] quote"
  current_price="$(jq -r '.data.currentPrice // empty' <<<"$quote_resp")"
  tick_size="$(jq -r '.data.tickSize // empty' <<<"$quote_resp")"
  [[ -n "$current_price" ]] || fail "[$lang] quote missing currentPrice; response=$quote_resp"
  [[ -n "$tick_size" ]] || fail "[$lang] quote missing tickSize; response=$quote_resp"

  if [[ -n "$LIMIT_PRICE" ]]; then
    limit_price="$LIMIT_PRICE"
  else
    limit_price="$(derive_price "$current_price" "$tick_size" 1)"
  fi

  if [[ -n "$AMEND_PRICE" ]]; then
    amend_price="$AMEND_PRICE"
  else
    amend_price="$(derive_price "$current_price" "$tick_size" 2)"
  fi

  order_payload="$(jq -nc \
    --arg stockCode "$STOCK_CODE" \
    --arg direction "BUY" \
    --arg orderType "LIMIT" \
    --argjson price "$limit_price" \
    --argjson quantity "$LOT_QUANTITY" \
    '{stockCode:$stockCode,direction:$direction,orderType:$orderType,price:$price,quantity:$quantity}')"

  log "[$lang] Preview"
  preview_resp="$(api_call POST "/api/v1/trade/orders/preview" "$lang" "$order_payload" "" "$lang_user_id")"
  expect_code "$preview_resp" "200" "[$lang] preview"
  expect_data_lang "$preview_resp" "$lang" "[$lang] preview"

  log "[$lang] Submit"
  submit_resp="$(api_call POST "/api/v1/trade/orders" "$lang" "$order_payload" "" "$lang_user_id")"
  expect_code "$submit_resp" "200" "[$lang] submit"
  expect_data_lang "$submit_resp" "$lang" "[$lang] submit"
  order_id="$(jq -r '.data.orderId // empty' <<<"$submit_resp")"
  [[ -n "$order_id" ]] || fail "[$lang] submit missing orderId; response=$submit_resp"

  log "[$lang] Active orders"
  active_resp="$(api_call GET "/api/v1/trade/orders/active" "$lang" "" "" "$lang_user_id")"
  expect_code "$active_resp" "200" "[$lang] active orders"
  expect_data_lang "$active_resp" "$lang" "[$lang] active orders"
  jq -e --arg oid "$order_id" '.data.items[]? | select(.orderId == $oid)' <<<"$active_resp" >/dev/null \
    || fail "[$lang] orderId=$order_id not found in active orders; response=$active_resp"

  amend_payload="$(jq -nc \
    --argjson price "$amend_price" \
    --argjson quantity "$LOT_QUANTITY" \
    '{price:$price,quantity:$quantity}')"

  log "[$lang] Amend"
  amend_resp="$(api_call POST "/api/v1/trade/orders/${order_id}/amend" "$lang" "$amend_payload" "" "$lang_user_id")"
  expect_code "$amend_resp" "200" "[$lang] amend"
  expect_data_lang "$amend_resp" "$lang" "[$lang] amend"
  amended_order_id="$(jq -r '.data.orderId // empty' <<<"$amend_resp")"
  [[ -n "$amended_order_id" ]] || fail "[$lang] amend missing orderId; response=$amend_resp"

  log "[$lang] Cancel"
  cancel_resp="$(api_call POST "/api/v1/trade/orders/${amended_order_id}/cancel" "$lang" "" "" "$lang_user_id")"
  expect_code "$cancel_resp" "200" "[$lang] cancel"
  expect_data_lang "$cancel_resp" "$lang" "[$lang] cancel"

  log "[$lang] History"
  history_resp="$(api_call GET "/api/v1/trade/orders/history?page=1&pageSize=20" "$lang" "" "" "$lang_user_id")"
  expect_code "$history_resp" "200" "[$lang] history"
  expect_data_lang "$history_resp" "$lang" "[$lang] history"
  jq -e --arg oid "$amended_order_id" '.data.items[]? | select(.orderId == $oid)' <<<"$history_resp" >/dev/null \
    || fail "[$lang] orderId=$amended_order_id not found in history; response=$history_resp"

  invalid_payload="$(jq -nc \
    --arg stockCode "$STOCK_CODE" \
    --arg direction "BUY" \
    --arg orderType "LIMIT" \
    --argjson price "$limit_price" \
    '{stockCode:$stockCode,direction:$direction,orderType:$orderType,price:$price,quantity:101}')"

  log "[$lang] Error branch (non-lot quantity)"
  invalid_resp="$(api_call POST "/api/v1/trade/orders/preview" "$lang" "$invalid_payload" "" "$lang_user_id")"
  expect_code "$invalid_resp" "400" "[$lang] invalid lot quantity"
  invalid_msg="$(jq -r '.msg // empty' <<<"$invalid_resp")"
  [[ -n "$invalid_msg" ]] || fail "[$lang] invalid lot quantity returned empty msg; response=$invalid_resp"
done

sleep 2

log "[en] Duplicate submission branch (without idempotency key)"
duplicate_user_id="${USER_ID}_duplicate"
idempotency_user_id="${USER_ID}_idempotency"
duplicate_payload="$(jq -nc \
  --arg stockCode "$STOCK_CODE" \
  --arg direction "BUY" \
  --arg orderType "LIMIT" \
  --argjson price "$limit_price" \
  --argjson quantity "$LOT_QUANTITY" \
  '{stockCode:$stockCode,direction:$direction,orderType:$orderType,price:$price,quantity:$quantity}')"

dup_first_resp="$(api_call POST "/api/v1/trade/orders" "en" "$duplicate_payload" "" "$duplicate_user_id")"
expect_code "$dup_first_resp" "200" "[en] duplicate first submit"
first_order_id="$(jq -r '.data.orderId // empty' <<<"$dup_first_resp")"
[[ -n "$first_order_id" ]] || fail "[en] duplicate first submit missing orderId; response=$dup_first_resp"

dup_second_resp="$(api_call POST "/api/v1/trade/orders" "en" "$duplicate_payload" "" "$duplicate_user_id")"
expect_code "$dup_second_resp" "400" "[en] duplicate second submit"

log "[en] Idempotency branch"
idempotency_key="idem-${RUN_ID}"
idem_first_resp="$(api_call POST "/api/v1/trade/orders" "en" "$duplicate_payload" "$idempotency_key" "$idempotency_user_id")"
expect_code "$idem_first_resp" "200" "[en] idempotency first submit"
idem_order_id_1="$(jq -r '.data.orderId // empty' <<<"$idem_first_resp")"
[[ -n "$idem_order_id_1" ]] || fail "[en] idempotency first submit missing orderId; response=$idem_first_resp"

idem_second_resp="$(api_call POST "/api/v1/trade/orders" "en" "$duplicate_payload" "$idempotency_key" "$idempotency_user_id")"
expect_code "$idem_second_resp" "200" "[en] idempotency replay submit"
idem_order_id_2="$(jq -r '.data.orderId // empty' <<<"$idem_second_resp")"
[[ "$idem_order_id_2" == "$idem_order_id_1" ]] || fail "[en] idempotency replay returned different orderId: $idem_order_id_1 vs $idem_order_id_2"

idempotency_conflict_payload="$(jq -nc \
  --arg stockCode "$STOCK_CODE" \
  --arg direction "BUY" \
  --arg orderType "LIMIT" \
  --argjson price "$amend_price" \
  --argjson quantity "$LOT_QUANTITY" \
  '{stockCode:$stockCode,direction:$direction,orderType:$orderType,price:$price,quantity:$quantity}')"

idem_conflict_resp="$(api_call POST "/api/v1/trade/orders" "en" "$idempotency_conflict_payload" "$idempotency_key" "$idempotency_user_id")"
expect_code "$idem_conflict_resp" "400" "[en] idempotency conflict payload"

# Keep script rerunnable with fixed USER_ID by releasing pending test orders.
api_call POST "/api/v1/trade/orders/${first_order_id}/cancel" "en" "" "" "$duplicate_user_id" >/dev/null || true
api_call POST "/api/v1/trade/orders/${idem_order_id_1}/cancel" "en" "" "" "$idempotency_user_id" >/dev/null || true

log "Trade multilingual regression passed."
