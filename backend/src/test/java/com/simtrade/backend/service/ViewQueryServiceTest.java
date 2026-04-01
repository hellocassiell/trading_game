package com.simtrade.backend.service;

import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.entity.Order;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

class ViewQueryServiceTest {

    private ViewQueryService viewQueryService;
    private OrderService orderService;
    private MockDataService mockDataService;
    private UserProfileService userProfileService;
    private AccountLedgerService accountLedgerService;
    private MarketDataRealtimeService marketDataRealtimeService;
    private AvatarStorageService avatarStorageService;

    @BeforeEach
    void setUp() {
        viewQueryService = new ViewQueryService();
        orderService = Mockito.mock(OrderService.class);
        mockDataService = Mockito.mock(MockDataService.class);
        userProfileService = Mockito.mock(UserProfileService.class);
        accountLedgerService = new AccountLedgerService();
        marketDataRealtimeService = new MarketDataRealtimeService();
        avatarStorageService = new AvatarStorageService("target/test-avatar-store-view-query");

        ReflectionTestUtils.setField(viewQueryService, "orderService", orderService);
        ReflectionTestUtils.setField(viewQueryService, "mockDataService", mockDataService);
        ReflectionTestUtils.setField(viewQueryService, "feeCalculator", new FeeCalculator());
        ReflectionTestUtils.setField(viewQueryService, "userProfileService", userProfileService);
        ReflectionTestUtils.setField(viewQueryService, "accountLedgerService", accountLedgerService);
        ReflectionTestUtils.setField(viewQueryService, "marketDataRealtimeService", marketDataRealtimeService);
        ReflectionTestUtils.setField(viewQueryService, "avatarStorageService", avatarStorageService);

        Mockito.when(mockDataService.getStockName("00700", "zh-Hant")).thenReturn("騰訊控股");
        Mockito.when(mockDataService.getStockName("00700", "zh-Hans")).thenReturn("腾讯控股");
        Mockito.when(mockDataService.getStockName("00700", "en")).thenReturn("Tencent Holdings");
        Mockito.when(mockDataService.getStockName("02800", "zh-Hant")).thenReturn("盈富基金");
        Mockito.when(mockDataService.getStockName("02800", "zh-Hans")).thenReturn("盈富基金");
        Mockito.when(mockDataService.getStockName("02800", "en")).thenReturn("Tracker Fund of Hong Kong");
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getCurrentPrice("02800")).thenReturn(new BigDecimal("19.80"));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
        Mockito.when(mockDataService.getLotSize("02800")).thenReturn(500);
        Mockito.when(mockDataService.isSupportedStock("00700")).thenReturn(true);
        Mockito.when(mockDataService.isSuspended("00700")).thenReturn(false);
        Mockito.when(mockDataService.getPrevClose("00700")).thenReturn(new BigDecimal("297.20"));
        Mockito.when(mockDataService.getPrevClose("02800")).thenReturn(new BigDecimal("19.65"));
        Mockito.when(userProfileService.listCompletedProfiles()).thenReturn(Collections.emptyList());
    }

    @Test
    void buildAccountPositions_shouldAggregateFilledOrdersPerUser() {
        List<Order> orders = Arrays.asList(
                buildOrder("ord_buy_1", "u_2001", "00700", 1, 2, new BigDecimal("295.00"), 200, 200),
                buildOrder("ord_sell_1", "u_2001", "00700", 2, 2, new BigDecimal("305.00"), 100, 100),
                buildOrder("ord_cancel_1", "u_2001", "00700", 1, 3, new BigDecimal("299.00"), 100, 0)
        );
        Mockito.when(orderService.listHistoryOrders("u_2001", null, null)).thenReturn(orders);

        Map<String, Object> result = viewQueryService.buildAccountPositions("u_2001", "zh-Hant");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) result.get("items");

        Assertions.assertEquals(1, items.size());
        Assertions.assertEquals("00700", items.get(0).get("stockCode"));
        Assertions.assertEquals(100, items.get(0).get("quantity"));
    }

    @Test
    void buildAccountProfile_shouldUseSavedNickname() {
        Mockito.when(orderService.countTodayBuyOrders("u_2001")).thenReturn(0L);
        Mockito.when(orderService.listHistoryOrders("u_2001", null, null)).thenReturn(Arrays.asList());
        Mockito.when(userProfileService.getNickname("u_2001")).thenReturn("测试用户");
        Mockito.when(userProfileService.getAvatarId("u_2001")).thenReturn("a2");

        Map<String, Object> profile = viewQueryService.buildAccountProfile("u_2001", "zh-Hant");

        Assertions.assertEquals("测试用户", profile.get("nickname"));
        Assertions.assertEquals("/avatars/a2.svg", profile.get("avatar"));
        Assertions.assertEquals(1, profile.get("avatarVersion"));
    }

    @Test
    void buildAccountProfile_shouldUseGenericFallbackNicknameWithoutShortIdAssumption() {
        Mockito.when(orderService.countTodayBuyOrders("u_0123456789abcdef")).thenReturn(0L);
        Mockito.when(orderService.listHistoryOrders("u_0123456789abcdef", null, null)).thenReturn(Arrays.asList());

        Map<String, Object> profile = viewQueryService.buildAccountProfile("u_0123456789abcdef", "zh-Hant");

        Assertions.assertEquals("參賽者", profile.get("nickname"));
    }

    @Test
    void buildAccountAssetTrend_shouldReturnRangePointsAndCurrentAsLastPoint() {
        Mockito.when(orderService.listHistoryOrders("u_2001", null, null)).thenReturn(Arrays.asList());

        Map<String, Object> trend = viewQueryService.buildAccountAssetTrend("u_2001", "7d", "zh-Hant");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> points = (List<Map<String, Object>>) trend.get("points");

        Assertions.assertEquals("7d", trend.get("range"));
        Assertions.assertEquals(7, points.size());
        Assertions.assertEquals(LocalDate.now(ZoneId.of("Asia/Hong_Kong")).toString(), points.get(points.size() - 1).get("date"));
        Assertions.assertEquals(new BigDecimal("1000000.00"), points.get(points.size() - 1).get("totalAssets"));
    }

    @Test
    void buildAccountAssetTrend_shouldFallbackTo7dWhenRangeInvalid() {
        Mockito.when(orderService.listHistoryOrders("u_2001", null, null)).thenReturn(Arrays.asList());

        Map<String, Object> trend = viewQueryService.buildAccountAssetTrend("u_2001", "invalid", "zh-Hant");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> points = (List<Map<String, Object>>) trend.get("points");

        Assertions.assertEquals("7d", trend.get("range"));
        Assertions.assertEquals(7, points.size());
    }

    @Test
    void toOrderView_shouldIncludeSettlementFieldsWhenLedgerHasMatchedRecord() {
        Order order = buildOrder("ord_settle_view_1", "u_2002", "00700", 1, 2, new BigDecimal("300.00"), 100, 100);
        accountLedgerService.reserveForPendingOrder(order, "LIMIT", new BigDecimal("120.00"));
        accountLedgerService.onOrderMatched(
                order,
                "LIMIT",
                100,
                new BigDecimal("299.80"),
                new BigDecimal("162.38"),
                LocalDateTime.of(2026, 3, 27, 10, 0),
                java.time.LocalDate.of(2026, 4, 2)
        );

        Map<String, Object> view = viewQueryService.toOrderView(order, "zh-Hant");

        Assertions.assertEquals("2026-04-02", view.get("settlementDate"));
        Assertions.assertEquals("PENDING", view.get("settlementStatus"));
        Assertions.assertEquals(new BigDecimal("-30142.38"), view.get("estimatedNetCashFlow"));
        Assertions.assertEquals(100, view.get("matchedQuantity"));
    }

    @Test
    void buildTradeQuote_shouldPreferRealtimeSnapshotAndDepth() {
        MarketData marketData = new MarketData();
        marketData.setStockCode("00700");
        marketData.setNominalPrice(new BigDecimal("301.20"));
        MarketData.Level bid = new MarketData.Level();
        bid.setPrice(new BigDecimal("301.10"));
        bid.setVolume(4200);
        MarketData.Level ask = new MarketData.Level();
        ask.setPrice(new BigDecimal("301.30"));
        ask.setVolume(3100);
        marketData.setBids(Arrays.asList(bid));
        marketData.setAsks(Arrays.asList(ask));
        marketDataRealtimeService.publish(marketData);

        Map<String, Object> quote = viewQueryService.buildTradeQuote("00700", "zh-Hant");

        Assertions.assertEquals(new BigDecimal("301.20"), quote.get("currentPrice"));
        Assertions.assertEquals(new BigDecimal("301.10"), quote.get("bidPrice"));
        Assertions.assertEquals(new BigDecimal("301.30"), quote.get("askPrice"));
        Assertions.assertEquals("REALTIME", quote.get("source"));
    }

    @Test
    void buildHomeOverview_shouldAggregateEventStatsAndLeaderboardFromOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> allOrders = Arrays.asList(
                buildOrderAt("ord_a_buy_1", "u_3001", "00700", 1, 2, new BigDecimal("300.00"), 200, 200, now.minusHours(2)),
                buildOrderAt("ord_a_sell_1", "u_3001", "00700", 2, 2, new BigDecimal("310.00"), 100, 100, now.minusHours(1)),
                buildOrderAt("ord_b_buy_1", "u_3002", "02800", 1, 2, new BigDecimal("19.50"), 500, 500, now.minusHours(3))
        );
        Mockito.when(orderService.list()).thenReturn(allOrders);
        Mockito.when(userProfileService.listCompletedProfiles()).thenReturn(Arrays.asList(
                completedProfile("u_3001", LocalDateTime.of(2026, 3, 29, 10, 0)),
                completedProfile("u_3002", LocalDateTime.of(2026, 3, 30, 10, 0)),
                completedProfile("u_10001", LocalDateTime.of(2026, 3, 31, 10, 0))
        ));
        Mockito.when(orderService.listHistoryOrders("u_3001", null, null)).thenReturn(Arrays.asList(
                allOrders.get(0),
                allOrders.get(1)
        ));
        Mockito.when(orderService.listHistoryOrders("u_3002", null, null)).thenReturn(Arrays.asList(allOrders.get(2)));
        Mockito.when(orderService.listHistoryOrders("u_3001", LocalDate.now().minusDays(7), LocalDate.now())).thenReturn(Arrays.asList(
                allOrders.get(0),
                allOrders.get(1)
        ));
        Mockito.when(orderService.listHistoryOrders("u_3002", LocalDate.now().minusDays(7), LocalDate.now())).thenReturn(Arrays.asList(allOrders.get(2)));
        Mockito.when(orderService.listHistoryOrders("u_10001", null, null)).thenReturn(Arrays.asList());
        Mockito.when(orderService.countTodayBuyOrders("u_10001")).thenReturn(0L);
        Mockito.when(userProfileService.getNickname("u_3001")).thenReturn("Alpha");
        Mockito.when(userProfileService.getNickname("u_3002")).thenReturn("Beta");

        Map<String, Object> overview = viewQueryService.buildHomeOverview("u_10001", "zh-Hant");

        @SuppressWarnings("unchecked")
        Map<String, Object> eventStats = (Map<String, Object>) overview.get("eventStats");
        Assertions.assertEquals(3, eventStats.get("participantCount"));
        Assertions.assertEquals(new BigDecimal("100750.00"), eventStats.get("tradingAmount"));
        Assertions.assertEquals(3, eventStats.get("tradingCount"));

        @SuppressWarnings("unchecked")
        Map<String, Object> topHoldings = (Map<String, Object>) overview.get("topHoldings");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topHoldingItems = (List<Map<String, Object>>) topHoldings.get("items");
        Assertions.assertFalse(topHoldingItems.isEmpty());
        Assertions.assertEquals("00700", topHoldingItems.get(0).get("stockCode"));
        Assertions.assertEquals(1, topHoldingItems.get(0).get("holders"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> ranking = (List<Map<String, Object>>) overview.get("ranking");
        Assertions.assertFalse(ranking.isEmpty());
        Assertions.assertEquals(3, ranking.size());
        Assertions.assertEquals("參賽者", ranking.get(2).get("nickname"));
        Assertions.assertEquals("/avatars/default.svg", ranking.get(2).get("avatar"));
        Assertions.assertEquals(new BigDecimal("1000000.00"), ranking.get(2).get("totalAssets"));
        @SuppressWarnings("unchecked")
        Map<String, Object> starParticipants = (Map<String, Object>) overview.get("starParticipants");
        @SuppressWarnings("unchecked")
        Map<String, Object> starItems = (Map<String, Object>) starParticipants.get("items");
        Assertions.assertFalse(starItems.isEmpty());
        @SuppressWarnings("unchecked")
        Map<String, Object> firstStar = (Map<String, Object>) starItems.values().iterator().next();
        Assertions.assertEquals("/avatars/default.svg", firstStar.get("avatar"));
        Assertions.assertTrue(overview.containsKey("weeklyFlyers"));
    }

    @Test
    void buildRankingsLeaderboard_shouldIncludeCompletedUsersWithoutTrades() {
        Mockito.when(userProfileService.listCompletedProfiles()).thenReturn(Arrays.asList(
                completedProfile("u_7001", LocalDateTime.of(2026, 3, 29, 9, 0)),
                completedProfile("u_7002", LocalDateTime.of(2026, 3, 29, 9, 5))
        ));
        Mockito.when(userProfileService.getNickname("u_7001")).thenReturn("Alpha");
        Mockito.when(userProfileService.getNickname("u_7002")).thenReturn("Beta");
        Mockito.when(orderService.list()).thenReturn(Collections.emptyList());

        Map<String, Object> rankings = viewQueryService.buildRankingsLeaderboard("u_7002", 1, 20, "zh-Hant");

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) rankings.get("items");
        Assertions.assertEquals(2, rankings.get("total"));
        Assertions.assertEquals("Alpha", items.get(0).get("nickname"));
        Assertions.assertEquals("/avatars/default.svg", items.get(0).get("avatar"));
        Assertions.assertEquals(new BigDecimal("1000000.00"), items.get(0).get("totalAssets"));
        Assertions.assertEquals(Boolean.TRUE, items.get(1).get("isCurrentUser"));
    }

    @Test
    void buildTopHoldingsLeaderboard_shouldUseRealHoldingAggregation() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> allOrders = Arrays.asList(
                buildOrderAt("ord_h_1", "u_4001", "00700", 1, 2, new BigDecimal("290.00"), 100, 100, now.minusDays(1)),
                buildOrderAt("ord_h_2", "u_4002", "00700", 1, 2, new BigDecimal("295.00"), 200, 200, now.minusHours(8)),
                buildOrderAt("ord_h_3", "u_4002", "02800", 1, 2, new BigDecimal("19.80"), 500, 500, now.minusHours(7))
        );
        Mockito.when(orderService.list()).thenReturn(allOrders);
        Mockito.when(userProfileService.listCompletedProfiles()).thenReturn(Arrays.asList(
                completedProfile("u_4001", LocalDateTime.of(2026, 3, 29, 9, 0)),
                completedProfile("u_4002", LocalDateTime.of(2026, 3, 29, 9, 5))
        ));
        Mockito.when(orderService.listHistoryOrders("u_4001", null, null)).thenReturn(Arrays.asList(allOrders.get(0)));
        Mockito.when(orderService.listHistoryOrders("u_4002", null, null)).thenReturn(Arrays.asList(allOrders.get(1), allOrders.get(2)));

        Map<String, Object> topHoldings = viewQueryService.buildTopHoldingsLeaderboard("zh-Hant");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) topHoldings.get("items");

        Assertions.assertEquals("00700", items.get(0).get("stockCode"));
        Assertions.assertEquals(2, items.get(0).get("holders"));
        Assertions.assertEquals(new BigDecimal("90000.00"), items.get(0).get("holdingValue"));
    }

    @Test
    void buildTopTurnoverLeaderboard_shouldAggregateBuyAndSellAmountsFromOrders() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> allOrders = Arrays.asList(
                buildOrderAt("ord_t_1", "u_5001", "00700", 1, 2, new BigDecimal("300.00"), 100, 100, now.minusDays(1)),
                buildOrderAt("ord_t_2", "u_5001", "02800", 2, 2, new BigDecimal("19.70"), 500, 500, now.minusDays(1)),
                buildOrderAt("ord_t_3", "u_5002", "02800", 1, 2, new BigDecimal("19.60"), 1000, 1000, now.minusHours(10))
        );
        Mockito.when(orderService.list()).thenReturn(allOrders);
        Mockito.when(userProfileService.listCompletedProfiles()).thenReturn(Arrays.asList(
                completedProfile("u_5001", LocalDateTime.of(2026, 3, 29, 9, 0)),
                completedProfile("u_5002", LocalDateTime.of(2026, 3, 29, 9, 5))
        ));

        Map<String, Object> topTurnover = viewQueryService.buildTopTurnoverLeaderboard("zh-Hant");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> buy = (List<Map<String, Object>>) topTurnover.get("buy");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> sell = (List<Map<String, Object>>) topTurnover.get("sell");

        Assertions.assertEquals("00700", buy.get(0).get("stockCode"));
        Assertions.assertEquals(new BigDecimal("30000.00"), buy.get(0).get("amount"));
        Assertions.assertEquals("02800", sell.get(0).get("stockCode"));
        Assertions.assertEquals(new BigDecimal("9850.00"), sell.get(0).get("amount"));
    }

    @Test
    void buildTopLoserHoldingsLeaderboard_shouldAggregateNegativePnlPositions() {
        LocalDateTime now = LocalDateTime.now();
        List<Order> allOrders = Arrays.asList(
                buildOrderAt("ord_l_1", "u_6001", "00700", 1, 2, new BigDecimal("320.00"), 100, 100, now.minusDays(1)),
                buildOrderAt("ord_l_2", "u_6002", "00700", 1, 2, new BigDecimal("310.00"), 200, 200, now.minusHours(6)),
                buildOrderAt("ord_l_3", "u_6003", "02800", 1, 2, new BigDecimal("19.50"), 500, 500, now.minusHours(5))
        );
        Mockito.when(orderService.list()).thenReturn(allOrders);
        Mockito.when(userProfileService.listCompletedProfiles()).thenReturn(Arrays.asList(
                completedProfile("u_6001", LocalDateTime.of(2026, 3, 29, 9, 0)),
                completedProfile("u_6002", LocalDateTime.of(2026, 3, 29, 9, 5)),
                completedProfile("u_6003", LocalDateTime.of(2026, 3, 29, 9, 10))
        ));

        Map<String, Object> losers = viewQueryService.buildTopLoserHoldingsLeaderboard("zh-Hant");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) losers.get("items");

        Assertions.assertFalse(items.isEmpty());
        Assertions.assertEquals("00700", items.get(0).get("stockCode"));
        Assertions.assertEquals(new BigDecimal("4000.00"), items.get(0).get("lossAmount"));
    }

    @Test
    void buildAccountPositions_shouldTriggerReadSettlementFallbackWhenEnabled() {
        ViewQueryService service = new ViewQueryService();
        OrderService localOrderService = Mockito.mock(OrderService.class);
        MockDataService localMockDataService = Mockito.mock(MockDataService.class);
        UserProfileService localUserProfileService = Mockito.mock(UserProfileService.class);
        AccountLedgerService localLedgerService = Mockito.mock(AccountLedgerService.class);

        ReflectionTestUtils.setField(service, "orderService", localOrderService);
        ReflectionTestUtils.setField(service, "mockDataService", localMockDataService);
        ReflectionTestUtils.setField(service, "feeCalculator", new FeeCalculator());
        ReflectionTestUtils.setField(service, "userProfileService", localUserProfileService);
        ReflectionTestUtils.setField(service, "accountLedgerService", localLedgerService);
        ReflectionTestUtils.setField(service, "readSettlementFallbackEnabled", true);

        Mockito.when(localLedgerService.getPositionSnapshots("u_8801")).thenReturn(Collections.emptyMap());
        Mockito.when(localOrderService.listHistoryOrders("u_8801", null, null)).thenReturn(Collections.emptyList());

        service.buildAccountPositions("u_8801", "zh-Hant");

        Mockito.verify(localLedgerService).processSettlements(LocalDate.now(ZoneId.of("Asia/Hong_Kong")));
    }

    @Test
    void buildAccountPositions_shouldSkipReadSettlementFallbackWhenDisabled() {
        ViewQueryService service = new ViewQueryService();
        OrderService localOrderService = Mockito.mock(OrderService.class);
        MockDataService localMockDataService = Mockito.mock(MockDataService.class);
        UserProfileService localUserProfileService = Mockito.mock(UserProfileService.class);
        AccountLedgerService localLedgerService = Mockito.mock(AccountLedgerService.class);

        ReflectionTestUtils.setField(service, "orderService", localOrderService);
        ReflectionTestUtils.setField(service, "mockDataService", localMockDataService);
        ReflectionTestUtils.setField(service, "feeCalculator", new FeeCalculator());
        ReflectionTestUtils.setField(service, "userProfileService", localUserProfileService);
        ReflectionTestUtils.setField(service, "accountLedgerService", localLedgerService);
        ReflectionTestUtils.setField(service, "readSettlementFallbackEnabled", false);

        Mockito.when(localLedgerService.getPositionSnapshots("u_8802")).thenReturn(new LinkedHashMap<String, AccountLedgerService.PositionSnapshot>());

        service.buildAccountPositions("u_8802", "zh-Hant");

        Mockito.verify(localLedgerService, Mockito.never()).processSettlements(Mockito.any(LocalDate.class));
    }

    private Order buildOrder(
            String id,
            String userId,
            String stockCode,
            int type,
            int status,
            BigDecimal price,
            int quantity,
            int filledQuantity) {
        return buildOrderAt(id, userId, stockCode, type, status, price, quantity, filledQuantity, LocalDateTime.now());
    }

    private Order buildOrderAt(
            String id,
            String userId,
            String stockCode,
            int type,
            int status,
            BigDecimal price,
            int quantity,
            int filledQuantity,
            LocalDateTime createTime) {
        Order order = new Order();
        order.setId(id);
        order.setUserId(userId);
        order.setStockCode(stockCode);
        order.setType(type);
        order.setStatus(status);
        order.setPrice(price);
        order.setQuantity(quantity);
        order.setFilledQuantity(filledQuantity);
        order.setFilledAvgPrice(price);
        order.setCreateTime(createTime);
        order.setUpdateTime(createTime);
        return order;
    }

    private UserProfileService.CompletedProfile completedProfile(String userId, LocalDateTime createdAt) {
        return new UserProfileService.CompletedProfile(userId, createdAt);
    }
}
