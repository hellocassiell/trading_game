# DBeaver 连接配置指南

## 快速连接到 SimTrade 数据库

### 方法 1: 手动创建连接

1. 打开 DBeaver（在应用程序中找到 DBeaver）
2. 点击左上角的 "新建数据库连接" 图标（插头形状）
3. 选择 "MySQL"
4. 填写连接信息：
   - **主机**: localhost
   - **端口**: 3306
   - **数据库**: simtrade
   - **用户名**: root
   - **密码**: password

5. 点击 "测试连接" 验证
6. 点击 "完成"

### 方法 2: 导入连接配置

如果 DBeaver 支持导入，可以使用以下配置：

```json
{
  "name": "SimTrade Local",
  "driver": "mysql",
  "host": "localhost",
  "port": 3306,
  "database": "simtrade",
  "user": "root",
  "password": "password"
}
```

## 数据库结构

### 主要数据表

1. **t_user_profile** - 用户信息表
   - user_id: 用户ID
   - phone: 手机号
   - nickname: 昵称
   - avatar_id: 头像ID

2. **t_account_balance** - 账户余额表
   - cash_available: 可用现金
   - cash_frozen: 冻结资金
   - securities_market_value: 证券市值
   - total_assets: 总资产

3. **t_account_position** - 持仓表
   - stock_code: 股票代码
   - quantity: 持仓数量
   - tradable_quantity: 可交易数量
   - average_price: 成本价
   - current_price: 现价

4. **t_order** - 订单表
   - order_id: 订单ID
   - stock_code: 股票代码
   - direction: 方向（BUY/SELL）
   - quantity: 数量
   - price: 价格
   - status: 状态

5. **t_settlement_entry** - 结算记录表

6. **t_order_settlement** - 订单结算关联表

7. **t_order_reservation** - 订单预留表

## 常用查询

### 查看所有用户
```sql
SELECT * FROM t_user_profile ORDER BY created_at DESC;
```

### 查看用户资产
```sql
SELECT
    up.nickname,
    ab.cash_available,
    ab.securities_market_value,
    ab.total_assets
FROM t_user_profile up
JOIN t_account_balance ab ON up.user_id = ab.user_id;
```

### 查看持仓情况
```sql
SELECT
    up.nickname,
    ap.stock_code,
    ap.quantity,
    ap.average_price,
    ap.current_price,
    ap.reference_market_value
FROM t_user_profile up
JOIN t_account_position ap ON up.user_id = ap.user_id;
```

### 查看订单历史
```sql
SELECT
    up.nickname,
    o.stock_code,
    o.direction,
    o.quantity,
    o.price,
    o.status,
    o.created_at
FROM t_user_profile up
JOIN t_order o ON up.user_id = o.user_id
ORDER BY o.created_at DESC
LIMIT 20;
```

## 快捷命令行工具

项目已提供命令行工具快速查看数据：

```bash
# 查看概览
./scripts/view-db.sh

# 查看用户
./scripts/view-db.sh users

# 查看订单
./scripts/view-db.sh orders

# 查看持仓
./scripts/view-db.sh positions

# 查看余额
./scripts/view-db.sh balance
```
