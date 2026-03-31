#!/usr/bin/env bash

set -euo pipefail

MYSQL_BIN="${MYSQL_BIN:-mysql}"
MYSQL_USER="${MYSQL_USER:-root}"
MYSQL_PASSWORD="${MYSQL_PASSWORD:-password}"

"$MYSQL_BIN" -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" <<'SQL'
CREATE DATABASE IF NOT EXISTS simtrade CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE simtrade;

CREATE TABLE IF NOT EXISTS t_order (
  id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  stock_code VARCHAR(16) NOT NULL,
  type INT NOT NULL,
  price DECIMAL(18,3) NOT NULL,
  order_type VARCHAR(16) NOT NULL DEFAULT 'LIMIT',
  quantity INT NOT NULL,
  filled_quantity INT DEFAULT 0,
  filled_avg_price DECIMAL(18,4) DEFAULT 0.0000,
  status INT NOT NULL,
  create_time DATETIME NOT NULL,
  update_time DATETIME NOT NULL,
  deleted TINYINT NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_order_user_create_time (user_id, create_time),
  KEY idx_order_stock_status_create_time (stock_code, status, create_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_user_profile (
  user_id VARCHAR(64) NOT NULL,
  phone VARCHAR(32) DEFAULT NULL,
  nickname VARCHAR(64) DEFAULT NULL,
  avatar_id VARCHAR(128) DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (user_id),
  KEY idx_user_profile_phone (phone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @order_type_exists := (
  SELECT COUNT(*)
  FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'simtrade'
    AND TABLE_NAME = 't_order'
    AND COLUMN_NAME = 'order_type'
);
SET @order_type_sql := IF(
  @order_type_exists = 0,
  'ALTER TABLE t_order ADD COLUMN order_type VARCHAR(16) NOT NULL DEFAULT ''LIMIT'' AFTER price',
  'SELECT 1'
);
PREPARE order_type_stmt FROM @order_type_sql;
EXECUTE order_type_stmt;
DEALLOCATE PREPARE order_type_stmt;

CREATE TABLE IF NOT EXISTS t_account_balance (
  user_id VARCHAR(64) NOT NULL,
  available_cash DECIMAL(18,2) NOT NULL DEFAULT 1000000.00,
  frozen_cash DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  transit_cash DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_account_position (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id VARCHAR(64) NOT NULL,
  stock_code VARCHAR(16) NOT NULL,
  tradable_quantity INT NOT NULL DEFAULT 0,
  frozen_quantity INT NOT NULL DEFAULT 0,
  transit_quantity INT NOT NULL DEFAULT 0,
  total_cost DECIMAL(18,4) NOT NULL DEFAULT 0.0000,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_account_position_user_stock (user_id, stock_code),
  KEY idx_account_position_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_order_reservation (
  order_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  stock_code VARCHAR(16) NOT NULL,
  type INT NOT NULL,
  remaining_quantity INT NOT NULL DEFAULT 0,
  remaining_reserved_cash DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (order_id),
  KEY idx_order_reservation_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_order_settlement (
  order_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  stock_code VARCHAR(16) NOT NULL,
  settlement_date DATE DEFAULT NULL,
  settlement_status VARCHAR(16) NOT NULL DEFAULT 'PENDING',
  matched_quantity INT NOT NULL DEFAULT 0,
  matched_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  total_fee DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  net_cash_flow DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  last_matched_at DATETIME DEFAULT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (order_id),
  KEY idx_order_settlement_user (user_id),
  KEY idx_order_settlement_date (settlement_date, settlement_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_settlement_entry (
  id BIGINT NOT NULL AUTO_INCREMENT,
  order_id VARCHAR(64) DEFAULT NULL,
  user_id VARCHAR(64) NOT NULL,
  stock_code VARCHAR(16) NOT NULL,
  type INT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  cash_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  settlement_date DATE NOT NULL,
  settled TINYINT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  PRIMARY KEY (id),
  KEY idx_settlement_entry_due (settlement_date, settled),
  KEY idx_settlement_entry_order (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

echo "Local database bootstrap completed."
