package com.simtrade.backend.service;

import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.service.impl.MatchingServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.mockito.InOrder;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;

class MatchingServiceImplTest {

    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");

    private MatchingServiceImpl matchingService;
    private OrderService orderService;

    @BeforeEach
    void setUp() {
        orderService = Mockito.mock(OrderService.class);

        matchingService = new MatchingServiceImpl();
        ReflectionTestUtils.setField(matchingService, "orderService", orderService);
        ReflectionTestUtils.setField(matchingService, "feeCalculator", new FeeCalculator());
        ReflectionTestUtils.setField(matchingService, "tradingCalendarService", new TradingCalendarService());
        ReflectionTestUtils.setField(matchingService, "tradingClock", fixedClock(2026, 3, 27, 10, 0));
    }

    @Test
    void matchOrders_shouldFillCrossedBuyLimitAtNominalPrice() {
        Order pendingBuy = buildOrder("ord_buy_1", 1, new BigDecimal("300.00"), 100, 0, 0, 45);
        Order filledBuy = buildOrder("ord_buy_1", 1, new BigDecimal("300.00"), 100, 100, 2, 45);
        Mockito.when(orderService.listOpenOrdersByStock("00700"))
                .thenReturn(Collections.singletonList(pendingBuy));
        Mockito.when(orderService.applyMatchExecution("ord_buy_1", new BigDecimal("299.80"), 100))
                .thenReturn(filledBuy);

        MarketData marketData = new MarketData();
        marketData.setStockCode("00700");
        marketData.setNominalPrice(new BigDecimal("299.80"));

        matchingService.matchOrders(marketData);

        Mockito.verify(orderService).applyMatchExecution("ord_buy_1", new BigDecimal("299.80"), 100);
    }

    @Test
    void matchOrders_shouldNotFillSellLimitWhenNominalPriceNotCrossed() {
        Order pendingSell = buildOrder("ord_sell_1", 2, new BigDecimal("300.20"), 100, 0, 0, 45);
        Mockito.when(orderService.listOpenOrdersByStock("00700"))
                .thenReturn(Collections.singletonList(pendingSell));

        MarketData marketData = new MarketData();
        marketData.setStockCode("00700");
        marketData.setNominalPrice(new BigDecimal("300.00"));

        matchingService.matchOrders(marketData);

        Mockito.verify(orderService, Mockito.never()).applyMatchExecution(Mockito.anyString(), Mockito.any(), Mockito.anyInt());
    }

    @Test
    void matchOrders_shouldUseMidPriceWhenOrderBookLiquidityUnavailable() {
        Order pendingBuy = buildOrder("ord_buy_2", 1, new BigDecimal("300.10"), 100, 0, 0, 45);
        Order filledBuy = buildOrder("ord_buy_2", 1, new BigDecimal("300.10"), 100, 100, 2, 45);
        Mockito.when(orderService.listOpenOrdersByStock("00700"))
                .thenReturn(Collections.singletonList(pendingBuy));
        Mockito.when(orderService.applyMatchExecution("ord_buy_2", new BigDecimal("300.0000"), 100))
                .thenReturn(filledBuy);

        MarketData.Level ask = new MarketData.Level();
        ask.setPrice(new BigDecimal("300.20"));
        ask.setVolume(0);
        MarketData.Level bid = new MarketData.Level();
        bid.setPrice(new BigDecimal("299.80"));
        bid.setVolume(0);

        MarketData marketData = new MarketData();
        marketData.setStockCode("00700");
        marketData.setAsks(Collections.singletonList(ask));
        marketData.setBids(Collections.singletonList(bid));

        matchingService.matchOrders(marketData);

        Mockito.verify(orderService).applyMatchExecution("ord_buy_2", new BigDecimal("300.0000"), 100);
    }

