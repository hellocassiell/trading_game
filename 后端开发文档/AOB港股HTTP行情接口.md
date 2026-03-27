## 1. 行情数据查询接口

### 1.1 接口说明

通过HTTP请求方式查询股票行情数据，支持批量查询多只股票的实时行情信息。

### 1.2 请求参数

#### 1.2.1 请求参数列表

| 参数名               | 必选 | 类型     | 说明         |
| :---------------- | :- | :----- | :--------- |
| assetId           | 是  | Array  | 资产ID列表     |
| phase             | 是  | String | 市场状态（默认即可） |
| marketQuoteLevels | 是  | Object | 用户市场权限配置   |
| quoteFieldName    | 否  | Array  | 需要返回的字段名   |

#### 1.2.2 请求头参数

| 参数名           | 必选 | 类型     | 说明      | 备注                                           |
| :------------ | :- | :----- | :------ | :------------------------------------------- |
| Content-Type  | 否  | String | 报文编码及类型 | GET接口不需要，其他一般为：application/json;charset=utf8 |
| x-language    | 是  | String | 当前语言    | zh\_CN 简体中文；zh\_HK 繁体中文；en\_US 英文，默认zh\_HK   |
| x-app-id      | 是  | String | APPID   | APP标识，默认选1即可                                 |
| x-app-version | 是  | String | APP 版本号 | 当前APP的版本号                                    |
| x-request-id  | 是  | String | 请求随机数   | 前端生成(定长随机数)                                  |

接口地址:${AOB\_HOST}/aob/quotation/security/batchDetail

- REG:10.100.206.67:28000
- UAT:10.100.206.65:18000
- PRD:10.100.87.75:18000

### 1.3 请求示例

```json
{
    "assetId": ["00700.HK","GOOG.US","002534.SZ","300792.SZ"],
    "phase": "OPEN",
    "marketQuoteLevels": {
        "HK": "LV2_STREAM",
        "SH": "LV1_STREAM",
        "SZ": "LV1_STREAM",
        "US": "NASDAQ_BASIC"
    },
    "quoteFieldName":["ASSET_ID","CHG_PCT","PRICE","ASSET_NAME","PREV_CLOSE"]
}
```

### 1.4 响应参数

| 参数名     | 类型      | 说明     |
| :------ | :------ | :----- |
| code    | String  | 状态码    |
| data    | Array   | 行情数据列表 |
| msg     | String  | 响应消息   |
| success | Boolean | 是否成功   |

### 1.5 响应示例

```json
{
    "code": "200",
    "data": [
        {
            "price": 193.2,
            "changeRatio": 0.0088,
            "prevClose": 191.51,
            "assetId": "GOOG.US",
            "assetName": "谷歌-C"
        },
        {
            "price": 547.0,
            "changeRatio": -0.018,
            "prevClose": 557.0,
            "assetId": "00700.HK",
            "assetName": "騰訊控股"
        },
        {
            "price": 12.79,
            "changeRatio": -0.0318,
            "prevClose": 13.21,
            "assetId": "002534.SZ",
            "assetName": "西子潔能"
        },
        {
            "price": 25.05,
            "changeRatio": -0.002,
            "prevClose": 25.1,
            "assetId": "300792.SZ",
            "assetName": "壹網壹創"
        }
    ],
    "msg": "操作成功",
    "success": true
}
```

