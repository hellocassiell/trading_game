# AGENTS.md

本文件是本仓库的常驻执行入口。每次开始任务前，先读本文件，再按任务类型继续读对应文档。

如果项目规则、目录结构、测试命令或接口约定发生变化，需要在同一轮任务里顺手更新本文件，避免后续忘记项目梗概。

## 1. 项目梗概

- 项目名称：港股模拟交易系统 / Mobile Trading Game
- 业务目标：为参赛者提供高仿真的港股模拟交易体验，包含行情、下单、撮合、费用计算、T+2 结算、排行榜与个人资产视图。
- 初始资金：每位参赛者 1,000,000 HKD 虚拟资金。
- 设计方向：移动端 H5，高保真原型，橙色主题，贴近 AASTOCKS / 比赛活动页风格。
- 当前前端还原基准：`UI设计稿/` 文件夹中的两张流程总图与单张页面截图是最准确的前端还原依据；页面结构、元素层级、弹窗关系、模块顺序和跳转路径必须优先参考该文件夹。

## 2. 文档优先级

当文档、代码、口头需求不一致时，默认按以下优先级判断：

1. 用户本轮最新明确要求
2. `AGENTS.md`
3. `UI设计稿/`（前端页面结构、页面元素、视觉层级、弹窗样式、流程图与跳转关系）
4. `PRD.md`
5. `港股模拟交易系统需求.md`
6. `前端流程及模块设计.md`
7. `后端开发文档/` 下的 AOB 行情接入文档
8. `测试验收报告.md`
9. 当前代码实现

注意：

- 现有代码不一定完全追平 PRD，遇到差异时不要想当然沿用旧实现，要先按 PRD 校对。
- 如果确认需要暂时偏离 PRD，必须在改动说明和本文件中记录原因。
- 前端任务遇到设计稿与旧页面实现不一致时，默认以 `UI设计稿/` 为准做高保真还原，不沿用旧实现凑合。
- `UI设计稿/` 里的两张流程总图和单页截图都属于强约束参考，不能只看其中一张图就自行补完其余页面。
- 如果 `UI设计稿/` 中仍残留美股文案、美股代码或美元单位，这些只可视为旧版占位内容；落地时必须统一替换为港股语境、港元单位与港股交易规则。

## 3. 开工前必读顺序

### 通用任务

1. 先读 `AGENTS.md`
2. 再读 `PRD.md`
3. 如果涉及详细业务边界，再读 `港股模拟交易系统需求.md`

### 前端任务

1. `AGENTS.md`
2. `UI设计稿/` 下两张流程总图与对应单页截图
3. `前端流程及模块设计.md`
4. 相关页面与组件
5. `frontend/lib/mock-data.ts`

### 后端交易规则 / 费用 / 撮合任务

1. `AGENTS.md`
2. `PRD.md`
3. `港股模拟交易系统需求.md`
4. `测试验收报告.md`
5. 对应 `backend/src/main/...` 与 `backend/src/test/...`

### 行情接入 / MQ 任务

1. `AGENTS.md`
2. `后端开发文档/AOB港股HTTP行情接口.md`
3. `后端开发文档/AOB港股行情订阅推送.md`
4. `backend/src/main/java/com/simtrade/backend/config/`
5. `backend/src/main/java/com/simtrade/backend/mq/`

## 4. 必须记住的核心业务规则

- 交易市场：港股模拟交易。
- 交易时段：香港交易日 09:30-12:00、13:00-16:00。
- 不支持竞价时段交易。
- 仅允许白名单股票池与指定 ETF。
- 不支持融资、沽空、新股认购。
- 委托类型：仅限价盘、市价盘。
- 交易单位：必须按手，不允许碎股。
- 单日买入上限：20 笔；卖出不限。
- 限价盘轮候上限：每账户最多 5 个排队中限价单。
- 限价价格规则：必须在当前按盘价上下 20 个价位内。
- 价格底线：买入不低于 HK$0.05；卖出不低于 HK$0.01。
- 撮合价格：以当时按盘价成交。
- 结算：T+2 营业日。
- 停牌时：只能取消未成交挂单，不能新增买卖。
- 费用规则必须严格符合 PRD 的 5 项费用与上下限。

## 5. 当前仓库现状

