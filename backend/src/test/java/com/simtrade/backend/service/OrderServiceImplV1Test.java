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
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

class OrderServiceImplV1Test {

    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");

    private OrderServiceImpl orderService;
    private MockDataService mockDataService;

    @BeforeEach
    void setUp() {
        mockDataService = Mockito.mock(MockDataService.class);
        orderService = Mockito.spy(new OrderServiceImpl());
        ReflectionTestUtils.setField(orderService, "mockDataService", mockDataService);
        ReflectionTestUtils.setField(orderService, "feeCalculator", new FeeCalculator());
        ReflectionTestUtils.setField(orderService, "tradingClock", Clock.fixed(
                ZonedDateTime.of(2026, 3, 27, 10, 15, 0, 0, HK_ZONE).toInstant(),
                HK_ZONE
        ));
        Mockito.when(mockDataService.isSupportedStock(Mockito.anyString())).thenReturn(true);
        Mockito.when(mockDataService.isSuspended(Mockito.anyString())).thenReturn(false);
        Mockito.doReturn(0L).when(orderService).count(Mockito.any());
        Mockito.doReturn(new ArrayList<Order>()).when(orderService).list(Mockito.any());
    }

    @Test
    void placeOrderV1_shouldMapBuyDirectionAndSavePendingOrder() {
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getTickSize(new BigDecimal("300.00"))).thenReturn(new BigDecimal("0.20"));
        Mockito.doReturn(0L).when(orderService).count(Mockito.any());
        Mockito.doReturn(true).when(orderService).save(Mockito.any(Order.class));

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
        Mockito.doReturn(true).when(orderService).save(Mockito.any(Order.class));

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
    void cancelOrder_shouldUpdatePendingOrderToCanceled() {
        Order pending = new Order();
        pending.setId("ord_1");
        pending.setUserId("u_10001");
        pending.setStatus(0);

        Mockito.doReturn(pending).when(orderService).getById("ord_1");
        Mockito.doReturn(true).when(orderService).updateById(Mockito.any(Order.class));

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
    void amendOrderV1_shouldUpdateQueuedLimitOrder() {
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
        Mockito.doReturn(true).when(orderService).updateById(Mockito.any(Order.class));

        TradeOrderAmendRequest request = new TradeOrderAmendRequest();
        request.setPrice(new BigDecimal("301.20"));
        request.setQuantity(200);

        Order amended = orderService.amendOrderV1("u_10001", "ord_amend_1", request);

        Assertions.assertEquals(new BigDecimal("301.20"), amended.getPrice());
        Assertions.assertEquals(200, amended.getQuantity());
        Assertions.assertEquals(0, amended.getStatus());
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
        Mockito.doReturn(true).when(orderService).updateById(Mockito.any(Order.class));

        TradeOrderAmendRequest request = new TradeOrderAmendRequest();
        request.setPrice(new BigDecimal("300.20"));
        request.setQuantity(100);

        Order amended = orderService.amendOrderV1("u_10001", "ord_amend_2", request);
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
        Mockito.doReturn(true).when(orderService).save(Mockito.any(Order.class));

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
