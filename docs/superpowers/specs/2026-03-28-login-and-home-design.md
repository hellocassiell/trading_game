# Frontend design spec: login through home flows

## Context
- The goal is to align the mobile H5 prototype with `docs/产品流程与接口文档-2026-03-28.md` and every image under `UI设计稿/`, with an emphasis on the orange-branded, HKD-focused tone described in `AGENTS.md`.
- The front-end threads should not introduce any fetch logic directly in pages; view models must be exposed through adapters under `frontend/lib/adapters/` so pages stay declarative.
- The backend thread is responsible for the real `/api/v1/...` endpoints, but for now we will keep the UI wired to `frontend/lib/mock-data.ts` with the ability to switch to real data later.

## Goals
1. Deliver the full pre-login journey (`/guest`, `/auth`, `/auth/pin`, `/auth/leave-confirm`, `/auth/invite`, `/auth/blocked`) so the layouts, copy, and CTA placements exactly match the design artboards.
2. Refresh the logged-in screens (home, profile, records, trade, ranking/market) to mirror the module order, copy, tabs, and HK-specific data references shown in the design.
3. Ensure every major page renders four states (`loading`, `empty`, `error`, `success`) and surface the strict HK business rules (每手、±20 ticks、价格底线、20笔买入上限、5个排队限价单、停牌/非交易时段拦截) through adapter-integrated validation messages.

## Constraints
- Visual hierarchy must stay orange/cream-based; blue tones in the old assets count only for structure, not final colors.
- All copy, labels, and number formats must be ported to a HK context (`HK$`, `港股`, `参赛者`, local stock codes such as `00700`, `0388`).
- All new UI elements must respect the mobile-first frame (max-width 430px) and keep the persistent bottom nav with the central “交易” CTA, hiding it only on modal or pre-login screens.

## Architecture
- Add new adapters (`auth.ts`, `profile.ts`, `records.ts`, `market.ts`) that wrap `mock-data` and export view models typed with `ViewStatus`. Each adapter returns the exact fields a page needs (CTA labels, card data, table rows, totals, etc.) plus a status flag.
- `frontend/lib/mock-data.ts` will grow to include the additional content referenced in `UI设计稿/` (e.g., star participant intro, leaderboard rows, top holdings/volume details, login art text, rewards copy).
- `TradeTicketCard`/`TradeModal` remain the canonical trade surface, but the trade adapter will house the validation logic for HK-specific rules and emit per-rule failure messages so the modal and confirm dialogs can surface them consistently.

## Page breakdown
### Pre-login flow
- **Guest landing (`/guest`)**: large hero area with sponsor info, initial capital highlight, CTA to `/auth`, secondary quick links (`比赛规则`, `本季奖品`, `影片`) and the bottom copyright.
- **Registration entry (`/auth`)**: gradient canvas with orb CTA labeled “手机号码注册/登录”, supporting copy about verification; close icon returns to `/guest`.
- **SMS verification (`/auth/pin`)**: card with country code, phone input, code input, countdown button, the numeric keypad, terms checkbox, “下一步” CTA, and the ability to show the leave-confirm overlay when closing.
- **Leave confirm (`/auth/leave-confirm`)**: blocked background of `/auth/pin`, modal overlay with reminder and “取消”“离开” buttons.
- **Invite friends (`/auth/invite`)**: avatar grid (preset + upload), nickname field, disabled CTA until selections made, supporting copy and CTA to finish registration to `/`.
- **Blocked account (`/auth/blocked`)**: overlay with warning icon, copy about disqualification, and a “关闭” button to `/guest`.

### Post-login home (`/`)
- Hero region with brand header, sponsor badge, event stats panel, and summary text after the gradient header.
- Stacked cards covering: (1) event stats grid, (2) reward banner, (3) user asset card (avatar, rank, daily/weekly counters, capital/bonus/cash, total, updatedAt), (4) star participant module with tabs and highlight, (5) 20大持仓 bubble/list, (6) 今日10大成交 module, (7) 每周飞跃王, (8) 赛事排行榜 with top rows.
- All cards should support `loading` skeleton, `empty` placeholder, and error fallback per adapter status.