### 前端

- 目录：`frontend/`
- 技术栈：Next.js App Router、TypeScript、Tailwind CSS 4、React 19
- 当前状态：以前端高保真原型为主，页面数据已优先通过 `frontend/lib/adapters/` + `frontend/lib/api/` 调后端 `/api/v1` 接口
- 当前多语：已支持 `zh-Hant` / `zh-Hans` / `en`，默认 `zh-Hant`；语言切换入口位于 `/more`，接口请求统一透传 `X-Lang` + `lang`
- 当前补充：已建立初步前端数据收口层，读取与提交逻辑优先放在 `frontend/lib/adapters/` 与 `frontend/lib/api/`，页面层不要再直接散写接口请求
- 当前补充：头像资源采用本地静态文件方案，统一放在 `frontend/public/avatars/`；前后端默认返回/渲染本地路径，避免外网依赖
- 当前补充：`/auth/invite` 已支持真实头像上传（`multipart/form-data`），上传成功后保存后端返回的 `avatarId`，并在首页/个人页通过 adapter 映射渲染
- 当前补充：当前推荐演示部署路径为 `Vercel + 本地后端 HTTPS 穿透`；前端部署到 Vercel 时，`NEXT_PUBLIC_API_BASE_URL` 必须配置为后端的绝对 `https://` 穿透地址
- 已有页面：登录、主页、个人、记录、更多、交易链路、排行榜、市场榜单等
- 当前补充：首页排行榜模块右上角“更多”已改为进入独立 `/leaderboard` 页面，当前最多展示前 100 位；星级参赛者继续使用 `/ranking`
- 当前事实：前端已补 adapter 层自动化测试与统一 `npm run test` 入口；交易链路（搜索/报价/下单/改单/撤单）已通过前端 adapter 对接现有后端接口；`/trade/[symbol]/detail` 已接入实时报价与买卖盘（先拉快照，再通过 SSE 订阅增量），且已补 `zh-Hant / zh-Hans / en` 多语展示；`/trade/[symbol]/confirm`、`/edit`、`/success`、`/validity` 已切换为正式 `TradeTicketCard` 实现，不再依赖 `PrototypeStates` 预览壳；`/records` 的 `交易状况` 与 `交易记录` 两个 tab 均可进入订单详情，且非排队中订单会按只读详情展示
- 当前登录前实现约束：`/auth/invite` 是注册选择头像与昵称页，不是邀请好友页；`注册中途离开确认` 与 `账户被封锁` 按设计稿必须做成当前页弹窗，不再落独立路由页；输入场景统一使用设备原生键盘
- 当前登录前实现约束补充：注册昵称最长 8 个字符，头像与昵称确认后需提交 `/api/v1/auth/profile` 并以后端回读结果作为最终展示来源
- 当前登录页补充：`/auth` 需包含手机号输入、验证码输入、右侧获取验证码按钮、60 秒倒计时与重新获取逻辑，再进入选择头像页
- 当前登录前补充：`/guest` 的 `本季奖品`、`影片介绍`、`比赛规则` 均为当前页弹窗，不再跳转到其他页面

### 后端