    @Test
    void matchOrders_shouldRespectPriceTimePriorityAgainstOrderBookLevels() {
        Order fastPrice = buildOrder("ord_fast", 1, new BigDecimal("301.00"), 100, 0, 0, 31);
        Order oldSamePrice = buildOrder("ord_old", 1, new BigDecimal("300.00"), 100, 0, 0, 30);
        Order newSamePrice = buildOrder("ord_new", 1, new BigDecimal("300.00"), 100, 0, 0, 32);
        Mockito.when(orderService.listOpenOrdersByStock("00700"))
                .thenReturn(Arrays.asList(newSamePrice, oldSamePrice, fastPrice));
        Mockito.when(orderService.applyMatchExecution("ord_fast", new BigDecimal("299.90"), 100))
                .thenReturn(buildOrder("ord_fast", 1, new BigDecimal("301.00"), 100, 100, 2, 31));
        Mockito.when(orderService.applyMatchExecution("ord_old", new BigDecimal("300.00"), 50))
                .thenReturn(buildOrder("ord_old", 1, new BigDecimal("300.00"), 100, 50, 1, 30));

        MarketData.Level ask1 = new MarketData.Level();
        ask1.setPrice(new BigDecimal("299.90"));
        ask1.setVolume(100);
        MarketData.Level ask2 = new MarketData.Level();
        ask2.setPrice(new BigDecimal("300.00"));
        ask2.setVolume(50);

        MarketData marketData = new MarketData();
        marketData.setStockCode("00700");
        marketData.setAsks(Arrays.asList(ask2, ask1));

        matchingService.matchOrders(marketData);

        InOrder inOrder = Mockito.inOrder(orderService);
        inOrder.verify(orderService).applyMatchExecution("ord_fast", new BigDecimal("299.90"), 100);
        inOrder.verify(orderService).applyMatchExecution("ord_old", new BigDecimal("300.00"), 50);
        Mockito.verify(orderService, Mockito.never()).applyMatchExecution(Mockito.eq("ord_new"), Mockito.any(), Mockito.anyInt());
    }

    @Test
    void matchOrders_shouldSkipMatchingOutsideTradingSessionButStillDoCloseCleanup() {
        ReflectionTestUtils.setField(matchingService, "tradingClock", fixedClock(2026, 3, 27, 16, 30));
        Mockito.when(orderService.listOpenOrdersByStock("00700"))
                .thenReturn(Arrays.asList(buildOrder("ord_1", 1, new BigDecimal("300.00"), 100, 0, 0, 45)));

        MarketData marketData = new MarketData();
        marketData.setStockCode("00700");
        marketData.setNominalPrice(new BigDecimal("299.80"));

        matchingService.matchOrders(marketData);

        Mockito.verify(orderService).closeExpiredLimitOrders(LocalDateTime.of(2026, 3, 27, 16, 30));
        Mockito.verify(orderService, Mockito.never()).applyMatchExecution(Mockito.anyString(), Mockito.any(), Mockito.anyInt());
    }

    @Test
    void matchOrders_forceMode_shouldMatchOutsideTradingSession() {
        ReflectionTestUtils.setField(matchingService, "tradingClock", fixedClock(2026, 3, 27, 16, 30));
        Order pendingBuy = buildOrder("ord_force_1", 1, new BigDecimal("300.00"), 100, 0, 0, 45);
        Order filledBuy = buildOrder("ord_force_1", 1, new BigDecimal("300.00"), 100, 100, 2, 45);
        Mockito.when(orderService.listOpenOrdersByStock("00700"))
                .thenReturn(Collections.singletonList(pendingBuy));
        Mockito.when(orderService.applyMatchExecution("ord_force_1", new BigDecimal("299.80"), 100))
                .thenReturn(filledBuy);

        MarketData marketData = new MarketData();
        marketData.setStockCode("00700");
        marketData.setNominalPrice(new BigDecimal("299.80"));

        matchingService.matchOrders(marketData, true);

        Mockito.verify(orderService).closeExpiredLimitOrders(LocalDateTime.of(2026, 3, 27, 16, 30));
        Mockito.verify(orderService).applyMatchExecution("ord_force_1", new BigDecimal("299.80"), 100);
    }

    private Order buildOrder(String orderId,
                             int type,
                             BigDecimal price,
                             int quantity,
                             int filledQuantity,
                             int status,
                             int minute) {
        Order order = new Order();
        order.setId(orderId);
        order.setUserId("u_10001");
        order.setStockCode("00700");
        order.setType(type);
        order.setPrice(price);
        order.setQuantity(quantity);
        order.setFilledQuantity(filledQuantity);
        order.setFilledAvgPrice(BigDecimal.ZERO);
        order.setStatus(status);
        order.setCreateTime(LocalDateTime.of(2026, 3, 27, 9, minute));
        order.setUpdateTime(LocalDateTime.of(2026, 3, 27, 9, minute));
        return order;
    }

    private Clock fixedClock(int year, int month, int day, int hour, int minute) {
        LocalDateTime localDateTime = LocalDateTime.of(year, month, day, hour, minute);
        Instant instant = localDateTime.atZone(HK_ZONE).toInstant();
        return Clock.fixed(instant, HK_ZONE);
    }
}
