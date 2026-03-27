## 2. RabbitMQ第三方对接指南

### 2.1 对接概述

第三方系统通过RabbitMQ与行情服务进行异步消息对接，支持订阅行情和接收实时推送。对接方式为基于AMQP协议的消息通信，消息格式采用Protocol Buffers序列化。

**对接步骤：**

1. 配置RabbitMQ连接信息（见2.2节）
2. 根据需要订阅的市场类型，绑定对应的行情队列（见2.3节）
3. 发送订阅请求到订阅交换机（见2.4节）
4. 接收并解析行情推送消息（见2.5节）

### 2.2 RabbitMQ配置

第三方系统需要配置RabbitMQ连接信息，支持SSL加密连接：

```yaml
spring:
  rabbitmq:
    addresses: rabbit-server0:5671,rabbit-server1:5671,rabbit-server2:5671
    username: xxxxx
    password: xxxxxx
    virtual-host: archforce_vhost
    ssl:
      enabled: true
      key-store: /usr/local/ssl/client_rabbit.p12
      key-store-password: archforce
      trust-store: /usr/local/ssl/rabbit.truststore
      trust-store-type: JKS
      algorithm: TLSv1.2
      verify-hostname: false
```

### 2.3 消息队列说明

行情服务提供以下消息队列，第三方系统可根据需要订阅：

| 队列名称                    | 用途     | 路由键                   | 支持市场 |
| :---------------------- | :----- | :-------------------- | :--- |
| subscribe.queue         | 订阅请求   | subscribe.key         | 全市场  |
| subscribe.resp.queue    | 订阅确认   | subscribe.resp.key    | 全市场  |
| quote.queue.hk.realTime | 港股实时行情 | quote.key.hk.realTime | 港股   |
| quote.queue.hk.delay    | 港股延时行情 | quote.key.hk.delay    | 港股   |
| quote.queue.hs.realTime | 沪深实时行情 | quote.key.hs.realTime | 沪深   |
| quote.queue.hs.delay    | 沪深延时行情 | quote.key.hs.delay    | 沪深   |
| quote.queue.us.realTime | 美股实时行情 | quote.key.us.realTime | 美股   |
| quote.queue.us.delay    | 美股延时行情 | quote.key.us.delay    | 美股   |

**说明：**

- 各市场均支持多实例队列（0,1,2），路由键对应添加后缀即可（如：quote.key.hk.realTime.0）
- 建议根据处理能力选择合适的队列实例

### 2.4 订阅消息格式

订阅消息使用Protocol Buffers序列化，主要字段：

| 字段         | 类型                  | 说明                               |
| :--------- | :------------------ | :------------------------------- |
| assetId    | repeated string     | 资产ID列表，如\["00700.HK", "AAPL.US"] |
| quoteLevel | MarketQuoteLevel    | 行情级别配置                           |
| type       | uint32              | 0-订阅，1-取消订阅                      |
| command    | repeated BizCommand | 功能号列表                            |

**MarketQuoteLevel结构：**

| 字段         | 类型         | 说明               |
| :--------- | :--------- | :--------------- |
| marketType | MarketType | 市场类型：HK/SH/SZ/US |
| quoteLevel | QuoteLevel | 行情级别：LV1/LV2     |

**示例代码：**

```java
// 构建订阅消息
Subscribe subscribe = Subscribe.newBuilder()
    .addAllAssetId(Arrays.asList("00700.HK", "AAPL.US"))
    .addQuoteLevel(MarketQuoteLevel.newBuilder()
        .setMarketType(MarketType.HK)
        .setQuoteLevel(QuoteLevel.LV2)
        .build())
    .setType(0)  // 0表示订阅
    .build();

// 发送到订阅队列
rabbitTemplate.convertAndSend("subscribe.exchange", "subscribe.key", subscribe.toByteArray());
```

### 2.5 行情推送消息格式

行情推送消息根据行情级别分为：

#### 基础行情 (RespPushBasicQuote)

| 字段          | 类型     | 说明    |
| :---------- | :----- | :---- |
| timestamp   | uint64 | 行情时间戳 |
| assetId     | string | 资产ID  |
| price       | float  | 最新价格  |
| changeRatio | float  | 涨跌幅   |
| volume      | uint64 | 成交量   |
| prevClose   | float  | 昨收价   |
| turnover    | double | 成交额   |
| phase       | Phase  | 交易阶段  |

#### 详细行情 (RespPushDetailQuote)

包含基础行情所有字段，额外包含：

- 买卖盘信息（orderBook）
- 振幅、换手率、市盈率等指标
- 证券详细信息（交易所、板块、币种等）