- 目录：`backend/`
- 技术栈：Spring Boot 2.7、Java 17、MyBatis-Plus、MySQL、Redis、RabbitMQ
- 当前状态：已有订单提交、撮合、手续费计算、统一返回结构、全局异常处理、手续费单元测试
- 当前新增：已补 `AccountLedgerService` 账本层，撮合后会更新可用/冻结/在途资金与持仓（含限价挂单冻结、撤单释放、T+2 结算入账）；订单详情/历史视图已可返回 `settlementDate`、`settlementStatus`、`estimatedNetCashFlow`
- 当前新增：AOB 行情链路已补 protobuf 解码与订阅发布能力（`aob.subscription.*`），`MarketDataConsumer` 支持 protobuf/JSON 双格式消费并统一进入实时推送+撮合
- 当前新增：下单去重已升级为 Redis 优先（`trade:dedup:submit:*`，1500ms 窗口），开发环境默认保留本地内存兜底；若开启 `app.order.redis-strict-mode`（`application-prod.yml` 默认 `true`）则 Redis 不可用时会直接抛错
- 当前新增：下单接口支持 `X-Idempotency-Key`（24h 语义幂等）；同 key 同请求返回同一 `orderId`，同 key 不同请求返回 400
- 当前新增：撮合已支持按订单簿逐级消耗量（逐笔部分成交）+ 价格优先/时间优先；无可用订单簿流动性时回退按盘价撮合
- 当前新增：已引入 `TradingCalendarService`（周末+可配置 `trading.hk-holidays`）统一交易日与 T+2 计算
- 当前新增：已补独立 T+2 清算调度入口 `SettlementScheduler`，默认按香港时区每日 06:05 自动执行 `AccountLedgerService.processSettlements(...)`；读接口中的顺手结算目前仍保留为兜底
- 当前新增：订单主链路（下单/改单/撤单/查询）已改为 DB 优先，不再保留本地订单 in-memory fallback
- 当前多语：`/api/v1` 控制器统一解析 `X-Lang`/`lang`/`Accept-Language`，核心接口返回 `lang`，错误消息由全局异常处理按语言本地化
- 当前多语补充：`/api/v1/trade/orders`、`/preview`、`/cancel` 返回体同时包含 `language` 与 `lang` 字段，兼容旧前端并对齐新约定
- 当前事实：实现是可运行雏形，不是完整生产版
- 当前补充：账户持仓接口已改为按 `X-User-Id` 对应用户的已成交订单聚合返回；注册流程支持提交昵称与头像到后端用户资料存储（`t_user_profile` 持久化，服务层 DB 优先 + 内存兜底）
- 当前补充：`POST /api/v1/auth/verify-code` 验证通过后若用户尚未设置昵称，后端会立即生成且落库一个可覆盖的默认昵称（格式 `参赛者xxxx`，四位随机数，生成时保证不与现有昵称重复）
- 当前补充：排行榜、参赛人数、星级参赛者及相关统计口径已统一改为“完成头像 + 昵称”的已注册参赛者；未交易但已完成注册的用户也必须进入榜单，默认总资产 `1,000,000 HKD`、涨跌幅 `0.00%`
- 当前补充：前端请求用户态 `/api/v1` 接口时不得再注入 demo `userId`；仅在本地已登录会话存在时透传真实 `X-User-Id`
- 当前补充：头像资料存储新增白名单校验（`a1~a6`）+ 上传文件路径校验；上传文件落本地目录 `uploads/avatars`，由后端 `/api/v1/auth/avatar-files/{filename}` 提供读取
- 当前补充：账本服务新增 `app.ledger.db-strict-mode`（默认 `false`，`application-prod.yml` 默认 `true`）；开启后账本读库失败将直接抛错，不再静默回退到内存
- 当前补充：用户资料服务新增 `app.user-profile.db-strict-mode`（默认 `false`，`application-prod.yml` 默认 `true`）；开启后用户资料相关读写库失败将直接抛错，不再静默回退到内存
- 当前补充：订单服务新增 `app.order.redis-strict-mode`（默认 `false`，`application-prod.yml` 默认 `true`）；开启后 Redis 去重/幂等存取失败将直接抛错，不再回退到本地内存
- 当前补充：结算调度新增 `app.settlement.scheduler.enabled`、`app.settlement.scheduler.cron`、`app.settlement.scheduler.zone`；默认开启，默认 cron 为香港时区每日 `06:05`
- 当前补充：读接口顺手结算兜底新增 `app.settlement.read-fallback-enabled`；默认 `true` 以兼容当前行为，若独立清算调度稳定可在更真实环境中评估关闭
- 当前补充：演示环境变量样例 `deploy/env/backend.demo.env.example` 已补 `APP_LEDGER_DB_STRICT_MODE=true`、`APP_USER_PROFILE_DB_STRICT_MODE=true` 与 `APP_ORDER_REDIS_STRICT_MODE=true`，建议保持开启
- 当前补充：已新增演示环境部署骨架：`backend/Dockerfile`、`backend/src/main/resources/application-prod.yml`、`deploy/docker-compose.demo.yml`、`deploy/nginx/demo.conf`、`deploy/env/backend.demo.env.example`、`deploy/sql/init-demo.sql`、`deploy/scripts/deploy-demo.sh`、`deploy/scripts/smoke-test.sh`
- 当前补充：已新增 `frontend/Dockerfile`，用于后续服务器同机部署备选方案；当前主演示路径仍以 `Vercel + 本地后端 HTTPS 穿透` 为准
- 当前差异：
  - PRD 内部 API 倾向 `/api/v1/...`
  - 当前代码已同时存在旧接口 `/api/orders/place` 与第一批 `/api/v1/...` 只读/交易接口
  - 当前后端仍有部分 mock / 简化逻辑，例如撮合价格来源仍依赖行情按盘价/盘口深度，不含完整集合竞价与撮合引擎微结构；营业日日历已接入节假日配置，但半日市与临时停市规则尚未覆盖
  - 当前后端已补本地联调用全局 CORS 配置，默认放行 `http://localhost:*` 与 `http://127.0.0.1:*` 访问 `/api/**`
