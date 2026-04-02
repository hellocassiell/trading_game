# Design Spec: Trade Status "All" Includes Filled

## Summary
Update the backend semantics of `GET /api/v1/trade/orders/active` so that `status=ALL` returns `PENDING`, `PARTIAL_FILLED`, and `FILLED` orders. This enables the "交易状况" tab to show filled orders when users select the "已成交" filter, without changing the current UI structure. The "交易记录" tab remains unchanged and continues to show `FILLED` + `CANCELED` history.

## Goals
- "交易状况" -> "已成交" filter should display real filled orders.
- "交易状况" -> "全部" should include filled orders.
- Keep the UI layout and tab structure unchanged.
- Preserve existing history endpoint behavior.

## Non-Goals
- Redesign of records UI or tabs.
- Changing trade history rules or pagination.
- Introducing new filters beyond existing ones.

## Current Behavior
- Frontend calls `getActiveOrders(status=ALL)` for "交易状况".
- Backend treats `status=ALL` like "active only", returning `PENDING` and `PARTIAL_FILLED`.
- "已成交" filter in "交易状况" yields empty results because no `FILLED` orders are returned.
- "交易记录" uses `/api/v1/trade/orders/history` and already includes `FILLED` orders.

## Proposed Changes
### Backend
- Adjust `OrderServiceImpl.listActiveOrders`:
  - `status=ALL` returns `PENDING`, `PARTIAL_FILLED`, `FILLED`.
  - `status=FILLED` returns only `FILLED` (keep existing branch).
  - `status=PENDING` (or other values) returns `PENDING` + `PARTIAL_FILLED` (current behavior).
- No change to `/history` endpoint.

### Frontend
- No change required to requests or filter UI logic.
- Existing `filterActiveOrders` continues to separate:
  - `pending` => `PENDING` + `PARTIAL_FILLED`
  - `done` => `FILLED`
- "交易记录" remains as-is.

## Data Flow
1. Records page loads.
2. `getActiveOrders(status=ALL)` returns pending/partial/filled.
3. "交易状况" filters locally into "全部/排队中/已成交".
4. "交易记录" continues to show history list from `/history`.

## Error Handling
- No new error cases.
- Existing error handling in records page remains unchanged.

## Compatibility and Risks
- Any other consumer of `/trade/orders/active?status=ALL` will now see filled orders. If a consumer expects only active orders, it must filter locally or call a narrower status.

## Testing
- Backend: update or add unit test(s) for `listActiveOrders` to verify `status=ALL` includes `FILLED`.
- Backend controller test: verify `/api/v1/trade/orders/active?status=ALL` includes filled items.
- Frontend: no test changes required (filter logic already handles `FILLED`).

## Rollout
- Backend change first, frontend can remain unchanged.
- No migrations required.