#### 逐笔成交 (RespPushTradeTicker)

| 字段      | 类型                   | 说明     |
| :------ | :------------------- | :----- |
| assetId | string               | 资产ID   |
| tickers | repeated TradeTicker | 逐笔成交数据 |
| phase   | Phase                | 交易阶段   |

**消息处理示例：**

```java
@Component
public class QuoteConsumer {
    
    @RabbitListener(queues = "quote.queue.hk.realTime")
    public void handleQuotePush(Message message) {
        try {
            // 解析基础行情
            RespPushBasicQuote data = RespPushBasicQuote.parseFrom(message.getBody());
            log.info("收到行情: {} - 价格: {}, 涨跌幅: {}%", 
                data.getAssetId(), data.getPrice(), data.getChangeRatio() * 100);
        } catch (Exception e) {
            log.error("消息处理失败", e);
        }
    }
}
```

// 订阅

message Subscribe {
repeated BizCommand command = 1; // 订阅的功能号
repeated string assetId = 2; // 订阅的资产
repeated MarketQuoteLevel quoteLevel = 3; // 行情权限集合
map\<string, string> extra = 4; // 扩展属性 1. 当订阅K线的时候, extra需要填写 klineType ，adjustType 2. 订阅时没有资产ID时， extra需要marketType 3. 订阅分时的实时， 指定分时类型 timesharingType （ONE\_DAY, FIVE\_DAY）
Header header = 5;
optional uint32 type = 6; // 订阅类型 0：订阅 1：取消订阅
optional string channelId = 7; // 会话Id
}

// 订阅ACK

message SubscribeAck {
string code = 1; // 0 - 订阅成功
optional string msg = 2; // 订阅返回消息
repeated BizCommand command = 3; // 订阅的功能号
}

// 推送发布消息

message BasePub {
BizCommand command = 1; // 订阅的功能号
optional bytes contents = 2; // 消息内容
MarketType marketType = 3; // 市场 例如清盘动作
string code = 4; // 200 - 发送成功
}