- 当前本地环境事实（2026-03-28）：
  - 已通过 Homebrew 安装 `openjdk@17`、`maven`、`mysql`、`redis`、`rabbitmq`
  - 当前 shell 默认 `java -version` 仍可能落在 JDK 24；后端执行前必须显式切到 Homebrew 的 JDK 17，例如：
    `export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home && export PATH="$JAVA_HOME/bin:$PATH"`
  - `backend/pom.xml` 已对齐到 Java 17 编译目标，不要再用其他 Java 版本直接跑 Maven
  - 已补充本地启动脚本 `backend/run-local.sh` 与最小数据库初始化脚本 `backend/init-local-db.sh`

## 6. 前端规范

- 所有前端代码放在 `frontend/` 下，不要把页面和组件散落到根目录。
- 保持移动端 H5 体验优先，不要改成后台管理系统风格。
- `UI设计稿/` 是前端高保真还原的第一参考源。两张流程总图、登录流程图、交易链路图以及所有单页截图都必须共同参考。
- 页面元素、模块顺序、卡片层级、弹窗样式、按钮位置、底部导航结构、页面跳转关系要尽量按设计稿 1:1 还原；不要自行发挥成另一套产品结构。
- 登录前链路中的 `注册中途离开确认`、`账户被封锁` 等强提示场景优先实现为当前页叠加弹窗；除非设计稿明确是独立页面，否则不要额外拆新路由。
- 视觉主题必须统一为橙色及橙色衍生色。即使设计稿的旧版画面存在蓝色主色，也只可复用其结构与布局，不可直接照搬蓝色作为最终主主题。
- 主色替换范围包括但不限于：主按钮、激活态 Tab、重点数值、图表高亮、角标、图标强调、分段控件、浮动交易按钮、榜单强调元素。
- 所有美股逻辑必须改成港股逻辑，包括但不限于：股票示例、列表标题、币种、报价单位、行情说明、持仓标题、榜单名称、搜索提示、交易说明、跳转文案。
- 前端文案和展示口径统一使用港股语境，例如：`港股持仓`、`今日10大成交港股`、`参赛者20大港股持仓`、`00700 腾讯控股`、`0388 香港交易所`、`2800 盈富基金`、`HK$ / 港元`。
- 港股交易界面必须显式体现港股特征：每手股数、按手交易、港元报价、港股代码/简称、交易时段、T+2 结算、涨跌颜色和文案都按港股比赛规则呈现。
- 页面组织优先使用 App Router 路由，通用 UI 抽到 `frontend/components/`。
- 展示型页面的数据优先走 typed adapter + API（`frontend/lib/adapters/`、`frontend/lib/api/`），避免页面里复制同一份硬编码数据。
- 页面读取数据时优先经由 `frontend/lib/adapters/` 返回页面所需 view model；对接真实接口时优先经由 `frontend/lib/api/` 发起请求，不要在页面或纯展示组件里直接写 fetch。
- 新增交互时必须补齐 4 种状态：loading、empty、error、success。
- 表单和交易输入要做显式校验，错误提示文案要可读，不要只靠浏览器原生报错。
- 手机号输入、搜索输入、交易价格/数量输入等统一使用系统原生键盘能力，不要额外绘制假的系统键盘组件。
- 对接后端前，组件层不要直接写死接口细节，优先预留清晰的请求/响应映射层。
- 不要编辑生成目录：`frontend/.next/`、`frontend/node_modules/`。
- 如果设计稿里的结构与港股业务规则冲突，处理原则是：保留设计结构与交互形式，重写文案、字段与业务口径，使之符合港股比赛规则。

