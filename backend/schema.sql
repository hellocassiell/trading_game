-- --------------------------------------------------------
-- 港股模拟交易系统 数据库建表脚本 (MySQL)
-- --------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `simtrade` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `simtrade`;

-- 1. 用户资金账户表
CREATE TABLE `account` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) NOT NULL COMMENT '用户ID',
  `total_asset` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '总资产',
  `available_balance` decimal(20,2) NOT NULL DEFAULT '1000000.00' COMMENT '可用资金 (默认 1,000,000 HKD)',
  `frozen_balance` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '冻结资金 (委托挂单中预估占用)',
  `transit_balance` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '在途资金 (T+2 待交收)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户资金账户表';

-- 2. 用户持仓表
CREATE TABLE `position` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `account_id` bigint(20) NOT NULL COMMENT '资金账户ID',
  `stock_code` varchar(32) NOT NULL COMMENT '股票代码 (如 00700.HK)',
  `average_price` decimal(20,3) NOT NULL DEFAULT '0.000' COMMENT '持仓均价',
  `quantity` int(11) NOT NULL DEFAULT '0' COMMENT '可用持仓数量',
  `frozen_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '冻结持仓数量 (卖出挂单中)',
  `transit_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '在途持仓数量 (T+2 买入待交收)',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_account_stock` (`account_id`, `stock_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户持仓表';

-- 3. 股票白名单池
CREATE TABLE `stock_whitelist` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `stock_code` varchar(32) NOT NULL COMMENT '股票代码',
  `stock_name` varchar(128) NOT NULL COMMENT '股票名称',
  `lot_size` int(11) NOT NULL COMMENT '每手股数 (交易单位)',
  `status` tinyint(4) NOT NULL DEFAULT '1' COMMENT '状态: 1-正常 0-停牌 -1-退市',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_stock_code` (`stock_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='股票白名单池';

-- 初始化测试股票数据
INSERT INTO `stock_whitelist` (`stock_code`, `stock_name`, `lot_size`) VALUES 
('00700.HK', '腾讯控股', 100),
('09988.HK', '阿里巴巴-SW', 100),
('03690.HK', '美团-W', 100);

-- 4. 委托订单表
CREATE TABLE `trade_order` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_no` varchar(64) NOT NULL COMMENT '订单流水号',
  `account_id` bigint(20) NOT NULL COMMENT '资金账户ID',
  `stock_code` varchar(32) NOT NULL COMMENT '股票代码',
  `direction` varchar(16) NOT NULL COMMENT '交易方向: BUY-买入, SELL-卖出',
  `order_type` varchar(16) NOT NULL COMMENT '订单类型: LIMIT-限价单, MARKET-市价单',
  `price` decimal(20,3) DEFAULT NULL COMMENT '委托价格 (市价单可空)',
  `quantity` int(11) NOT NULL COMMENT '委托数量',
  `status` varchar(32) NOT NULL COMMENT '状态: PENDING-排队中, PARTIAL_FILLED-部分成交, FILLED-全部成交, CANCELED-已撤销, FAILED-失败',
  `frozen_amount` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '买入冻结资金 (包含手续费)',
  `frozen_quantity` int(11) NOT NULL DEFAULT '0' COMMENT '卖出冻结股数',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间 (委托时间)',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_account_time` (`account_id`, `create_time`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='委托订单表';

-- 5. 成交与交割记录表
CREATE TABLE `trade_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `order_id` bigint(20) NOT NULL COMMENT '订单ID',
  `account_id` bigint(20) NOT NULL COMMENT '资金账户ID',
  `stock_code` varchar(32) NOT NULL COMMENT '股票代码',
  `direction` varchar(16) NOT NULL COMMENT '交易方向: BUY-买入, SELL-卖出',
  `deal_price` decimal(20,3) NOT NULL COMMENT '成交价格 (按盘价)',
  `deal_quantity` int(11) NOT NULL COMMENT '成交数量',
  `deal_amount` decimal(20,2) NOT NULL COMMENT '成交金额',
  `commission` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '模拟经纪佣金 (0.25%, min 100)',
  `handling_fee` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '模拟交易处理费 (买入专有 2.5/手, 30-200)',
  `stamp_duty` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '模拟印花税 (0.1%, min 1)',
  `trading_fee` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '模拟交易费 (0.005%)',
  `trading_tariff` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '模拟交易征费 (0.003%)',
  `total_fee` decimal(20,2) NOT NULL DEFAULT '0.00' COMMENT '总费用合计',
  `settle_status` varchar(32) NOT NULL DEFAULT 'PENDING' COMMENT '交收状态: PENDING-待交收, SETTLED-已交收',
  `settle_date` date NOT NULL COMMENT 'T+2 交收日期',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '成交时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_account_settle` (`account_id`, `settle_status`, `settle_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='成交与交割记录表';
