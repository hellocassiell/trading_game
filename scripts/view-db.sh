#!/bin/bash

# MySQL 可视化查询脚本
# 使用方法: ./scripts/view-db.sh [表名]

DB_NAME="simtrade"
DB_USER="root"
DB_PASS="password"

echo "======================================"
echo "  SimTrade 数据库可视化工具"
echo "======================================"
echo ""

if [ "$1" = "" ]; then
    echo "📊 数据库概览："
    echo ""
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT
            '用户数' as 指标,
            COUNT(*) as 数量
        FROM t_user_profile
        UNION ALL
        SELECT
            '订单数',
            COUNT(*)
        FROM t_order
        UNION ALL
        SELECT
            '持仓记录数',
            COUNT(*)
        FROM t_account_position
        UNION ALL
        SELECT
            '结算记录数',
            COUNT(*)
        FROM t_settlement_entry;
    " 2>/dev/null

    echo ""
    echo "📋 数据表列表："
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "SHOW TABLES;" 2>/dev/null

    echo ""
    echo "💡 使用方法："
    echo "  ./scripts/view-db.sh users      # 查看用户数据"
    echo "  ./scripts/view-db.sh orders     # 查看订单数据"
    echo "  ./scripts/view-db.sh positions  # 查看持仓数据"
    echo "  ./scripts/view-db.sh balance    # 查看余额数据"
    echo ""

elif [ "$1" = "users" ]; then
    echo "👥 用户数据："
    echo ""
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT
            user_id as 用户ID,
            phone as 手机号,
            nickname as 昵称,
            avatar_id as 头像,
            created_at as 创建时间
        FROM t_user_profile
        ORDER BY created_at DESC
        LIMIT 20;
    " 2>/dev/null

elif [ "$1" = "orders" ]; then
    echo "📝 订单数据："
    echo ""
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT
            order_id as 订单ID,
            user_id as 用户ID,
            stock_code as 股票代码,
            direction as 方向,
            quantity as 数量,
            price as 价格,
            status as 状态,
            created_at as 创建时间
        FROM t_order
        ORDER BY created_at DESC
        LIMIT 20;
    " 2>/dev/null

elif [ "$1" = "positions" ]; then
    echo "💼 持仓数据："
    echo ""
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT
            user_id as 用户ID,
            stock_code as 股票代码,
            quantity as 持仓数量,
            tradable_quantity as 可交易数量,
            average_price as 成本价,
            current_price as 现价,
            reference_market_value as 市值
        FROM t_account_position
        LIMIT 20;
    " 2>/dev/null

elif [ "$1" = "balance" ]; then
    echo "💰 账户余额："
    echo ""
    mysql -u $DB_USER -p$DB_PASS $DB_NAME -e "
        SELECT
            user_id as 用户ID,
            cash_available as 可用现金,
            cash_frozen as 冻结资金,
            securities_market_value as 证券市值,
            total_assets as 总资产,
            updated_at as 更新时间
        FROM t_account_balance
        LIMIT 20;
    " 2>/dev/null

else
    echo "❌ 未知的表名: $1"
    echo "💡 支持的选项: users, orders, positions, balance"
fi

echo ""