## 7. 后端规范

- 所有后端代码放在 `backend/` 下，按 `controller`、`dto`、`service`、`entity`、`mapper`、`common`、`config`、`mq` 分层。
- Controller 保持薄，参数校验和请求解析放在 DTO，业务规则放在 Service。
- Bean Validation 失败走统一异常处理，不要在每个 Controller 重复拼接校验错误。
- 统一返回格式保持为 `Result<T>`，结构为 `code`、`msg`、`data`。
- 业务异常优先返回明确 4xx；系统异常返回 500，并保留排障信息到日志。
- 手续费、撮合、交易时段、T+2、停牌、价格档位等高风险规则必须有独立测试覆盖。
- 避免魔法数字，后续如果继续扩展交易规则，优先抽常量或枚举。
- 外部依赖如 AOB、RabbitMQ、Redis 不要直接散落在 Controller，必须由 service/config/mq 层统一接入。
- 如果要把现有接口逐步对齐 PRD 的 `/api/v1/...` 结构，优先保持兼容，不要无说明地破坏现有调用路径。
- 2026-03-28 当前已补齐的第一批 `/api/v1` 接口包括：
  - `GET /api/v1/account/profile`
  - `GET /api/v1/account/asset-trend`
  - `GET /api/v1/account/positions`
  - `GET /api/v1/home/overview`
  - `GET /api/v1/leaderboard/star-traders`
  - `GET /api/v1/leaderboard/top-holdings`
  - `GET /api/v1/leaderboard/top-loser-holdings`
  - `GET /api/v1/leaderboard/top-turnover`
  - `GET /api/v1/leaderboard/rankings`
  - `GET /api/v1/trade/orders/active`
  - `GET /api/v1/trade/orders/history`
  - `GET /api/v1/trade/orders/{orderId}`
  - `POST /api/v1/trade/orders`
  - `POST /api/v1/trade/orders/{orderId}/cancel`
  - `POST /api/v1/trade/orders/{orderId}/amend`
  - `GET /api/v1/trade/search`
  - `GET /api/v1/trade/quote/{stockCode}`
  - `GET /api/v1/trade/quote/stream?stockCode=...`（SSE 实时推送报价与买卖盘）
  - `POST /api/v1/trade/quote/debug-push`（本地联调用：注入一条行情并触发撮合；支持 `forceMatch=true` 在非交易时段强制撮合回归；若时间戳落后于最新行情，返回 `accepted=false` 且不触发撮合）
  - `POST /api/v1/trade/orders/preview`
  - 同时保留兼容路径 `POST /api/orders/place`
  - 登录联调新增：`POST /api/v1/auth/send-code`（60s 重发间隔，5 分钟有效期）、`POST /api/v1/auth/verify-code`（校验 6 位验证码，返回 userId/token）
  - 登录联调新增：`GET /api/v1/auth/session`（可选 `X-User-Id`，返回 `loggedIn`、`profileCompleted`、`accountStatus` 与 `lang`）
  - 登录联调约束：`userId` 必须为全局唯一且对同一手机号稳定复用，禁止再使用“手机号后四位”之类会撞号的派生规则
  - 登录联调约束：`GET /api/v1/account/*`、`GET /api/v1/home/overview`、`GET /api/v1/leaderboard/star-traders`、`GET /api/v1/leaderboard/rankings`、`POST /api/v1/trade/orders*` 等用户态接口必须显式携带真实 `X-User-Id`，后端不再提供 `u_10001` 之类 demo 默认值
  - 登录联调新增：`POST /api/v1/auth/profile`（需 `X-User-Id`，提交昵称与头像）
  - 登录联调新增：`POST /api/v1/auth/avatar-upload`（需 `X-User-Id`，`multipart/form-data` 上传头像文件，支持 PNG/JPG/WEBP/GIF，限制 2MB）
  - 登录联调新增：`GET /api/v1/auth/avatar-files/{filename}`（读取后端本地上传头像）

## 8. 报错与稳定性要求

### 前端

