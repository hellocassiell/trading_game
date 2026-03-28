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
SQL

echo "Local database bootstrap completed."
