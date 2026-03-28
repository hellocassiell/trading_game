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
- 如果 `UI设计稿/` 中仍残留美股文案、美股代码或美元单位，这些只可视为旧版占位内容；落地时必须统一替换为港股语境、港币单位与港股交易规则。

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
- 当前状态：以前端高保真原型为主，主要使用 `frontend/lib/mock-data.ts` 提供展示数据
- 当前补充：已建立初步前端数据收口层，读取与提交逻辑优先放在 `frontend/lib/adapters/` 与 `frontend/lib/api/`，页面层不要再直接散写接口请求
- 已有页面：登录、主页、个人、记录、更多、交易链路、排行榜、市场榜单等
- 当前事实：暂无前端自动化测试文件；交易提交已可通过前端 adapter 对接现有后端下单接口，其余展示页仍以 adapter 映射 mock 数据为主

### 后端

- 目录：`backend/`
- 技术栈：Spring Boot 2.7、Java 17、MyBatis-Plus、MySQL、Redis、RabbitMQ
- 当前状态：已有订单提交、撮合、手续费计算、统一返回结构、全局异常处理、手续费单元测试
- 当前事实：实现是可运行雏形，不是完整生产版
- 当前差异：
  - PRD 内部 API 倾向 `/api/v1/...`
  - 当前代码已同时存在旧接口 `/api/orders/place` 与第一批 `/api/v1/...` 只读/交易接口
  - 当前后端有部分 mock / 简化逻辑，例如撮合后 T+2 直接 `plusDays(2)`，并非完整营业日日历
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
- 视觉主题必须统一为橙色及橙色衍生色。即使设计稿的旧版画面存在蓝色主色，也只可复用其结构与布局，不可直接照搬蓝色作为最终主主题。
- 主色替换范围包括但不限于：主按钮、激活态 Tab、重点数值、图表高亮、角标、图标强调、分段控件、浮动交易按钮、榜单强调元素。
- 所有美股逻辑必须改成港股逻辑，包括但不限于：股票示例、列表标题、币种、报价单位、行情说明、持仓标题、榜单名称、搜索提示、交易说明、跳转文案。
- 前端文案和展示口径统一使用港股语境，例如：`港股持仓`、`今日10大成交港股`、`参赛者20大港股持仓`、`00700 腾讯控股`、`0388 香港交易所`、`2800 盈富基金`、`HK$ / 港币`。
- 港股交易界面必须显式体现港股特征：每手股数、按手交易、港币报价、港股代码/简称、交易时段、T+2 结算、涨跌颜色和文案都按港股比赛规则呈现。
- 页面组织优先使用 App Router 路由，通用 UI 抽到 `frontend/components/`。
- 展示型页面的数据优先集中在 `frontend/lib/mock-data.ts` 或未来的 typed adapter 中，避免页面里复制同一份硬编码数据。
- 页面读取数据时优先经由 `frontend/lib/adapters/` 返回页面所需 view model；对接真实接口时优先经由 `frontend/lib/api/` 发起请求，不要在页面或纯展示组件里直接写 fetch。
- 新增交互时必须补齐 4 种状态：loading、empty、error、success。
- 表单和交易输入要做显式校验，错误提示文案要可读，不要只靠浏览器原生报错。
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
  - `GET /api/v1/account/positions`
  - `GET /api/v1/home/overview`
  - `GET /api/v1/trade/orders/active`
  - `GET /api/v1/trade/orders/history`
  - `GET /api/v1/trade/orders/{orderId}`
  - `POST /api/v1/trade/orders`
  - `POST /api/v1/trade/orders/{orderId}/cancel`
  - `GET /api/v1/trade/search`
  - `GET /api/v1/trade/quote/{stockCode}`
  - `POST /api/v1/trade/orders/preview`
  - 同时保留兼容路径 `POST /api/orders/place`

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

- 命令：`cd frontend && npm run build`
- 2026-03-28 实测结果：通过
- 作用：可同时验证 Next.js 编译、路由构建、基础类型检查

### 前端 lint 现状

- 命令：`cd frontend && npm run lint`
- 2026-03-28 实测结果：未形成可自动执行链路
- 原因：当前脚本仍是 `next lint`，仓库尚未初始化 ESLint，会进入交互式配置流程
- 结论：在补齐 ESLint 配置前，不要把 `npm run lint` 当作稳定自动化校验门禁

### 后端默认验证

- 命令：`export JAVA_HOME=/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home && export PATH="$JAVA_HOME/bin:$PATH" && cd backend && mvn test`
- 代码内已存在测试：
  - `backend/src/test/java/com/simtrade/backend/service/FeeCalculatorTest.java`
  - `backend/src/test/java/com/simtrade/backend/service/OrderServiceImplV1Test.java`
  - `backend/src/test/java/com/simtrade/backend/controller/V1ControllerTest.java`
- 2026-03-28 当前环境结果：已实测通过
- 结论：`mvn test` 已可作为后端默认回归入口，但必须显式切到 JDK 17

### 后端本地启动

- 推荐命令：`cd backend && ./run-local.sh`
- 数据库初始化：`cd backend && ./init-local-db.sh`
- 说明文档：`backend/README.md`
- 注意：当前 shell 如设置了 `http_proxy` / `https_proxy`，本地调接口时请使用 `curl --noproxy '*' ...`，避免本地回环请求被代理拦截成 502

### 改动后的执行原则

1. 只改前端页面或样式：
   - 至少跑 `cd frontend && npm run build`
2. 改前端交互或状态逻辑：
   - 跑 `cd frontend && npm run build`
   - 手动检查相关页面链路是否可达
3. 改前端 adapter / API 映射层：
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

- 前端补齐 ESLint，让 `npm run lint` 变成非交互、可自动执行的命令
- 后端补充 JDK 17 的固定使用方式（如启动脚本或环境说明），避免误用其他 Java 版本
- 逐步把 PRD 中的交易规则从文档落到单元测试和集成测试
- 逐步消除“PRD 接口约定”和“当前代码路径/字段”的偏差
- 如果前端开始对接真实接口，先建立 typed API client，不要让页面直接散写 fetch 逻辑

## 11. 维护约定

- 新增重要业务规则、目录变更、脚本变更、测试命令变更时，必须同步更新本文件。
- 如果发现本文件与代码不一致，优先修正本文件或在改动说明中标出差异。
- 未来若补充更多专项文档，可继续在本文件里增加“开工前必读顺序”，避免每次重新摸索。
- 如果 `UI设计稿/` 新增、替换或调整了流程总图、页面截图、主题色规范或关键页面元素，必须同步更新 `前端流程及模块设计.md` 与本文件中的前端约束。