- 任何失败都要有可见反馈，不允许静默失败。
- 交易相关操作必须区分用户输入错误、业务规则拦截、系统异常。
- 交易提交、撤单、查询记录等链路要提供重试或返回上一步的出口。
- 页面跳转中断场景要保留确认机制，例如注册离开确认、交易确认弹窗。

### 后端

- 所有可预期业务拦截都要返回清楚的人类可读信息，例如：
  - 超过 20 笔买单上限
  - 非手数倍数下单
  - 超出 ±20 ticks
  - 非交易时段提交市价单
  - 停牌股票禁止下单
- 不要吞异常；至少要在日志里保留 stockCode、userId、orderId 等关键上下文。
- 如果已经有全局异常处理，就不要在 Controller 里到处重复 try/catch，除非为了补充业务语义。

## 9. 测试与验证链路

目标：以后修 bug 或加功能时，尽量做到“先定位问题，再跑对应验证链路，改完后自动复验”。

### 前端默认验证

- 命令：
  - `cd frontend && npm run test`
  - `cd frontend && npm run lint`
  - `cd frontend && npm run build`
- 2026-04-01 实测结果：通过
- 作用：
  - `npm run test`：执行当前前端 adapter 单测（基于 `node:test`）
  - `npm run lint`：执行 ESLint CLI 非交互校验
  - `npm run build`：验证 Next.js 编译、路由构建与基础类型检查
- 演示部署补充：使用 Vercel 时必须配置 `NEXT_PUBLIC_API_BASE_URL=https://<your-https-tunnel-domain>` 与 `NEXT_PUBLIC_DEMO_USER_ID`

### 前端自动化测试现状

- 当前已存在测试文件：
  - `frontend/lib/adapters/guest-info.test.ts`
  - `frontend/lib/adapters/leaderboard-list.test.ts`
  - `frontend/lib/adapters/ranking.test.ts`
  - `frontend/lib/adapters/trade-route-pages.test.ts`
  - `frontend/lib/adapters/realtime-quote-copy.test.ts`
  - `frontend/lib/adapters/records-page-flow.test.ts`
  - `frontend/lib/adapters/trade-ticket-order-preset.test.ts`
  - `frontend/lib/adapters/trade-ticket-state.test.ts`
- 2026-04-01 当前结果：`npm run test` 可稳定执行，当前共 21 个测试通过
- 结论：前端已不再是“无自动化测试文件”的状态，但测试覆盖仍集中在 adapter 层，尚未扩展到页面交互或 E2E

### 后端默认验证

- 命令：`export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home && export PATH="$JAVA_HOME/bin:$PATH" && cd backend && mvn test`
- 代码内已存在测试：
  - `backend/src/test/java/com/simtrade/backend/service/AccountLedgerServiceTest.java`
  - `backend/src/test/java/com/simtrade/backend/service/UserProfileServiceTest.java`
  - `backend/src/test/java/com/simtrade/backend/service/FeeCalculatorTest.java`
  - `backend/src/test/java/com/simtrade/backend/service/OrderServiceImplV1Test.java`
  - `backend/src/test/java/com/simtrade/backend/service/MatchingServiceImplTest.java`
  - `backend/src/test/java/com/simtrade/backend/controller/V1ControllerTest.java`
- 注意：`V1ControllerTest`（`@WebMvcTest`）已对账务持久化相关 Mapper 使用 `@MockBean`，避免测试上下文误拉起 MyBatis `sqlSessionFactory` 依赖。
- 2026-04-01 当前环境结果：已实测通过（124 tests）
- 结论：`mvn test` 已可作为后端默认回归入口，但必须显式切到 JDK 17

### 后端本地启动

