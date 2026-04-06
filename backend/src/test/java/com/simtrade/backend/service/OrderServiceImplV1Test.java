package com.simtrade.backend.service;

import com.simtrade.backend.dto.TradeOrderCreateRequest;
import com.simtrade.backend.dto.TradeOrderAmendRequest;
import com.simtrade.backend.dto.TradeOrderPreviewResult;
import com.simtrade.backend.dto.TradeOrderSubmitResult;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.service.impl.OrderServiceImpl;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

class OrderServiceImplV1Test {

    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");

    private OrderServiceImpl orderService;
    private MockDataService mockDataService;
    private Map<String, Order> persistedOrders;

    @BeforeEach
    void setUp() {
        mockDataService = Mockito.mock(MockDataService.class);
        orderService = Mockito.spy(new OrderServiceImpl());
        persistedOrders = new LinkedHashMap<String, Order>();
        ReflectionTestUtils.setField(orderService, "mockDataService", mockDataService);
        ReflectionTestUtils.setField(orderService, "feeCalculator", new FeeCalculator());
        ReflectionTestUtils.setField(orderService, "tradingClock", Clock.fixed(
                ZonedDateTime.of(2026, 3, 27, 10, 15, 0, 0, HK_ZONE).toInstant(),
                HK_ZONE
        ));
        ReflectionTestUtils.setField(orderService, "tradingCalendarService", new TradingCalendarService());
        Mockito.when(mockDataService.isSupportedStock(Mockito.anyString())).thenReturn(true);
        Mockito.when(mockDataService.isSuspended(Mockito.anyString())).thenReturn(false);
        Mockito.doReturn(0L).when(orderService).count(Mockito.any());
        Mockito.doAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            persistedOrders.put(order.getId(), copyOrder(order));
            return true;
        }).when(orderService).save(Mockito.any(Order.class));
        Mockito.doAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order == null || order.getId() == null) {
                return false;
            }
            persistedOrders.put(order.getId(), copyOrder(order));
            return true;
        }).when(orderService).updateById(Mockito.any(Order.class));
        Mockito.doAnswer(invocation -> {
            String orderId = invocation.getArgument(0);
            Order order = persistedOrders.get(orderId);
            return order == null ? null : copyOrder(order);
        }).when(orderService).getById(Mockito.anyString());
        Mockito.doAnswer(invocation -> {
            List<Order> items = new ArrayList<Order>();
            for (Order order : persistedOrders.values()) {
                items.add(copyOrder(order));
            }
            return items;
        }).when(orderService).list(Mockito.any());
    }

    private Order copyOrder(Order source) {
        if (source == null) {
            return null;
        }
        Order target = new Order();
        target.setId(source.getId());
        target.setUserId(source.getUserId());
        target.setStockCode(source.getStockCode());
        target.setType(source.getType());
        target.setPrice(source.getPrice());
        target.setOrderType(source.getOrderType());
        target.setQuantity(source.getQuantity());
        target.setFilledQuantity(source.getFilledQuantity());
        target.setFilledAvgPrice(source.getFilledAvgPrice());
        target.setStatus(source.getStatus());
        target.setCreateTime(source.getCreateTime());
        target.setUpdateTime(source.getUpdateTime());
        return target;
    }

    private void stubSaveToPersistenceMap() {
        Mockito.doAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            persistedOrders.put(order.getId(), copyOrder(order));
            return true;
        }).when(orderService).save(Mockito.any(Order.class));
    }

    private void stubUpdateToPersistenceMap() {
        Mockito.doAnswer(invocation -> {
            Order order = invocation.getArgument(0);
            if (order == null || order.getId() == null) {
                return false;
            }
            persistedOrders.put(order.getId(), copyOrder(order));
            return true;
        }).when(orderService).updateById(Mockito.any(Order.class));
    }

    @Test
    void placeOrderV1_shouldMapBuyDirectionAndSavePendingOrder() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(0L).when(orderService).count(Mockito.any());
        stubSaveToPersistenceMap();

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        TradeOrderSubmitResult result = orderService.placeOrderV1("u_10001", request);

        Assertions.assertNotNull(result.getOrderId());
        Assertions.assertEquals("FILLED", result.getStatus());
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        Mockito.verify(orderService).save(orderCaptor.capture());
        Assertions.assertEquals(1, orderCaptor.getValue().getType());
        Assertions.assertEquals(2, orderCaptor.getValue().getStatus());
        Assertions.assertEquals(100, orderCaptor.getValue().getFilledQuantity());
        Assertions.assertEquals(new BigDecimal("300.00"), orderCaptor.getValue().getFilledAvgPrice());
        Assertions.assertEquals("u_10001", orderCaptor.getValue().getUserId());
    }

    @Test
    void placeOrderV1_shouldKeepPendingWhenLimitPriceNotCrossed() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(0L).when(orderService).count(Mockito.any());
        stubSaveToPersistenceMap();

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("299.80"));
        request.setQuantity(100);

        TradeOrderSubmitResult result = orderService.placeOrderV1("u_10001", request);

        Assertions.assertEquals("PENDING", result.getStatus());
        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        Mockito.verify(orderService, Mockito.atLeastOnce()).save(orderCaptor.capture());
        Order saved = orderCaptor.getValue();
        Assertions.assertEquals(0, saved.getStatus());
        Assertions.assertEquals(0, saved.getFilledQuantity());
    }

    @Test
    void placeOrderV1_shouldRejectNonLotMultiple() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(90);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("lot size"));
    }

    @Test
    void placeOrderV1_shouldRejectTwentyFirstBuyOrder() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(20L).when(orderService).count(Mockito.any());

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("20 buy orders"));
    }

    @Test
    void placeOrderV1_shouldRejectSellWhenNoHoldings() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(new ArrayList<Order>()).when(orderService).list(Mockito.any());

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("SELL");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("Insufficient holdings"));
    }

    @Test
    void cancelOrder_shouldUpdatePendingOrderToCanceled() {
        Order pending = new Order();
        pending.setId("ord_1");
        pending.setUserId("u_10001");
        pending.setStatus(0);

        Mockito.doReturn(pending).when(orderService).getById("ord_1");
        stubUpdateToPersistenceMap();

        Order canceled = orderService.cancelOrder("u_10001", "ord_1");

        Assertions.assertEquals(3, canceled.getStatus());
        Mockito.verify(orderService).updateById(Mockito.any(Order.class));
    }

    @Test
    void cancelOrder_shouldRejectFilledOrder() {
        Order filled = new Order();
        filled.setId("ord_2");
        filled.setUserId("u_10001");
        filled.setStatus(2);

        Mockito.doReturn(filled).when(orderService).getById("ord_2");

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.cancelOrder("u_10001", "ord_2")
        );
        Assertions.assertTrue(exception.getMessage().contains("not cancelable"));
    }

    @Test
    void listActiveOrders_allShouldIncludeFilled() {
        Order pending = new Order();
        pending.setId("ord_pending");
        pending.setUserId("u_10001");
        pending.setStatus(0);
        pending.setCreateTime(LocalDateTime.of(2026, 3, 27, 9, 35));

        Order partial = new Order();
        partial.setId("ord_partial");
        partial.setUserId("u_10001");
        partial.setStatus(1);
        partial.setCreateTime(LocalDateTime.of(2026, 3, 27, 9, 36));

        Order filled = new Order();
        filled.setId("ord_filled");
        filled.setUserId("u_10001");
        filled.setStatus(2);
        filled.setCreateTime(LocalDateTime.of(2026, 3, 27, 9, 37));

        Order canceled = new Order();
        canceled.setId("ord_canceled");
        canceled.setUserId("u_10001");
        canceled.setStatus(3);
        canceled.setCreateTime(LocalDateTime.of(2026, 3, 27, 9, 38));

        persistedOrders.put(pending.getId(), pending);
        persistedOrders.put(partial.getId(), partial);
        persistedOrders.put(filled.getId(), filled);
        persistedOrders.put(canceled.getId(), canceled);

        List<Order> result = orderService.listActiveOrders("u_10001", "ALL");
        java.util.Set<Integer> statuses = result.stream()
                .map(Order::getStatus)
                .collect(java.util.stream.Collectors.toSet());

        Assertions.assertEquals(new java.util.HashSet<>(java.util.Arrays.asList(0, 1, 2)), statuses);
        Assertions.assertEquals(3, statuses.size());
        Assertions.assertFalse(statuses.contains(3));
    }

    @Test
    void amendOrderV1_shouldCancelOriginalAndCreateNewOrder() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        Order pendingLimit = new Order();
        pendingLimit.setId("ord_amend_1");
        pendingLimit.setUserId("u_10001");
        pendingLimit.setStockCode("00700");
        pendingLimit.setType(1);
        pendingLimit.setPrice(new BigDecimal("300.00"));
        pendingLimit.setQuantity(100);
        pendingLimit.setFilledQuantity(0);
        pendingLimit.setFilledAvgPrice(BigDecimal.ZERO);
        pendingLimit.setStatus(0);
        pendingLimit.setCreateTime(LocalDateTime.now());
        pendingLimit.setUpdateTime(LocalDateTime.now());

        Mockito.doReturn(pendingLimit).when(orderService).getById("ord_amend_1");
        stubUpdateToPersistenceMap();
        stubSaveToPersistenceMap();

        TradeOrderAmendRequest request = new TradeOrderAmendRequest();
        request.setPrice(new BigDecimal("301.20"));
        request.setQuantity(200);

        Order amended = orderService.amendOrderV1("u_10001", "ord_amend_1", request);

        Assertions.assertNotEquals("ord_amend_1", amended.getId());
        Assertions.assertEquals(new BigDecimal("301.20"), amended.getPrice());
        Assertions.assertEquals(200, amended.getQuantity());
        Assertions.assertEquals(0, amended.getStatus());
        ArgumentCaptor<Order> updateCaptor = ArgumentCaptor.forClass(Order.class);
        Mockito.verify(orderService).updateById(updateCaptor.capture());
        Assertions.assertEquals(3, updateCaptor.getValue().getStatus());
    }

    @Test
    void amendOrderV1_shouldAllowAmendWhenFivePendingIncludesCurrentOrder() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        List<Order> pendingOrders = buildPendingOrders(5);
        Order currentOrder = pendingOrders.get(0);
        currentOrder.setId("ord_amend_2");

        Mockito.doReturn(currentOrder).when(orderService).getById("ord_amend_2");
        Mockito.doReturn(pendingOrders).when(orderService).list(Mockito.any());
        stubUpdateToPersistenceMap();
        stubSaveToPersistenceMap();

        TradeOrderAmendRequest request = new TradeOrderAmendRequest();
        request.setPrice(new BigDecimal("300.20"));
        request.setQuantity(100);

        Order amended = orderService.amendOrderV1("u_10001", "ord_amend_2", request);
        Assertions.assertNotEquals("ord_amend_2", amended.getId());
        Assertions.assertEquals(new BigDecimal("300.20"), amended.getPrice());
    }

    @Test
    void amendOrderV1_shouldRejectNonLotMultiple() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        Order pendingLimit = new Order();
        pendingLimit.setId("ord_amend_3");
        pendingLimit.setUserId("u_10001");
        pendingLimit.setStockCode("00700");
        pendingLimit.setType(1);
        pendingLimit.setPrice(new BigDecimal("300.00"));
        pendingLimit.setQuantity(100);
        pendingLimit.setFilledQuantity(0);
        pendingLimit.setFilledAvgPrice(BigDecimal.ZERO);
        pendingLimit.setStatus(0);
        pendingLimit.setCreateTime(LocalDateTime.now());
        pendingLimit.setUpdateTime(LocalDateTime.now());

        Mockito.doReturn(pendingLimit).when(orderService).getById("ord_amend_3");

        TradeOrderAmendRequest request = new TradeOrderAmendRequest();
        request.setPrice(new BigDecimal("301.20"));
        request.setQuantity(90);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.amendOrderV1("u_10001", "ord_amend_3", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("lot size"));
    }

    @Test
    void previewOrderV1_shouldReturnCostSummaryForBuyLimit() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(0L).when(orderService).count(Mockito.any());

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        TradeOrderPreviewResult result = orderService.previewOrderV1("u_10001", request);

        Assertions.assertEquals("00700", result.getStockCode());
        Assertions.assertEquals("BUY", result.getDirection());
        Assertions.assertEquals("LIMIT", result.getOrderType());
        Assertions.assertEquals(new BigDecimal("30000.00"), result.getEstimatedAmount());
        Assertions.assertTrue(result.getEstimatedFee().compareTo(BigDecimal.ZERO) > 0);
        Assertions.assertEquals(result.getEstimatedAmount().add(result.getEstimatedFee()), result.getEstimatedTotalCost());
    }

    @Test
    void previewOrderV1_shouldRejectPriceOutOfTwentyTicks() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("304.20"));
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.previewOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("±20 ticks"));
    }

    @Test
    void placeOrderV1_shouldRejectSixthPendingLimitOrder() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(buildPendingOrders(5)).when(orderService).list(Mockito.any());

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("5 pending LIMIT orders"));
    }

    @Test
    void previewOrderV1_shouldRejectSixthPendingLimitOrder() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(buildPendingOrders(5)).when(orderService).list(Mockito.any());

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.previewOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("5 pending LIMIT orders"));
    }

    @Test
    void placeOrderV1_shouldRejectMarketOrderOutsideTradingHours() {
        ReflectionTestUtils.setField(orderService, "tradingClock", fixedClock(2026, 3, 27, 12, 30));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("MARKET");
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("Market orders are only accepted during trading hours"));
    }

    @Test
    void previewOrderV1_shouldRejectMarketOrderOutsideTradingHours() {
        ReflectionTestUtils.setField(orderService, "tradingClock", fixedClock(2026, 3, 27, 12, 30));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("MARKET");
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.previewOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("Market orders are only accepted during trading hours"));
    }

    @Test
    void previewOrderV1_shouldReturnNextTradingDayValidityForOffSessionLimitOrder() {
        ReflectionTestUtils.setField(orderService, "tradingClock", fixedClock(2026, 3, 27, 16, 30));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        TradeOrderPreviewResult preview = orderService.previewOrderV1("u_10001", request);

        Assertions.assertEquals("NEXT_TRADING_DAY_CLOSE", preview.getValidityType());
        Assertions.assertTrue(preview.getValidityNote().contains("next trading day close"));
        Assertions.assertTrue(preview.getValidUntil().contains("+08:00"));
    }

    @Test
    void placeOrderV1_shouldReturnNextTradingDayValidityForOffSessionLimitOrder() {
        ReflectionTestUtils.setField(orderService, "tradingClock", fixedClock(2026, 3, 27, 16, 30));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        TradeOrderSubmitResult submitResult = orderService.placeOrderV1("u_10001", request);

        Assertions.assertNotNull(submitResult.getOrderId());
        Assertions.assertEquals("NEXT_TRADING_DAY_CLOSE", submitResult.getValidityType());
        Assertions.assertTrue(submitResult.getValidityNote().contains("next trading day close"));
        Assertions.assertTrue(submitResult.getValidUntil().contains("+08:00"));
    }

    @Test
    void applyMatchExecution_shouldUpdateOrderAndExposeFilledStateFromDetail() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();
        stubUpdateToPersistenceMap();

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("299.80"));
        request.setQuantity(100);

        TradeOrderSubmitResult submitResult = orderService.placeOrderV1("u_10001", request);
        Order matched = orderService.applyMatchExecution(submitResult.getOrderId(), new BigDecimal("299.70"), 100);
        Order detail = orderService.getOrderDetail("u_10001", submitResult.getOrderId());

        Assertions.assertEquals(2, matched.getStatus());
        Assertions.assertEquals(100, matched.getFilledQuantity());
        Assertions.assertEquals(0, matched.getFilledAvgPrice().compareTo(new BigDecimal("299.70")));
        Assertions.assertEquals(2, detail.getStatus());
        Assertions.assertEquals(0, detail.getFilledAvgPrice().compareTo(new BigDecimal("299.70")));
    }

    @Test
    void closeExpiredLimitOrders_shouldCancelSameDayPendingLimitOrderAfterClose() {
        ReflectionTestUtils.setField(orderService, "tradingClock", fixedClock(2026, 3, 27, 10, 15));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();
        stubUpdateToPersistenceMap();

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("299.80"));
        request.setQuantity(100);

        TradeOrderSubmitResult submitResult = orderService.placeOrderV1("u_10001", request);
        int canceled = orderService.closeExpiredLimitOrders(LocalDateTime.of(2026, 3, 27, 16, 10));
        Order detail = orderService.getOrderDetail("u_10001", submitResult.getOrderId());

        Assertions.assertEquals(1, canceled);
        Assertions.assertEquals(3, detail.getStatus());
    }

    @Test
    void closeExpiredLimitOrders_shouldKeepOffSessionLimitOrderUntilNextTradingDayClose() {
        ReflectionTestUtils.setField(orderService, "tradingClock", fixedClock(2026, 3, 27, 16, 30));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();
        stubUpdateToPersistenceMap();

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("299.80"));
        request.setQuantity(100);

        TradeOrderSubmitResult submitResult = orderService.placeOrderV1("u_10001", request);

        int canceledBeforeDue = orderService.closeExpiredLimitOrders(LocalDateTime.of(2026, 3, 30, 15, 59));
        Order stillPending = orderService.getOrderDetail("u_10001", submitResult.getOrderId());
        int canceledAtDue = orderService.closeExpiredLimitOrders(LocalDateTime.of(2026, 3, 30, 16, 1));
        Order canceledOrder = orderService.getOrderDetail("u_10001", submitResult.getOrderId());

        Assertions.assertEquals(0, canceledBeforeDue);
        Assertions.assertEquals(0, stillPending.getStatus());
        Assertions.assertEquals(1, canceledAtDue);
        Assertions.assertEquals(3, canceledOrder.getStatus());
    }

    @Test
    @SuppressWarnings("unchecked")
    void placeOrderV1_shouldUseRedisDedupWhenRedisAvailable() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOps = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(valueOps);
        Mockito.when(valueOps.setIfAbsent(
                Mockito.contains("trade:dedup:submit:"),
                Mockito.eq("1"),
                Mockito.eq(1500L),
                Mockito.eq(TimeUnit.MILLISECONDS)
        )).thenReturn(true);
        ReflectionTestUtils.setField(orderService, "stringRedisTemplate", redisTemplate);

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        orderService.placeOrderV1("u_10001", request);
        Mockito.verify(valueOps).setIfAbsent(
                Mockito.contains("trade:dedup:submit:"),
                Mockito.eq("1"),
                Mockito.eq(1500L),
                Mockito.eq(TimeUnit.MILLISECONDS)
        );
    }

    @Test
    void placeOrderV1_shouldThrowWhenRedisDedupUnavailableInStrictMode() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        ReflectionTestUtils.setField(orderService, "redisStrictMode", true);

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalStateException exception = Assertions.assertThrows(
                IllegalStateException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("Redis dedup"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void placeOrderV1_shouldThrowWhenLoadIdempotencyFailsInStrictMode() {
        ReflectionTestUtils.setField(orderService, "redisStrictMode", true);
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOps = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(valueOps);
        Mockito.when(valueOps.get(Mockito.contains("trade:idempotency:submit:")))
                .thenThrow(new RuntimeException("redis down"));
        ReflectionTestUtils.setField(orderService, "stringRedisTemplate", redisTemplate);

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalStateException exception = Assertions.assertThrows(
                IllegalStateException.class,
                () -> orderService.placeOrderV1("u_10001", request, "idem-strict-load")
        );
        Assertions.assertTrue(exception.getMessage().contains("Load idempotency record"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void placeOrderV1_shouldThrowWhenStoreIdempotencyFailsInStrictMode() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();
        ReflectionTestUtils.setField(orderService, "redisStrictMode", true);

        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOps = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(valueOps);
        Mockito.when(valueOps.get(Mockito.contains("trade:idempotency:submit:"))).thenReturn(null);
        Mockito.when(valueOps.setIfAbsent(
                Mockito.contains("trade:dedup:submit:"),
                Mockito.eq("1"),
                Mockito.eq(1500L),
                Mockito.eq(TimeUnit.MILLISECONDS)
        )).thenReturn(true);
        Mockito.doThrow(new RuntimeException("redis write down")).when(valueOps).set(
                Mockito.contains("trade:idempotency:submit:"),
                Mockito.anyString(),
                Mockito.eq(24 * 60 * 60L),
                Mockito.eq(TimeUnit.SECONDS)
        );
        ReflectionTestUtils.setField(orderService, "stringRedisTemplate", redisTemplate);

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalStateException exception = Assertions.assertThrows(
                IllegalStateException.class,
                () -> orderService.placeOrderV1("u_10001", request, "idem-strict-store")
        );
        Assertions.assertTrue(exception.getMessage().contains("Persist idempotency record"));
    }

    @Test
    void placeOrderV1_shouldReturnSameOrderForSameIdempotencyKeyRetry() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        TradeOrderSubmitResult first = orderService.placeOrderV1("u_10001", request, "idem-key-1");
        TradeOrderSubmitResult second = orderService.placeOrderV1("u_10001", request, "idem-key-1");

        Assertions.assertNotNull(first.getOrderId());
        Assertions.assertEquals(first.getOrderId(), second.getOrderId());
        Assertions.assertEquals(first.getStatus(), second.getStatus());
        Assertions.assertEquals(1, persistedOrders.size());
        Mockito.verify(orderService, Mockito.times(1)).save(Mockito.any(Order.class));
    }

    @Test
    void placeOrderV1_shouldRejectIdempotencyKeyReuseWithDifferentPayload() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        stubSaveToPersistenceMap();

        TradeOrderCreateRequest first = new TradeOrderCreateRequest();
        first.setStockCode("00700");
        first.setDirection("BUY");
        first.setOrderType("LIMIT");
        first.setPrice(new BigDecimal("300.00"));
        first.setQuantity(100);
        orderService.placeOrderV1("u_10001", first, "idem-key-2");

        TradeOrderCreateRequest second = new TradeOrderCreateRequest();
        second.setStockCode("00700");
        second.setDirection("BUY");
        second.setOrderType("LIMIT");
        second.setPrice(new BigDecimal("300.00"));
        second.setQuantity(200);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", second, "idem-key-2")
        );
        Assertions.assertTrue(exception.getMessage().contains("Idempotency key"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void placeOrderV1_shouldRejectDuplicateWhenRedisDedupReturnsFalse() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        StringRedisTemplate redisTemplate = Mockito.mock(StringRedisTemplate.class);
        ValueOperations<String, String> valueOps = Mockito.mock(ValueOperations.class);
        Mockito.when(redisTemplate.opsForValue()).thenReturn(valueOps);
        Mockito.when(valueOps.setIfAbsent(
                Mockito.contains("trade:dedup:submit:"),
                Mockito.eq("1"),
                Mockito.eq(1500L),
                Mockito.eq(TimeUnit.MILLISECONDS)
        )).thenReturn(false);
        ReflectionTestUtils.setField(orderService, "stringRedisTemplate", redisTemplate);

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("Duplicate order submission"));
    }

    @Test
    void applyMatchExecution_shouldUseHolidayAwareSettlementDate() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        stubUpdateToPersistenceMap();
        Order pending = new Order();
        pending.setId("ord_settle_holiday");
        pending.setUserId("u_10001");
        pending.setStockCode("00700");
        pending.setType(1);
        pending.setPrice(new BigDecimal("300.00"));
        pending.setQuantity(100);
        pending.setFilledQuantity(0);
        pending.setFilledAvgPrice(BigDecimal.ZERO);
        pending.setStatus(0);
        pending.setCreateTime(LocalDateTime.of(2026, 3, 27, 10, 0));
        pending.setUpdateTime(LocalDateTime.of(2026, 3, 27, 10, 0));
        Mockito.doReturn(pending).when(orderService).getById("ord_settle_holiday");

        AccountLedgerService ledgerService = Mockito.mock(AccountLedgerService.class);
        ReflectionTestUtils.setField(orderService, "accountLedgerService", ledgerService);

        TradingCalendarService calendarService = new TradingCalendarService();
        calendarService.replaceHolidays(Arrays.asList(LocalDate.of(2026, 3, 30)));
        ReflectionTestUtils.setField(orderService, "tradingCalendarService", calendarService);

        Order matched = orderService.applyMatchExecution("ord_settle_holiday", new BigDecimal("299.90"), 100);

        Assertions.assertEquals(2, matched.getStatus());
        ArgumentCaptor<LocalDate> settlementCaptor = ArgumentCaptor.forClass(LocalDate.class);
        Mockito.verify(ledgerService).onOrderMatched(
                Mockito.any(Order.class),
                Mockito.anyString(),
                Mockito.eq(100),
                Mockito.eq(new BigDecimal("299.90")),
                Mockito.any(BigDecimal.class),
                Mockito.any(LocalDateTime.class),
                settlementCaptor.capture()
        );
        Assertions.assertEquals(LocalDate.of(2026, 4, 1), settlementCaptor.getValue());
    }

    @Test
    void placeOrderV1_shouldRejectSuspendedStock() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.when(mockDataService.isSuspended("00700")).thenReturn(true);

        TradeOrderCreateRequest request = new TradeOrderCreateRequest();
        request.setStockCode("00700");
        request.setDirection("BUY");
        request.setOrderType("LIMIT");
        request.setPrice(new BigDecimal("300.00"));
        request.setQuantity(100);

        IllegalArgumentException exception = Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> orderService.placeOrderV1("u_10001", request)
        );
        Assertions.assertTrue(exception.getMessage().contains("suspended"));
    }

    private Clock fixedClock(int year, int month, int day, int hour, int minute) {
        LocalDateTime localDateTime = LocalDateTime.of(year, month, day, hour, minute);
        Instant instant = localDateTime.atZone(HK_ZONE).toInstant();
        return Clock.fixed(instant, HK_ZONE);
    }

    private List<Order> buildPendingOrders(int count) {
        List<Order> orders = new ArrayList<Order>();
        for (int i = 0; i < count; i++) {
            Order order = new Order();
            order.setId("ord_pending_" + i);
            order.setUserId("u_10001");
            order.setStockCode("00700");
            order.setType(1);
            order.setPrice(new BigDecimal("300.00"));
            order.setQuantity(100);
            order.setFilledQuantity(0);
            order.setFilledAvgPrice(BigDecimal.ZERO);
            order.setStatus(0);
            order.setCreateTime(LocalDateTime.now());
            order.setUpdateTime(LocalDateTime.now());
            orders.add(order);
        }
        return orders;
    }
}