// 推送基础行情
message RespPushBasicQuote {
uint64 timestamp = 1; // 行情时间戳
string assetId = 2; // 资产的ID
optional SecurityStatus securityStatus = 3; // 状态
optional float open = 4; // 开盘价
optional float high = 5; // 最高价
optional float low = 6; // 最低价
optional float price = 7; // 最新价格 （美股收盘会同步EOD价格到到这里）
optional float prevClose = 8; // 昨收价
optional double turnover = 9; // 成交额
optional uint64 volume = 10; // 成交量
optional float change = 11; // 涨跌额
optional float changeRatio = 12; // 涨跌幅
optional Phase phase = 13; // 交易阶段
optional uint32 precision = 15; // 精度
optional string assetName = 16; //股票简称
optional SecurityType securityType = 17; // 证券类型
optional SubSecurityType subSecurityType = 18; //证券子类型
optional float amplitude = 19; // 振幅
optional float turnRate = 20; // 换手率
optional float peTTM = 21; // 动态市盈率
optional double totalMktVal = 22; // 总市值
optional float volumeRatio = 23; // 量比
optional float bidAskRatio = 24; // 委比
optional BasicQuote phaseQuote = 25; // 盘前或者盘后行情信息 针对美股， 只返回 高、开、低、最新价、成交额、成交量、涨跌额、涨跌幅
}
// 推送详细行情
message RespPushDetailQuote {
uint64 timestamp = 1; // 行情时间戳
string assetId = 2; // 资产的ID
optional SecurityStatus securityStatus = 3; // 状态
optional float open = 4; // 开盘价
optional float high = 5; // 最高价
optional float low = 6; // 最低价
optional float price = 7; // 最新价格 （美股收盘会同步EOD价格到到这里）
optional float prevClose = 8; // 昨收价
optional double turnover = 9; // 成交额
optional uint64 volume = 10; // 成交量
optional float change = 11; // 涨跌额
optional float changeRatio = 12; // 涨跌幅
optional Phase phase = 13; // 交易阶段
optional float turnRate = 14; // 换手率
optional float volumeRatio = 15; // 量比
optional float bidAskRatio = 16; // 委比
optional float amplitude = 17; // 振幅
optional double totalMktVal = 18; // 总市值
optional double floatMktVal = 19; // 流通市值
optional float pe = 20; //静态市盈率
optional float peTTM = 21; // 动态市盈率
optional float deductionPeTTM = 22; // 扣非PE TTM
optional float pb = 23; // 市净率
optional float avgPrice = 24; // 均价
optional float highPrice52 = 25; // 52周最高
optional float lowPrice52 = 26; // 52周最低

optional float hisHighPrice = 27; // 历史最低
optional float hisLowPrice = 28; // 历史最低
optional float dividendYldTTM = 29; // 股息率TTM
optional float dividendYldLFY = 30; // 股息率LFY
optional uint64 inner = 31; // 内盘 A股特有
optional uint64 outer = 32; // 外盘 A股特有
optional float lotAmount = 33; // 每手金额
// 指数特有
optional uint32 upNum = 34; // 涨家数
optional uint32 downNum = 35; // 跌家数
optional uint32 evenNum = 36; // 平家数
// 权证特有
optional float impliedVolatility = 37; // 引申波幅
optional float delta = 38; // 对冲值
optional float breakEven = 39; // 打和点
optional float effectiveGearing = 40; // 有效杠杆
optional float inOutPrice = 41; // 价内/价外
optional float premium = 42; // 溢价率
optional float toCallPrice = 43; // 距回收价
optional float leverageRatio = 44; // 杠杆比率
// ETF特有
optional float leverageTimes = 45; // 杠杆倍数
// 板块
optional DetailQuote leaderStock = 46; //领涨股
// 资产信息
optional string assetName = 47; //股票简称
optional string fullAssetName = 48; //股票全称

optional float bidAskDiff = 50; // 委差
optional float eps = 51; // 每股收益
optional uint32 precision = 52; // 精度
optional DetailQuote phaseQuote = 53; // 盘前或者盘后行情信息 针对美股， 只返回 高、开、低、最新价、成交额、成交量、涨跌额、涨跌幅
optional string betRatio = 54; // 抵押率
optional SecurityType securityType = 55; // 证券类型
optional float conversionRatio = 56; // 换股比率
optional float exchangePrice = 57; // 换股价

optional Exchange exchange = 58; // 交易所
optional BoardCode boardCode = 59; // 所属交易所板块
optional SubSecurityType subSecurityType = 61; //证券子类型
optional Currency currency = 62; // 币种
optional uint32 lotSize = 63; //每手股数
optional bool marginFlag = 64; // 是否支持融资
optional bool shortSellFlag = 65; // 是否支持卖空
optional double totalCapital = 66; // 总股本
optional double issueCapital = 67; //流通股本
optional bool szHkFlag = 68; // 深港通
optional bool shHkFlag = 69; // 沪港通
optional bool redChipsFlag = 70; // 红筹股
optional bool blueChipsFlag = 71; // 蓝筹股
optional string hsAssetId = 72; // A股 资产ID
optional string hkAssetId = 73; // H股 资产ID
optional string usAssetId = 74; // 美股 资产ID
optional uint64 listingDate = 75; // 上市日期时间戳
optional uint64 delistingDate = 76; // 退市日期时间戳
optional float limitUp = 77; // 涨停价（A股有效）
optional float limitDown = 78; // 跌停价（A股有效）
optional float issuePrice = 79; //最终发行价
optional float dividendTTM = 80; // 股息TTM
optional float dividendLFY = 81; // 股息LFY
optional SecurityPhase securityPhase = 82; // 证券所处阶段

optional string targetAssetId = 83; // 正股资产ID（权证时有效）
optional string targetAssetName = 84; // 正股资产名称（权证时有效）
optional float strikePrice = 85; // 行使价
optional float callPrice = 86; // 回收价
optional uint64 callDate = 87; // 回收日
optional uint64 lastTradeDate = 89; // 最后交易日
optional uint64 maturityDate = 90; // 到期日
optional double outstandingQty = 91; // 街货量
optional float outstandingRatio = 92; // 街货比

optional float unitNv = 93; // 单位净值
optional float totalNv = 94; // 累计净值
optional string issuer = 95; // 发行人
optional string manager = 96; // 管理人

repeated BlockComponent blockComponent = 97; // 成分股 （指数/板块有效）
repeated string industryAssetId = 98; // 所属行业
repeated string conceptAssetId = 99; // 所属概念
optional OrderBook orderBook = 100; // 买卖盘
optional BrokerQueue brokerQueue = 101; // 经纪队列
}

// 推送逐笔/分笔成交
message RespPushTradeTicker {
string assetId = 1; // 资产ID
repeated TradeTicker tickers = 2; // 逐笔成交
Phase phase = 3; // 交易阶段
uint32 pageNo = 4; //分页页码
uint32 pageSize = 5; // 分页条数
uint64 totalCount = 6; // 总条数
}

// 推送的消息数据 后端使用
message PushMsgInfo {
string assetId = 1; // 资产id
QuoteLevel quoteLevel = 2; // 行情级别
BizCommand command = 3; // 订阅的功能号
bytes contents = 4; // 消息内容
}