- 推荐命令：`cd backend && ./run-local.sh`
- 数据库初始化：`cd backend && ./init-local-db.sh`
- 说明文档：`backend/README.md`
- 演示部署入口：`docs/demo-deployment.md`
- 演示部署主路径：本地启动后端 `cd backend && ./run-local.sh`，再通过 HTTPS 穿透暴露 `http://127.0.0.1:8080`
- 演示部署前端变量：`NEXT_PUBLIC_API_BASE_URL=https://<your-https-tunnel-domain>`、`NEXT_PUBLIC_DEMO_USER_ID=u_10001`
- 演示部署备选：如需改成服务器同机部署，再执行 `chmod +x deploy/scripts/deploy-demo.sh deploy/scripts/smoke-test.sh && ./deploy/scripts/deploy-demo.sh`
- 当前本地跨域：后端已对 `/api/**` 开启 localhost/127.0.0.1 的开发态 CORS 放行，前端默认 `http://localhost:3000` 可直接联调 `http://localhost:8080`
- 当前跨域补充：CORS 配置已改为读取 `app.cors.allowed-origin-patterns`；若使用 HTTPS 穿透并需要浏览器直连后端，请确认允许对应 `https://<your-frontend-domain>` 或 Vercel 预览域
- 注意：当前 shell 如设置了 `http_proxy` / `https_proxy`，本地调接口时请使用 `curl --noproxy '*' ...`，避免本地回环请求被代理拦截成 502

### 交易联调回归脚本（新增）

- 脚本：`deploy/scripts/trade-regression-multilang.sh`
- 新增时间：2026-04-01
- 覆盖范围：`zh-Hant/zh-Hans/en` 三语的报价、预览、下单、活动订单、改单、撤单、历史与错误分支；并包含重复提交（无幂等键）与 `X-Idempotency-Key` 回放/冲突校验
- 运行命令：`API_BASE_URL=http://127.0.0.1:8080 USER_ID=u_smoke_0401 ./deploy/scripts/trade-regression-multilang.sh`
- 冒烟串联：`deploy/scripts/smoke-test.sh` 已支持 `RUN_TRADE_REGRESSION=1`，可在基础连通性检查后自动执行上述三语交易回归

### 改动后的执行原则

1. 只改前端页面或样式：
   - 至少跑 `cd frontend && npm run lint`
   - 至少跑 `cd frontend && npm run build`
2. 改前端交互或状态逻辑：
   - 跑 `cd frontend && npm run test`
   - 跑 `cd frontend && npm run lint`
   - 跑 `cd frontend && npm run build`
   - 手动检查相关页面链路是否可达
3. 改前端 adapter / API 映射层：
   - 跑 `cd frontend && npm run test`
   - 跑 `cd frontend && npm run lint`
   - 跑 `cd frontend && npm run build`
   - 同时核对字段映射、错误态与空态是否仍被页面正确接住
4. 改后端手续费、订单校验、撮合、结算：
   - 先补或更新 JUnit 用例
   - 再跑 `cd backend && mvn test`
5. 改前后端接口契约：
   - 同时核对字段名、枚举值、错误码、空态和错误态
6. 修 bug：
   - 能复现就先补失败用例，再修复，再复跑

## 10. 当前建议优先补强项

- 前端继续扩展自动化覆盖，从 adapter 层逐步补到关键页面交互与 smoke/E2E
- 后端补充 JDK 17 的固定使用方式（如启动脚本或环境说明），避免误用其他 Java 版本
- 逐步把 PRD 中的交易规则从文档落到单元测试和集成测试
- 逐步消除“PRD 接口约定”和“当前代码路径/字段”的偏差
- 如果前端开始对接真实接口，先建立 typed API client，不要让页面直接散写 fetch 逻辑
- 已新增文档：
  - `docs/进度巡检与排期-2026-03-30.md`
  - `docs/交易逻辑细化说明-2026-03-30.md`
  - `docs/跑通验证与未完成清单-2026-03-31.md`
  - `docs/今日进度与后续计划-2026-04-01.md`
  - `docs/主流程UI验收清单-2026-04-01.md`
  - `docs/主页专项对稿清单-2026-04-01.md`
  - `docs/交易链路专项对稿清单-2026-04-01.md`
  - `docs/全量主流程与UI总验收-2026-04-01.md`

## 11. 维护约定

- 新增重要业务规则、目录变更、脚本变更、测试命令变更时，必须同步更新本文件。
- 如果发现本文件与代码不一致，优先修正本文件或在改动说明中标出差异。
- 未来若补充更多专项文档，可继续在本文件里增加“开工前必读顺序”，避免每次重新摸索。
- 如果 `UI设计稿/` 新增、替换或调整了流程总图、页面截图、主题色规范或关键页面元素，必须同步更新 `前端流程及模块设计.md` 与本文件中的前端约束。