### Profile (`/profile`)
- Top summary card (avatar, rank, counters, starting funds, bonus, cash, asset chart with dates, HKD labels) fed by `profile` adapter.
- “港股持仓” section with currency tags, holdings list (code, name, quantity, available, avg price, pnl, reference value, direction colors) that open the trade modal via `TradeTrigger`.

### Records (`/records`)
- Top gradient header with tabs “交易状况”/“交易记录” and HKD currency tag.
- Sub-section for status filters (全部/排队中/已成交) and a list grouped by date in `history` mode.
- Each list row includes code/name, side badge, status badge, price, quantity, dealt, trade ID/time, arrow, and consistent colors (yellow for pending, green for done, grey for canceled).

### Trade (`/trade/[symbol]` and modal flows)
- Use `TradeTicketCard` to show account info (remaining trades, cash), stock search button, stock info (name/code/current price, change), price steppers, quantity steppers, expected total/fee, submit button, and disclaimers.
- Trade validations (per doc) produce inline messages under the submit button or in dialogs; e.g., “非手数倍数”，“超出±20档”，“买入价不得低于 HK$0.05”等.
- Modals: confirm, success, trade detail, and edit remain part of `TradeTicketCard` but use data from the trade adapter and include the HK dialogs described in the doc.

### Rankings & Market details (`/ranking`, `/market/top-volume`, `/market/top-holdings`)
- Star participant page with gradient header, tabs, featured hero, asset stats, line chart, holdings list, footer copy, and each row opening the trade modal.
- Ranking list, top holdings, and top volume screens retain their gradient headers/back buttons, table headers, and row compositions shown in the screenshots; the live observations in `quotes` reuse these data sets.

## Status handling
- Each adapter exposes `status: ViewStatus`. Pages render the full layout for `success`, show spinner/placeholder panels for `loading`, a friendly message for `empty`, and the current failure card (or error text) for `error`.
- The trade adapter also exposes `validationMessage` for price/quantity rules so the submit button disables with the target message.
- Shared components (cards, panels) will reference the new adapter fields rather than raw mocks so wiring remains consistent.

## Implementation steps
1. Create `frontend/lib/adapters/auth.ts`, `profile.ts`, `records.ts`, and `market.ts`, then backfill `mock-data.ts` with the data each adapter needs (login copy, star participant info, leaderboard rows, status rows). Ensure `frontend/lib/api/types.ts` continues to declare `ViewStatus`.
2. Update each pre-login route to remove `PrototypeStates` and render new components that consume their adapter; implement overlays (leave confirm, blocked) and CTA flows identical to the artboards.
3. Refactor `/`, `/profile`, `/records`, `/ranking`, `/market/top-volume`, and `/market/top-holdings` to consume the new adapters, render in the prescribed order, and show the four statuses; keep the bottom nav and modals intact.
4. Align `TradeTicketCard` with the business rules (±20 ticks, lot multiples, price floors, stop-trades outside trading hours), centralize the validation strings, and ensure confirm/success dialogs show the HK copy.
5. Adjust `frontend/app/globals.css` or component styles only if needed to reinforce the orange theme, and refresh `Home`/`Profile` sections’ data formatting (HK$) where required.

## Validation
- Run `cd frontend && npm run build` after changes to ensure the App Router and Tailwind build succeed.
- Manually trigger each route (`/guest`, `/auth/pin`, `/`, `/profile`, `/records`, `/trade/0700`, `/ranking`, `/market/top-volume`, `/market/top-holdings`) to confirm the UI matches the artboards and the modal flows are invoked by the `TradeTrigger` interactions described in the doc.

## Questions & assumptions
1. Assuming the backend endpoints (`/api/v1/auth/*`, `/api/v1/home/overview`, etc.) will be wired later; the adapters stay mock-driven for now.
2. Assuming we continue to centralize trade validation inside `TradeTicketCard` (no per-page mutations) and rely on the adapter for any dynamic numbers (lot size, price min).
3. If any new backend data changes the view models, we can update the corresponding adapter without touching the pages.
