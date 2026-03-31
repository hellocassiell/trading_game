package com.simtrade.backend.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.simtrade.backend.dto.OrderRequest;
import com.simtrade.backend.dto.TradeOrderAmendRequest;
import com.simtrade.backend.dto.TradeOrderCreateRequest;
import com.simtrade.backend.dto.TradeOrderPreviewResult;
import com.simtrade.backend.dto.TradeOrderSubmitResult;
import com.simtrade.backend.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface OrderService extends IService<Order> {
    String placeOrder(OrderRequest request);

    TradeOrderSubmitResult placeOrderV1(String userId, TradeOrderCreateRequest request);

    default TradeOrderSubmitResult placeOrderV1(String userId, TradeOrderCreateRequest request, String idempotencyKey) {
        return placeOrderV1(userId, request);
    }

    TradeOrderPreviewResult previewOrderV1(String userId, TradeOrderCreateRequest request);

    long countTodayBuyOrders(String userId);

    List<Order> listActiveOrders(String userId, String status);

    List<Order> listHistoryOrders(String userId, LocalDate dateFrom, LocalDate dateTo);

    Order getOrderDetail(String userId, String orderId);

    Order cancelOrder(String userId, String orderId);

    Order amendOrderV1(String userId, String orderId, TradeOrderAmendRequest request);

    String getOrderType(String orderId);

    List<Order> listOpenOrdersByStock(String stockCode);

    Order applyMatchExecution(String orderId, BigDecimal executionPrice, int matchedQuantity);

    int closeExpiredLimitOrders(LocalDateTime triggerTime);
}
