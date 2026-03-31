package com.simtrade.backend.service;

import com.simtrade.backend.common.LanguageSupport;
import com.simtrade.backend.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ViewQueryService {

    private static final String DEFAULT_CURRENCY = "HKD";
    private static final BigDecimal INITIAL_CAPITAL = new BigDecimal("1000000.00");
    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");
    private static final DateTimeFormatter OFFSET_TIME_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;
    private static final int TYPE_BUY = 1;
    private static final int TYPE_SELL = 2;

    @Autowired
    private OrderService orderService;

    @Autowired
    private MockDataService mockDataService;

    @Autowired
    private FeeCalculator feeCalculator;

    @Autowired
    private UserProfileService userProfileService;

    @Autowired(required = false)
    private AvatarStorageService avatarStorageService;

    @Autowired(required = false)
    private AccountLedgerService accountLedgerService = new AccountLedgerService();

    @Autowired(required = false)
    private MarketDataRealtimeService marketDataRealtimeService = new MarketDataRealtimeService();

    public Map<String, Object> buildAccountProfile(String userId, String language) {
        long dailyBuyUsed = orderService.countTodayBuyOrders(userId);
        int dailyTradesRemaining = (int) Math.max(0, 20 - dailyBuyUsed);
        processSettlementNow();
        AnalyticsBundle analyticsBundle = buildAnalyticsBundle(userId);
        UserAnalytics userAnalytics = analyticsBundle.usersById.get(safeUser(userId));

        List<Map<String, Object>> positions = buildPositionItemsFromFilledOrders(userId, language);
        AccountAssetSnapshot assetSnapshot = calculateAccountAssetSnapshot(userId, positions);
        BigDecimal bonusAmount = BigDecimal.ZERO;

        Map<String, Object> profile = new LinkedHashMap<String, Object>();
        profile.put("userId", userId);
        profile.put("nickname", resolveNickname(userId, language));
        profile.put("avatar", resolveAvatar(userId));
        profile.put("avatarVersion", avatarStorageService == null ? 1 : avatarStorageService.currentAvatarVersion());
        profile.put("currency", DEFAULT_CURRENCY);
        profile.put("rank", userAnalytics == null || userAnalytics.rank <= 0 ? analyticsBundle.totalParticipants : userAnalytics.rank);
        profile.put("rankDelta", userAnalytics == null ? 0 : userAnalytics.rankDelta);
        profile.put("dailyTradesRemaining", dailyTradesRemaining);
        profile.put("weeklyTradesRequired", 4);
        profile.put("weeklyTradesRemaining", userAnalytics == null
                ? 4
                : Math.max(0, 4 - userAnalytics.weeklyTradeCount));
        profile.put("initialCapital", INITIAL_CAPITAL);
        profile.put("bonusAmount", bonusAmount);
        profile.put("securitiesMarketValue", assetSnapshot.securitiesMarketValue);
        profile.put("cashAvailable", assetSnapshot.cashAvailable);
        profile.put("frozenCash", assetSnapshot.frozenCash);
        profile.put("transitCash", assetSnapshot.transitCash);
        profile.put("totalAssets", assetSnapshot.totalAssets);
        profile.put("updatedAt", nowInHkOffset());
        profile.put("lang", language);
        return profile;
    }

    public Map<String, Object> buildAccountPositions(String userId, String language) {
        processSettlementNow();
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("currency", DEFAULT_CURRENCY);
        response.put("updatedAt", nowInHkOffset());
        response.put("items", buildPositionItemsFromFilledOrders(userId, language));
        response.put("lang", language);
        return response;
    }

    public Map<String, Object> buildAccountAssetTrend(String userId, String range, String language) {
        processSettlementNow();
        int days = resolveTrendDays(range);
        String normalizedRange = days == 30 ? "30d" : "7d";
        List<Map<String, Object>> positions = buildPositionItemsFromFilledOrders(userId, language);
        AccountAssetSnapshot assetSnapshot = calculateAccountAssetSnapshot(userId, positions);
        BigDecimal currentTotalAssets = assetSnapshot.totalAssets;

        BigDecimal startFactor = days == 30 ? new BigDecimal("0.94") : new BigDecimal("0.97");
        BigDecimal startAssets = currentTotalAssets.multiply(startFactor).setScale(2, RoundingMode.HALF_UP);
        LocalDate endDate = LocalDate.now(HK_ZONE);
        List<Map<String, Object>> points = new ArrayList<Map<String, Object>>();

        for (int index = 0; index < days; index++) {
            LocalDate pointDate = endDate.minusDays(days - 1L - index);
            BigDecimal totalAssets = interpolateAssetPoint(startAssets, currentTotalAssets, index, days);
            if (index == days - 1) {
                totalAssets = currentTotalAssets;
            }
            BigDecimal changePercent = totalAssets.subtract(INITIAL_CAPITAL)
                    .divide(INITIAL_CAPITAL, 6, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);

            Map<String, Object> point = new LinkedHashMap<String, Object>();
            point.put("date", pointDate.toString());
            point.put("totalAssets", totalAssets);
            point.put("changePercent", changePercent);
            points.add(point);
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("range", normalizedRange);
        data.put("currency", DEFAULT_CURRENCY);
        data.put("points", points);
        data.put("updatedAt", nowInHkOffset());
        data.put("lang", language);
        return data;
    }

    public Map<String, Object> buildHomeOverview(String userId, String language) {
        processSettlementNow();
        AnalyticsBundle analyticsBundle = buildAnalyticsBundle(userId);
        Map<String, Object> topHoldings = buildTopHoldingsLeaderboard(language);
        Map<String, Object> topTurnover = buildTopTurnoverLeaderboard(language);
        Map<String, Object> rankingPage = buildRankingsLeaderboard(userId, 1, 20, language);
        List<Map<String, Object>> starItems = buildStarTraderCards(analyticsBundle.rankingUsers, language, 3);

        Map<String, Object> overview = new LinkedHashMap<String, Object>();
        Map<String, Object> competition = new LinkedHashMap<String, Object>();
        competition.put("name", text(language, "智財港股投資大賽2026", "智财港股投资大赛2026", "HK Stock Trading Game 2026"));
        competition.put("sponsor", "Citi");
        competition.put("currency", DEFAULT_CURRENCY);
        competition.put("updatedAt", nowInHkOffset());
        overview.put("competition", competition);

        Map<String, Object> eventStats = new LinkedHashMap<String, Object>();
        eventStats.put("participantCount", analyticsBundle.totalParticipants);
        eventStats.put("holdingAssetValue", analyticsBundle.totalHoldingValue);
        eventStats.put("tradingAmount", analyticsBundle.totalTradingAmount);
        eventStats.put("tradingCount", analyticsBundle.totalTradingCount);
        eventStats.put("todayTradingAmount", analyticsBundle.todayTradingAmount);
        eventStats.put("todayTradingCount", analyticsBundle.todayTradingCount);
        eventStats.put("totalTradingAmount", analyticsBundle.totalTradingAmount);
        eventStats.put("totalTradingCount", analyticsBundle.totalTradingCount);
        eventStats.put("updatedAt", nowInHkOffset());
        overview.put("eventStats", eventStats);

        Map<String, Object> banner = new LinkedHashMap<String, Object>();
        banner.put("title", text(language, "想賺取 HK$500,000 模擬交易資金？", "想赚取 HK$500,000 模拟交易资金？", "Want HK$500,000 virtual trading capital?"));
        banner.put("ctaText", text(language, "查看詳情", "查看详情", "View details"));
        banner.put("linkType", "RULES");
        overview.put("banner", banner);
        overview.put("mySummary", buildAccountProfile(userId, language));

        Map<String, Object> starParticipants = new LinkedHashMap<String, Object>();
        List<String> starTabs = new ArrayList<String>();
        Map<String, Object> starItemsMap = new LinkedHashMap<String, Object>();
        for (Map<String, Object> item : starItems) {
            String name = String.valueOf(item.get("name"));
            starTabs.add(name);
            starItemsMap.put(name, item);
        }
        starParticipants.put("tabs", starTabs);
        starParticipants.put("items", starItemsMap);
        starParticipants.put("updatedAt", nowInHkOffset());
        overview.put("starParticipants", starParticipants);
        if (!starItems.isEmpty()) {
            Map<String, Object> featured = starItems.get(0);
            Map<String, Object> starParticipant = new LinkedHashMap<String, Object>();
            starParticipant.put("tabs", starTabs);
            starParticipant.put("featuredTab", featured.get("name"));
            starParticipant.put("name", featured.get("name"));
            starParticipant.put("tag", featured.get("tag"));
            starParticipant.put("advice", featured.get("intro"));
            starParticipant.put("totalAssets", featured.get("totalAssets"));
            starParticipant.put("topHolding", featured.get("topHolding"));
            starParticipant.put("recentTrade", featured.get("recentTrade"));
            overview.put("starParticipant", starParticipant);
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topBuyList = (List<Map<String, Object>>) topTurnover.get("buy");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> topSellList = (List<Map<String, Object>>) topTurnover.get("sell");
        Map<String, Object> topTurnoverSnapshot = new LinkedHashMap<String, Object>();
        topTurnoverSnapshot.put("topBuy", topBuyList.isEmpty() ? new LinkedHashMap<String, Object>() : topBuyList.get(0));
        topTurnoverSnapshot.put("topSell", topSellList.isEmpty() ? new LinkedHashMap<String, Object>() : topSellList.get(0));
        overview.put("topTurnoverSnapshot", topTurnoverSnapshot);
        overview.put("topHoldings", topHoldings);
        overview.put("topTurnover", topTurnover);
        overview.put("weeklyFlyers", buildWeeklyFlyers(analyticsBundle, language));
        overview.put("ranking", rankingPage.get("items"));
        overview.put("rankingUpdatedAt", rankingPage.get("updatedAt"));
        overview.put("lang", language);
        return overview;
    }

    public Map<String, Object> searchTradeTargets(String keyword, String language) {
        List<Map<String, Object>> items = mockDataService.searchStocks(keyword, language);
        items.sort(Comparator.comparing(item -> String.valueOf(item.get("stockCode"))));

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("keyword", keyword == null ? "" : keyword.trim());
        data.put("total", items.size());
        data.put("items", items);
        data.put("updatedAt", nowInHkOffset());
        data.put("lang", language);
        return data;
    }

    public Map<String, Object> buildTradeQuote(String stockCode, String language) {
        if (!mockDataService.isSupportedStock(stockCode)) {
            throw new IllegalArgumentException("Stock is not tradable in the whitelist pool.");
        }

        MarketDataRealtimeService.QuoteSnapshot realtime = marketDataRealtimeService == null
                ? null
                : marketDataRealtimeService.getLatestSnapshot(stockCode);
        BigDecimal currentPrice = resolveCurrentPrice(stockCode, realtime);
        if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
            currentPrice = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal prevClose = mockDataService.getPrevClose(stockCode);
        if (prevClose == null || prevClose.compareTo(BigDecimal.ZERO) <= 0) {
            prevClose = currentPrice;
        }
        BigDecimal tickSize = mockDataService.getTickSize(currentPrice);
        if (tickSize == null || tickSize.compareTo(BigDecimal.ZERO) <= 0) {
            tickSize = new BigDecimal("0.01");
        }
        BigDecimal changeAmount = currentPrice.subtract(prevClose).setScale(2, RoundingMode.HALF_UP);
        BigDecimal changePercent;
        if (prevClose.compareTo(BigDecimal.ZERO) == 0) {
            changePercent = BigDecimal.ZERO;
        } else {
            changePercent = changeAmount
                    .divide(prevClose, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("stockCode", stockCode);
        data.put("stockName", mockDataService.getStockName(stockCode, language));
        data.put("currency", DEFAULT_CURRENCY);
        data.put("currentPrice", currentPrice);
        data.put("prevClose", prevClose);
        data.put("changeAmount", changeAmount);
        data.put("changePercent", changePercent);
        data.put("tickSize", tickSize);
        data.put("lotSize", mockDataService.getLotSize(stockCode));
        data.put("suspended", mockDataService.isSuspended(stockCode));
        data.put("tradable", !mockDataService.isSuspended(stockCode));
        data.put("updatedAt", formatQuoteUpdatedAt(realtime));
        BigDecimal bidPrice = resolveBestBid(realtime, currentPrice.subtract(tickSize));
        BigDecimal askPrice = resolveBestAsk(realtime, currentPrice.add(tickSize));
        data.put("bidPrice", bidPrice);
        data.put("askPrice", askPrice);
        data.put("orderBook", buildOrderBook(realtime, bidPrice, askPrice, tickSize));
        data.put("source", realtime == null ? "MOCK" : "REALTIME");
        data.put("lang", language);
        return data;
    }

    public Map<String, Object> buildStarTradersLeaderboard(String userId, String language) {
        AnalyticsBundle analyticsBundle = buildAnalyticsBundle(userId);
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        List<Map<String, Object>> items = buildStarTraderCards(analyticsBundle.rankingUsers, language, 20);
        data.put("currentUserId", userId);
        data.put("total", items.size());
        data.put("items", items);
        data.put("updatedAt", nowInHkOffset());
        data.put("lang", language);
        return data;
    }

    public Map<String, Object> buildTopHoldingsLeaderboard(String language) {
        AnalyticsBundle analyticsBundle = buildAnalyticsBundle(null);
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (StockHoldingAnalytics holding : analyticsBundle.topHoldingItems) {
            items.add(buildHoldingLeaderboardItem(
                    holding.stockCode,
                    mockDataService.getStockName(holding.stockCode, language),
                    holding.holders,
                    holding.holdingValue
            ));
        }
        data.put("total", items.size());
        data.put("items", items);
        data.put("updatedAt", nowInHkOffset());
        data.put("lang", language);
        return data;
    }

    public Map<String, Object> buildTopTurnoverLeaderboard(String language) {
        AnalyticsBundle analyticsBundle = buildAnalyticsBundle(null);
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        List<Map<String, Object>> buy = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> sell = new ArrayList<Map<String, Object>>();
        for (TurnoverAnalytics item : analyticsBundle.topBuyTurnover) {
            buy.add(buildTurnoverItem(item.stockCode, mockDataService.getStockName(item.stockCode, language), item.amount));
        }
        for (TurnoverAnalytics item : analyticsBundle.topSellTurnover) {
            sell.add(buildTurnoverItem(item.stockCode, mockDataService.getStockName(item.stockCode, language), item.amount));
        }
        data.put("buy", buy);
        data.put("sell", sell);
        data.put("updatedAt", nowInHkOffset());
        data.put("lang", language);
        return data;
    }

    public Map<String, Object> buildTopLoserHoldingsLeaderboard(String language) {
        AnalyticsBundle analyticsBundle = buildAnalyticsBundle(null);
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (StockLoserAnalytics loser : analyticsBundle.topLoserHoldingItems) {
            Map<String, Object> item = new LinkedHashMap<String, Object>();
            item.put("stockCode", loser.stockCode);
            item.put("stockName", mockDataService.getStockName(loser.stockCode, language));
            item.put("holders", loser.holders);
            item.put("lossAmount", loser.lossAmount.setScale(2, RoundingMode.HALF_UP));
            item.put("movement", "DOWN");
            items.add(item);
        }
        data.put("total", items.size());
        data.put("items", items);
        data.put("updatedAt", nowInHkOffset());
        data.put("lang", language);
        return data;
    }

    public Map<String, Object> buildRankingsLeaderboard(String userId, Integer page, Integer pageSize, String language) {
        AnalyticsBundle analyticsBundle = buildAnalyticsBundle(userId);
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 20 : pageSize;
        int fromIndex = Math.min((safePage - 1) * safePageSize, analyticsBundle.rankingUsers.size());
        int toIndex = Math.min(fromIndex + safePageSize, analyticsBundle.rankingUsers.size());

        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (UserAnalytics participant : analyticsBundle.rankingUsers.subList(fromIndex, toIndex)) {
            Map<String, Object> item = new LinkedHashMap<String, Object>();
            item.put("rank", participant.rank);
            item.put("rankMovement", movementLabel(participant.rankDelta));
            item.put("nickname", resolveNickname(participant.userId, language));
            item.put("totalAssets", participant.totalAssets);
            item.put("changePercent", participant.totalChangePercent);
            item.put("isCurrentUser", safeUser(userId).equals(participant.userId));
            items.add(item);
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("page", safePage);
        data.put("pageSize", safePageSize);
        data.put("total", analyticsBundle.rankingUsers.size());
        data.put("items", items);
        data.put("updatedAt", nowInHkOffset());
        data.put("lang", language);
        return data;
    }

    private String resolveNickname(String userId, String language) {
        String profileNickname = userProfileService.getNickname(userId);
        if (profileNickname != null && !profileNickname.trim().isEmpty()) {
            return profileNickname.trim();
        }
        return text(language, "參賽者", "参赛者", "Participant");
    }

    private String resolveAvatar(String userId) {
        String avatarId = userProfileService.getAvatarId(userId);
        if (avatarStorageService == null) {
            return "/avatars/default.svg";
        }
        return avatarStorageService.resolveAvatarForView(avatarId);
    }

    public Map<String, Object> toOrderView(Order order, String language) {
        processSettlementNow();
        Map<String, Object> view = new LinkedHashMap<String, Object>();
        view.put("orderId", order.getId());
        view.put("stockCode", order.getStockCode());
        view.put("stockName", mockDataService.getStockName(order.getStockCode(), language));
        view.put("direction", safeType(order.getType()) == 1 ? "BUY" : "SELL");
        view.put("orderType", orderService.getOrderType(order.getId()));
        view.put("price", order.getPrice());
        view.put("quantity", order.getQuantity());
        view.put("filledQuantity", order.getFilledQuantity());
        view.put("filledAvgPrice", order.getFilledAvgPrice());
        view.put("status", mapOrderStatus(order.getStatus()));
        view.put("feeAmount", estimateFee(order));
        view.put("createdAt", order.getCreateTime() == null ? null : formatDateTime(order.getCreateTime()));
        view.put("canAmend", canAmend(order));
        view.put("canCancel", canCancel(order));
        AccountLedgerService.OrderSettlementSnapshot settlementSnapshot = accountLedgerService == null
                ? null
                : accountLedgerService.getOrderSettlementSnapshot(order.getId());
        if (settlementSnapshot != null) {
            view.put("settlementDate", settlementSnapshot.getSettlementDate() == null
                    ? null
                    : settlementSnapshot.getSettlementDate().toString());
            view.put("settlementStatus", settlementSnapshot.getSettlementStatus());
            view.put("matchedQuantity", settlementSnapshot.getMatchedQuantity());
            view.put("matchedAmount", settlementSnapshot.getMatchedAmount());
            view.put("totalFee", settlementSnapshot.getTotalFee());
            view.put("estimatedNetCashFlow", settlementSnapshot.getNetCashFlow());
            view.put("lastMatchedAt", settlementSnapshot.getLastMatchedAt() == null
                    ? null
                    : formatDateTime(settlementSnapshot.getLastMatchedAt()));
        }
        view.put("lang", language);
        return view;
    }

    public BigDecimal estimateFee(Order order) {
        BigDecimal price = order.getPrice() == null ? BigDecimal.ZERO : order.getPrice();
        int quantity = order.getQuantity() == null ? 0 : order.getQuantity();
        BigDecimal amount = price.multiply(new BigDecimal(quantity));
        int lots = Math.max(1, quantity / Math.max(1, mockDataService.getLotSize(order.getStockCode())));
        return feeCalculator.calculateTotalFee(amount, safeType(order.getType()) == 1, lots);
    }

    public String mapOrderStatus(Integer status) {
        int safeStatus = status == null ? 0 : status;
        if (safeStatus == 0) {
            return "PENDING";
        }
        if (safeStatus == 1) {
            return "PARTIAL_FILLED";
        }
        if (safeStatus == 2) {
            return "FILLED";
        }
        if (safeStatus == 3) {
            return "CANCELED";
        }
        return "REJECTED";
    }

    public boolean canCancel(Order order) {
        int status = order.getStatus() == null ? 0 : order.getStatus();
        return status == 0 || status == 1;
    }

    private boolean canAmend(Order order) {
        return canCancel(order) && "LIMIT".equals(orderService.getOrderType(order.getId()));
    }

    private List<Map<String, Object>> buildStarTraderCards(List<UserAnalytics> rankingUsers, String language, int limit) {
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        int max = Math.min(Math.max(0, limit), rankingUsers.size());
        for (int i = 0; i < max; i++) {
            UserAnalytics participant = rankingUsers.get(i);
            String topHoldingCode = participant.topHoldingCode == null || participant.topHoldingCode.isEmpty()
                    ? "--"
                    : participant.topHoldingCode;
            String topHolding = "--".equals(topHoldingCode)
                    ? "--"
                    : topHoldingCode + " " + mockDataService.getStockName(topHoldingCode, language);
            String recentTrade = buildRecentTradeText(participant, language);

            Map<String, Object> item = new LinkedHashMap<String, Object>();
            item.put("userId", participant.userId);
            item.put("rank", participant.rank);
            item.put("name", resolveNickname(participant.userId, language));
            item.put("tag", buildStarTag(participant.rank, language));
            item.put("intro", text(
                    language,
                    "近7日完成 " + participant.weeklyTradeCount + " 筆交易，重點關注 " + topHolding,
                    "近7日完成 " + participant.weeklyTradeCount + " 笔交易，重点关注 " + topHolding,
                    "Completed " + participant.weeklyTradeCount + " trades in the last 7 days, focused on " + topHolding
            ));
            item.put("totalAssets", participant.totalAssets);
            item.put("holding", topHoldingCode);
            item.put("topHolding", topHolding);
            item.put("recentTrade", recentTrade);
            item.put("securitiesMarketValue", participant.securitiesValue);
            item.put("cashEstimate", participant.totalAssets.subtract(participant.securitiesValue).setScale(2, RoundingMode.HALF_UP));
            item.put("changePercent", participant.totalChangePercent);
            items.add(item);
        }
        return items;
    }

    private Map<String, Object> buildWeeklyFlyers(AnalyticsBundle bundle, String language) {
        List<UserAnalytics> sorted = new ArrayList<UserAnalytics>(bundle.rankingUsers);
        sorted.sort((left, right) -> {
            int compareWeekly = right.weeklyPerformancePercent.compareTo(left.weeklyPerformancePercent);
            if (compareWeekly != 0) {
                return compareWeekly;
            }
            int compareTrades = Integer.compare(right.weeklyTradeCount, left.weeklyTradeCount);
            if (compareTrades != 0) {
                return compareTrades;
            }
            return left.userId.compareTo(right.userId);
        });

        List<UserAnalytics> top = new ArrayList<UserAnalytics>();
        for (int i = 0; i < Math.min(3, sorted.size()); i++) {
            top.add(sorted.get(i));
        }
        while (top.size() < 3 && !bundle.rankingUsers.isEmpty()) {
            top.add(bundle.rankingUsers.get(Math.min(top.size(), bundle.rankingUsers.size() - 1)));
        }

        LocalDate weekEnd = LocalDate.now(HK_ZONE);
        LocalDate weekStart = weekEnd.minusDays(6);
        String periodText = weekStart + " ~ " + weekEnd;

        String first = text(language, "第一名", "第一名", "1st");
        String second = text(language, "第二名", "第二名", "2nd");
        String third = text(language, "第三名", "第三名", "3rd");
        List<String> tabs = Arrays.asList(first, second, third);

        Map<String, Object> items = new LinkedHashMap<String, Object>();
        for (int i = 0; i < tabs.size(); i++) {
            UserAnalytics participant = i < top.size() ? top.get(i) : null;
            String tab = tabs.get(i);
            Map<String, Object> item = new LinkedHashMap<String, Object>();
            item.put("name", participant == null ? text(language, "暫無資料", "暂无资料", "N/A") : resolveNickname(participant.userId, language));
            item.put("tag", text(language, "本周飛躍王", "本周飞跃王", "Weekly Flyer"));
            item.put("period", periodText);
            item.put("gainLabel", text(language, "本周回報", "本周回报", "Weekly Return"));
            item.put("gain", participant == null ? "0.00%" : formatPercent(participant.weeklyPerformancePercent));
            item.put("riseLabel", text(language, "本周活躍交易", "本周活跃交易", "Weekly Trades"));
            item.put("rise", participant == null ? 0 : participant.weeklyTradeCount);
            items.put(tab, item);
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("tabs", tabs);
        data.put("items", items);
        data.put("updatedAt", nowInHkOffset());
        return data;
    }

    private AnalyticsBundle buildAnalyticsBundle(String anchorUserId) {
        AnalyticsBundle bundle = new AnalyticsBundle();
        Map<String, UserAnalytics> userMap = new LinkedHashMap<String, UserAnalytics>();
        Map<String, BigDecimal> buyTurnoverByStock = new LinkedHashMap<String, BigDecimal>();
        Map<String, BigDecimal> sellTurnoverByStock = new LinkedHashMap<String, BigDecimal>();
        LocalDate today = LocalDate.now(HK_ZONE);
        LocalDate weeklyStart = today.minusDays(6);
        List<UserProfileService.CompletedProfile> completedProfiles = userProfileService == null
                ? new ArrayList<UserProfileService.CompletedProfile>()
                : userProfileService.listCompletedProfiles();

        for (UserProfileService.CompletedProfile completedProfile : completedProfiles) {
            if (completedProfile == null) {
                continue;
            }
            String userId = safeUser(completedProfile.getUserId());
            if (userId.isEmpty()) {
                continue;
            }
            UserAnalytics userAnalytics = userMap.computeIfAbsent(userId, UserAnalytics::new);
            userAnalytics.registeredAt = completedProfile.getCreatedAt();
        }

        for (Order order : listAllOrdersForAnalytics()) {
            if (!isExecutedOrder(order)) {
                continue;
            }
            String userId = safeUser(order.getUserId());
            if (userId.isEmpty() || !userMap.containsKey(userId)) {
                continue;
            }
            String stockCode = safeStock(order.getStockCode());
            if (stockCode.isEmpty()) {
                continue;
            }

            int quantity = resolveExecutedQuantity(order);
            if (quantity <= 0) {
                continue;
            }
            BigDecimal price = resolveExecutedPrice(order);
            if (price.compareTo(BigDecimal.ZERO) <= 0) {
                continue;
            }
            BigDecimal amount = price.multiply(new BigDecimal(quantity)).setScale(2, RoundingMode.HALF_UP);

            UserAnalytics userAnalytics = userMap.computeIfAbsent(userId, key -> new UserAnalytics(key));
            PositionAggregate position = userAnalytics.positions.computeIfAbsent(stockCode, key -> new PositionAggregate());
            int lots = Math.max(1, quantity / Math.max(1, mockDataService.getLotSize(stockCode)));
            boolean isBuy = safeType(order.getType()) == TYPE_BUY;
            BigDecimal fee = feeCalculator.calculateTotalFee(amount, isBuy, lots).setScale(2, RoundingMode.HALF_UP);

            if (isBuy) {
                position.buyQuantity += quantity;
                position.buyAmount = position.buyAmount.add(amount);
                userAnalytics.cashDelta = userAnalytics.cashDelta.subtract(amount.add(fee));
                buyTurnoverByStock.merge(stockCode, amount, BigDecimal::add);
                if (isInDateRange(order.getCreateTime(), weeklyStart, today)) {
                    userAnalytics.weeklyBuyAmount = userAnalytics.weeklyBuyAmount.add(amount);
                }
            } else {
                position.sellQuantity += quantity;
                userAnalytics.cashDelta = userAnalytics.cashDelta.add(amount.subtract(fee));
                sellTurnoverByStock.merge(stockCode, amount, BigDecimal::add);
                if (isInDateRange(order.getCreateTime(), weeklyStart, today)) {
                    userAnalytics.weeklySellAmount = userAnalytics.weeklySellAmount.add(amount);
                }
            }

            bundle.totalTradingAmount = bundle.totalTradingAmount.add(amount);
            bundle.totalTradingCount += 1;
            if (isSameDay(order.getCreateTime(), today)) {
                bundle.todayTradingAmount = bundle.todayTradingAmount.add(amount);
                bundle.todayTradingCount += 1;
            }
            if (isInDateRange(order.getCreateTime(), weeklyStart, today)) {
                userAnalytics.weeklyTradeCount += 1;
            }
            userAnalytics.tradeCount += 1;
            if (userAnalytics.latestTradeTime == null || (order.getCreateTime() != null && order.getCreateTime().isAfter(userAnalytics.latestTradeTime))) {
                userAnalytics.latestTradeTime = order.getCreateTime();
                userAnalytics.latestTradeType = safeType(order.getType());
                userAnalytics.latestTradeCode = stockCode;
            }
        }

        for (UserAnalytics analytics : userMap.values()) {
            BigDecimal securitiesValue = BigDecimal.ZERO;
            BigDecimal topHoldingValue = BigDecimal.ZERO;
            String topHoldingCode = "";
            for (Map.Entry<String, PositionAggregate> entry : analytics.positions.entrySet()) {
                int netQuantity = entry.getValue().buyQuantity - entry.getValue().sellQuantity;
                if (netQuantity <= 0) {
                    continue;
                }
                BigDecimal stockValue = mockDataService.getCurrentPrice(entry.getKey())
                        .multiply(new BigDecimal(netQuantity))
                        .setScale(2, RoundingMode.HALF_UP);
                securitiesValue = securitiesValue.add(stockValue);
                if (stockValue.compareTo(topHoldingValue) > 0) {
                    topHoldingValue = stockValue;
                    topHoldingCode = entry.getKey();
                }
            }
            analytics.securitiesValue = securitiesValue.setScale(2, RoundingMode.HALF_UP);
            analytics.totalAssets = INITIAL_CAPITAL
                    .add(analytics.cashDelta)
                    .add(analytics.securitiesValue)
                    .setScale(2, RoundingMode.HALF_UP);
            analytics.totalChangePercent = analytics.totalAssets
                    .subtract(INITIAL_CAPITAL)
                    .divide(INITIAL_CAPITAL, 6, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(2, RoundingMode.HALF_UP);
            analytics.weeklyPerformancePercent = computeWeeklyPerformancePercent(analytics);
            analytics.rankDelta = analytics.weeklyPerformancePercent.compareTo(BigDecimal.ZERO) > 0
                    ? analytics.weeklyTradeCount
                    : (analytics.weeklyPerformancePercent.compareTo(BigDecimal.ZERO) < 0 ? -analytics.weeklyTradeCount : 0);
            analytics.topHoldingCode = topHoldingCode;
            analytics.topHoldingValue = topHoldingValue;
            bundle.totalHoldingValue = bundle.totalHoldingValue.add(analytics.securitiesValue);
        }

        List<UserAnalytics> rankingUsers = new ArrayList<UserAnalytics>(userMap.values());
        rankingUsers.sort((left, right) -> {
            int compareAsset = right.totalAssets.compareTo(left.totalAssets);
            if (compareAsset != 0) {
                return compareAsset;
            }
            if (left.registeredAt != null && right.registeredAt != null) {
                int compareRegisteredAt = left.registeredAt.compareTo(right.registeredAt);
                if (compareRegisteredAt != 0) {
                    return compareRegisteredAt;
                }
            } else if (left.registeredAt != null) {
                return -1;
            } else if (right.registeredAt != null) {
                return 1;
            }
            return left.userId.compareTo(right.userId);
        });
        for (int i = 0; i < rankingUsers.size(); i++) {
            rankingUsers.get(i).rank = i + 1;
        }

        Map<String, StockHoldingAnalytics> holdings = new HashMap<String, StockHoldingAnalytics>();
        for (UserAnalytics analytics : rankingUsers) {
            for (Map.Entry<String, PositionAggregate> entry : analytics.positions.entrySet()) {
                int netQuantity = entry.getValue().buyQuantity - entry.getValue().sellQuantity;
                if (netQuantity <= 0) {
                    continue;
                }
                StockHoldingAnalytics stockHolding = holdings.computeIfAbsent(entry.getKey(), StockHoldingAnalytics::new);
                stockHolding.holders += 1;
                BigDecimal value = mockDataService.getCurrentPrice(entry.getKey())
                        .multiply(new BigDecimal(netQuantity))
                        .setScale(2, RoundingMode.HALF_UP);
                stockHolding.holdingValue = stockHolding.holdingValue.add(value);
            }
        }

        List<StockHoldingAnalytics> topHoldings = new ArrayList<StockHoldingAnalytics>(holdings.values());
        topHoldings.sort((left, right) -> {
            int compareValue = right.holdingValue.compareTo(left.holdingValue);
            if (compareValue != 0) {
                return compareValue;
            }
            return left.stockCode.compareTo(right.stockCode);
        });
        if (topHoldings.size() > 20) {
            topHoldings = topHoldings.subList(0, 20);
        }

        List<StockLoserAnalytics> topLosers = buildTopLoserHoldings(rankingUsers);

        List<TurnoverAnalytics> topBuy = buildTopTurnover(buyTurnoverByStock);
        List<TurnoverAnalytics> topSell = buildTopTurnover(sellTurnoverByStock);

        bundle.usersById = userMap;
        bundle.rankingUsers = rankingUsers;
        bundle.totalParticipants = rankingUsers.size();
        bundle.totalHoldingValue = bundle.totalHoldingValue.setScale(2, RoundingMode.HALF_UP);
        bundle.totalTradingAmount = bundle.totalTradingAmount.setScale(2, RoundingMode.HALF_UP);
        bundle.todayTradingAmount = bundle.todayTradingAmount.setScale(2, RoundingMode.HALF_UP);
        bundle.topHoldingItems = topHoldings;
        bundle.topLoserHoldingItems = topLosers;
        bundle.topBuyTurnover = topBuy;
        bundle.topSellTurnover = topSell;
        return bundle;
    }

    private BigDecimal computeWeeklyPerformancePercent(UserAnalytics analytics) {
        BigDecimal base = analytics.weeklyBuyAmount;
        if (base.compareTo(BigDecimal.ZERO) <= 0) {
            return analytics.totalChangePercent;
        }
        return analytics.weeklySellAmount
                .subtract(analytics.weeklyBuyAmount)
                .divide(base, 6, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
    }

    private List<TurnoverAnalytics> buildTopTurnover(Map<String, BigDecimal> turnoverByStock) {
        List<TurnoverAnalytics> list = new ArrayList<TurnoverAnalytics>();
        for (Map.Entry<String, BigDecimal> entry : turnoverByStock.entrySet()) {
            TurnoverAnalytics turnover = new TurnoverAnalytics(entry.getKey());
            turnover.amount = entry.getValue().setScale(2, RoundingMode.HALF_UP);
            list.add(turnover);
        }
        list.sort((left, right) -> {
            int compareAmount = right.amount.compareTo(left.amount);
            if (compareAmount != 0) {
                return compareAmount;
            }
            return left.stockCode.compareTo(right.stockCode);
        });
        if (list.size() > 10) {
            return new ArrayList<TurnoverAnalytics>(list.subList(0, 10));
        }
        return list;
    }

    private List<StockLoserAnalytics> buildTopLoserHoldings(List<UserAnalytics> rankingUsers) {
        Map<String, StockLoserAnalytics> losers = new HashMap<String, StockLoserAnalytics>();
        for (UserAnalytics analytics : rankingUsers) {
            for (Map.Entry<String, PositionAggregate> entry : analytics.positions.entrySet()) {
                PositionAggregate aggregate = entry.getValue();
                int netQuantity = aggregate.buyQuantity - aggregate.sellQuantity;
                if (netQuantity <= 0 || aggregate.buyQuantity <= 0) {
                    continue;
                }
                BigDecimal avgCost = aggregate.buyAmount
                        .divide(new BigDecimal(aggregate.buyQuantity), 8, RoundingMode.HALF_UP);
                BigDecimal currentPrice = mockDataService.getCurrentPrice(entry.getKey());
                if (currentPrice == null || currentPrice.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }
                if (currentPrice.compareTo(avgCost) >= 0) {
                    continue;
                }

                BigDecimal loss = avgCost.subtract(currentPrice)
                        .multiply(new BigDecimal(netQuantity))
                        .setScale(2, RoundingMode.HALF_UP);
                if (loss.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                StockLoserAnalytics loser = losers.computeIfAbsent(entry.getKey(), StockLoserAnalytics::new);
                loser.holders += 1;
                loser.lossAmount = loser.lossAmount.add(loss).setScale(2, RoundingMode.HALF_UP);
            }
        }

        List<StockLoserAnalytics> topLosers = new ArrayList<StockLoserAnalytics>(losers.values());
        topLosers.sort((left, right) -> {
            int compareLoss = right.lossAmount.compareTo(left.lossAmount);
            if (compareLoss != 0) {
                return compareLoss;
            }
            return left.stockCode.compareTo(right.stockCode);
        });
        if (topLosers.size() > 20) {
            return new ArrayList<StockLoserAnalytics>(topLosers.subList(0, 20));
        }
        return topLosers;
    }

    private String buildRecentTradeText(UserAnalytics participant, String language) {
        if (participant.latestTradeCode == null || participant.latestTradeCode.isEmpty()) {
            return text(language, "暫無交易", "暂无交易", "No recent trades");
        }
        String action = participant.latestTradeType == TYPE_SELL
                ? text(language, "賣出", "卖出", "Sell")
                : text(language, "買入", "买入", "Buy");
        return action + " " + participant.latestTradeCode + " " + mockDataService.getStockName(participant.latestTradeCode, language);
    }

    private String buildStarTag(int rank, String language) {
        if (rank <= 1) {
            return text(language, "本周冠軍", "本周冠军", "Weekly Champion");
        }
        if (rank == 2) {
            return text(language, "亞軍參賽者", "亚军参赛者", "Runner-up");
        }
        if (rank == 3) {
            return text(language, "季軍參賽者", "季军参赛者", "3rd Place");
        }
        return text(language, "活躍參賽者", "活跃参赛者", "Active Trader");
    }

    private String movementLabel(int rankDelta) {
        if (rankDelta > 0) {
            return "UP";
        }
        if (rankDelta < 0) {
            return "DOWN";
        }
        return "SAME";
    }

    private boolean isExecutedOrder(Order order) {
        if (order == null) {
            return false;
        }
        if (resolveExecutedQuantity(order) <= 0) {
            return false;
        }
        return resolveExecutedPrice(order).compareTo(BigDecimal.ZERO) > 0;
    }

    private boolean isSameDay(LocalDateTime dateTime, LocalDate targetDay) {
        if (dateTime == null || targetDay == null) {
            return false;
        }
        return targetDay.equals(dateTime.toLocalDate());
    }

    private boolean isInDateRange(LocalDateTime dateTime, LocalDate from, LocalDate to) {
        if (dateTime == null || from == null || to == null) {
            return false;
        }
        LocalDate date = dateTime.toLocalDate();
        return !date.isBefore(from) && !date.isAfter(to);
    }

    private List<Order> listAllOrdersForAnalytics() {
        try {
            List<Order> orders = orderService.list();
            return orders == null ? new ArrayList<Order>() : orders;
        } catch (Exception ignored) {
            return new ArrayList<Order>();
        }
    }

    private String safeUser(String userId) {
        return userId == null ? "" : userId.trim();
    }

    private String safeStock(String stockCode) {
        return stockCode == null ? "" : stockCode.trim();
    }

    private String formatPercent(BigDecimal value) {
        if (value == null) {
            return "0.00%";
        }
        String sign = value.compareTo(BigDecimal.ZERO) > 0 ? "+" : "";
        return sign + value.setScale(2, RoundingMode.HALF_UP) + "%";
    }

    private Map<String, Object> buildStarTrader(String name, String tag, BigDecimal totalAssets, String topHolding) {
        Map<String, Object> item = new LinkedHashMap<String, Object>();
        item.put("name", name);
        item.put("tag", tag);
        item.put("totalAssets", totalAssets);
        item.put("topHolding", topHolding);
        return item;
    }

    private Map<String, Object> buildHoldingLeaderboardItem(
            String stockCode,
            String stockName,
            int holders,
            BigDecimal holdingValue) {
        BigDecimal currentPrice = mockDataService.getCurrentPrice(stockCode);
        BigDecimal prevClose = mockDataService.getPrevClose(stockCode);
        BigDecimal changeAmount = currentPrice.subtract(prevClose).setScale(2, RoundingMode.HALF_UP);
        BigDecimal changePercent = prevClose.compareTo(BigDecimal.ZERO) == 0
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : changeAmount.divide(prevClose, 6, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
        Map<String, Object> item = new LinkedHashMap<String, Object>();
        item.put("stockCode", stockCode);
        item.put("stockName", stockName);
        item.put("holders", holders);
        item.put("holdingValue", holdingValue);
        item.put("changeAmount", changeAmount);
        item.put("changePercent", changePercent);
        item.put("movement", changeAmount.compareTo(BigDecimal.ZERO) > 0 ? "UP" : (changeAmount.compareTo(BigDecimal.ZERO) < 0 ? "DOWN" : "SAME"));
        return item;
    }

    private Map<String, Object> buildTurnoverItem(String stockCode, String stockName, BigDecimal amount) {
        Map<String, Object> item = new LinkedHashMap<String, Object>();
        item.put("stockCode", stockCode);
        item.put("stockName", stockName);
        item.put("amount", amount);
        return item;
    }

    private Map<String, Object> buildPositionItem(String stockCode, int quantity, BigDecimal avgPrice, String language) {
        BigDecimal currentPrice = mockDataService.getCurrentPrice(stockCode);
        BigDecimal pnlAmount = currentPrice.subtract(avgPrice)
                .multiply(new BigDecimal(quantity))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal pnlPercent = currentPrice.subtract(avgPrice)
                .divide(avgPrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal referenceMarketValue = currentPrice.multiply(new BigDecimal(quantity)).setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> item = new LinkedHashMap<String, Object>();
        item.put("stockCode", stockCode);
        item.put("stockName", mockDataService.getStockName(stockCode, language));
        item.put("quantity", quantity);
        item.put("tradableQuantity", quantity);
        item.put("frozenQuantity", 0);
        item.put("transitQuantity", 0);
        item.put("averagePrice", avgPrice);
        item.put("currentPrice", currentPrice);
        item.put("pnlAmount", pnlAmount);
        item.put("pnlPercent", pnlPercent);
        item.put("referenceMarketValue", referenceMarketValue);
        return item;
    }

    private List<Map<String, Object>> buildDefaultPositionItems(String language) {
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        items.add(buildPositionItem("00700", 1000, new BigDecimal("323.40"), language));
        items.add(buildPositionItem("02800", 2000, new BigDecimal("19.20"), language));
        return items;
    }

    private List<Map<String, Object>> buildPositionItemsFromFilledOrders(String userId, String language) {
        if (accountLedgerService != null) {
            Map<String, AccountLedgerService.PositionSnapshot> snapshots = accountLedgerService.getPositionSnapshots(userId);
            if (snapshots != null && !snapshots.isEmpty()) {
                List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
                for (AccountLedgerService.PositionSnapshot snapshot : snapshots.values()) {
                    if (snapshot == null || snapshot.getTotalQuantity() <= 0) {
                        continue;
                    }
                    BigDecimal currentPrice = mockDataService.getCurrentPrice(snapshot.getStockCode());
                    BigDecimal avgPrice = snapshot.getAverageCost() == null ? BigDecimal.ZERO : snapshot.getAverageCost();
                    int quantity = snapshot.getTotalQuantity();
                    BigDecimal pnlAmount = currentPrice.subtract(avgPrice)
                            .multiply(new BigDecimal(quantity))
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal pnlPercent = avgPrice.compareTo(BigDecimal.ZERO) == 0
                            ? BigDecimal.ZERO
                            : currentPrice.subtract(avgPrice)
                            .divide(avgPrice, 4, RoundingMode.HALF_UP)
                            .multiply(new BigDecimal("100"))
                            .setScale(2, RoundingMode.HALF_UP);
                    BigDecimal referenceMarketValue = currentPrice.multiply(new BigDecimal(quantity)).setScale(2, RoundingMode.HALF_UP);

                    Map<String, Object> item = new LinkedHashMap<String, Object>();
                    item.put("stockCode", snapshot.getStockCode());
                    item.put("stockName", mockDataService.getStockName(snapshot.getStockCode(), language));
                    item.put("quantity", quantity);
                    item.put("tradableQuantity", snapshot.getTradableQuantity());
                    item.put("frozenQuantity", snapshot.getFrozenQuantity());
                    item.put("transitQuantity", snapshot.getTransitQuantity());
                    item.put("averagePrice", avgPrice.setScale(3, RoundingMode.HALF_UP));
                    item.put("currentPrice", currentPrice);
                    item.put("pnlAmount", pnlAmount);
                    item.put("pnlPercent", pnlPercent);
                    item.put("referenceMarketValue", referenceMarketValue);
                    items.add(item);
                }
                items.sort(Comparator.comparing(item -> String.valueOf(item.get("stockCode"))));
                return items;
            }
        }

        List<Order> historyOrders = orderService.listHistoryOrders(userId, null, null);
        if (historyOrders == null) {
            historyOrders = new ArrayList<Order>();
        }
        Map<String, PositionAggregate> aggregateMap = new LinkedHashMap<String, PositionAggregate>();

        for (Order order : historyOrders) {
            if (order == null || !isExecutedOrder(order)) {
                continue;
            }
            String stockCode = order.getStockCode();
            if (stockCode == null || stockCode.trim().isEmpty()) {
                continue;
            }
            int executedQuantity = resolveExecutedQuantity(order);
            if (executedQuantity <= 0) {
                continue;
            }
            BigDecimal executedPrice = resolveExecutedPrice(order);

            PositionAggregate aggregate = aggregateMap.computeIfAbsent(stockCode, key -> new PositionAggregate());
            if (safeType(order.getType()) == 1) {
                aggregate.buyQuantity += executedQuantity;
                aggregate.buyAmount = aggregate.buyAmount.add(
                        executedPrice.multiply(new BigDecimal(executedQuantity))
                );
            } else {
                aggregate.sellQuantity += executedQuantity;
            }
        }

        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (Map.Entry<String, PositionAggregate> entry : aggregateMap.entrySet()) {
            PositionAggregate aggregate = entry.getValue();
            int netQuantity = aggregate.buyQuantity - aggregate.sellQuantity;
            if (netQuantity <= 0 || aggregate.buyQuantity <= 0) {
                continue;
            }
            BigDecimal avgPrice = aggregate.buyAmount
                    .divide(new BigDecimal(aggregate.buyQuantity), 4, RoundingMode.HALF_UP)
                    .setScale(3, RoundingMode.HALF_UP);
            items.add(buildPositionItem(entry.getKey(), netQuantity, avgPrice, language));
        }

        items.sort(Comparator.comparing(item -> String.valueOf(item.get("stockCode"))));
        return items;
    }

    private int resolveExecutedQuantity(Order order) {
        int filledQuantity = order.getFilledQuantity() == null ? 0 : order.getFilledQuantity();
        if (filledQuantity > 0) {
            return filledQuantity;
        }
        if (Integer.valueOf(2).equals(order.getStatus())) {
            return order.getQuantity() == null ? 0 : order.getQuantity();
        }
        return 0;
    }

    private BigDecimal resolveExecutedPrice(Order order) {
        BigDecimal filledAvgPrice = order.getFilledAvgPrice();
        if (filledAvgPrice != null && filledAvgPrice.compareTo(BigDecimal.ZERO) > 0) {
            return filledAvgPrice;
        }
        return order.getPrice() == null ? BigDecimal.ZERO : order.getPrice();
    }

    private static class PositionAggregate {
        private int buyQuantity = 0;
        private int sellQuantity = 0;
        private BigDecimal buyAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    private static class UserAnalytics {
        private final String userId;
        private final Map<String, PositionAggregate> positions = new LinkedHashMap<String, PositionAggregate>();
        private LocalDateTime registeredAt;
        private BigDecimal cashDelta = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private int tradeCount = 0;
        private int weeklyTradeCount = 0;
        private BigDecimal weeklyBuyAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private BigDecimal weeklySellAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private BigDecimal securitiesValue = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private BigDecimal totalAssets = INITIAL_CAPITAL;
        private BigDecimal totalChangePercent = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private BigDecimal weeklyPerformancePercent = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private int rank = 0;
        private int rankDelta = 0;
        private String topHoldingCode = "";
        private BigDecimal topHoldingValue = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private String latestTradeCode;
        private int latestTradeType = TYPE_BUY;
        private LocalDateTime latestTradeTime;

        private UserAnalytics(String userId) {
            this.userId = userId == null ? "" : userId;
        }
    }

    private static class TurnoverAnalytics {
        private final String stockCode;
        private BigDecimal amount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        private TurnoverAnalytics(String stockCode) {
            this.stockCode = stockCode == null ? "" : stockCode;
        }
    }

    private static class StockHoldingAnalytics {
        private final String stockCode;
        private int holders = 0;
        private BigDecimal holdingValue = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        private StockHoldingAnalytics(String stockCode) {
            this.stockCode = stockCode == null ? "" : stockCode;
        }
    }

    private static class StockLoserAnalytics {
        private final String stockCode;
        private int holders = 0;
        private BigDecimal lossAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        private StockLoserAnalytics(String stockCode) {
            this.stockCode = stockCode == null ? "" : stockCode;
        }
    }

    private static class AnalyticsBundle {
        private Map<String, UserAnalytics> usersById = new LinkedHashMap<String, UserAnalytics>();
        private List<UserAnalytics> rankingUsers = new ArrayList<UserAnalytics>();
        private List<StockHoldingAnalytics> topHoldingItems = new ArrayList<StockHoldingAnalytics>();
        private List<StockLoserAnalytics> topLoserHoldingItems = new ArrayList<StockLoserAnalytics>();
        private List<TurnoverAnalytics> topBuyTurnover = new ArrayList<TurnoverAnalytics>();
        private List<TurnoverAnalytics> topSellTurnover = new ArrayList<TurnoverAnalytics>();
        private int totalParticipants = 0;
        private BigDecimal totalHoldingValue = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private BigDecimal totalTradingAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private int totalTradingCount = 0;
        private BigDecimal todayTradingAmount = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        private int todayTradingCount = 0;
    }

    private int safeType(Integer type) {
        return type == null ? 1 : type;
    }

    private void processSettlementNow() {
        if (accountLedgerService != null) {
            accountLedgerService.processSettlements(LocalDateTime.now(HK_ZONE).toLocalDate());
        }
    }

    private String nowInHkOffset() {
        return LocalDateTime.now(HK_ZONE).atZone(HK_ZONE).format(OFFSET_TIME_FORMATTER);
    }

    private BigDecimal resolveCurrentPrice(String stockCode, MarketDataRealtimeService.QuoteSnapshot realtime) {
        if (realtime == null) {
            return mockDataService.getCurrentPrice(stockCode);
        }
        if (realtime.getNominalPrice() != null && realtime.getNominalPrice().compareTo(BigDecimal.ZERO) > 0) {
            return realtime.getNominalPrice();
        }
        if (realtime.getLastPrice() != null && realtime.getLastPrice().compareTo(BigDecimal.ZERO) > 0) {
            return realtime.getLastPrice();
        }
        BigDecimal bestBid = resolveBestBid(realtime, null);
        BigDecimal bestAsk = resolveBestAsk(realtime, null);
        if (bestBid != null && bestAsk != null) {
            return bestBid.add(bestAsk).divide(new BigDecimal("2"), 4, RoundingMode.HALF_UP);
        }
        if (bestBid != null) {
            return bestBid;
        }
        if (bestAsk != null) {
            return bestAsk;
        }
        return mockDataService.getCurrentPrice(stockCode);
    }

    private BigDecimal resolveBestBid(MarketDataRealtimeService.QuoteSnapshot realtime, BigDecimal fallback) {
        if (realtime != null && realtime.getBids() != null && !realtime.getBids().isEmpty()) {
            return realtime.getBids().get(0).getPrice();
        }
        return fallback;
    }

    private BigDecimal resolveBestAsk(MarketDataRealtimeService.QuoteSnapshot realtime, BigDecimal fallback) {
        if (realtime != null && realtime.getAsks() != null && !realtime.getAsks().isEmpty()) {
            return realtime.getAsks().get(0).getPrice();
        }
        return fallback;
    }

    private Map<String, Object> buildOrderBook(MarketDataRealtimeService.QuoteSnapshot realtime,
                                               BigDecimal bidPrice,
                                               BigDecimal askPrice,
                                               BigDecimal tickSize) {
        Map<String, Object> orderBook = new LinkedHashMap<String, Object>();
        List<Map<String, Object>> bids = new ArrayList<Map<String, Object>>();
        List<Map<String, Object>> asks = new ArrayList<Map<String, Object>>();

        if (realtime != null && realtime.getBids() != null && !realtime.getBids().isEmpty()) {
            for (MarketDataRealtimeService.DepthLevel level : realtime.getBids()) {
                Map<String, Object> item = new LinkedHashMap<String, Object>();
                item.put("price", level.getPrice());
                item.put("volume", level.getVolume());
                bids.add(item);
            }
        } else if (bidPrice != null && tickSize != null) {
            for (int i = 0; i < 5; i++) {
                Map<String, Object> item = new LinkedHashMap<String, Object>();
                item.put("price", bidPrice.subtract(tickSize.multiply(new BigDecimal(i))));
                item.put("volume", Math.max(0, 3000 - i * 400));
                bids.add(item);
            }
        }

        if (realtime != null && realtime.getAsks() != null && !realtime.getAsks().isEmpty()) {
            for (MarketDataRealtimeService.DepthLevel level : realtime.getAsks()) {
                Map<String, Object> item = new LinkedHashMap<String, Object>();
                item.put("price", level.getPrice());
                item.put("volume", level.getVolume());
                asks.add(item);
            }
        } else if (askPrice != null && tickSize != null) {
            for (int i = 0; i < 5; i++) {
                Map<String, Object> item = new LinkedHashMap<String, Object>();
                item.put("price", askPrice.add(tickSize.multiply(new BigDecimal(i))));
                item.put("volume", Math.max(0, 2800 - i * 360));
                asks.add(item);
            }
        }
        orderBook.put("bids", bids);
        orderBook.put("asks", asks);
        orderBook.put("sequence", realtime == null ? 0 : realtime.getSequence());
        return orderBook;
    }

    private String formatQuoteUpdatedAt(MarketDataRealtimeService.QuoteSnapshot realtime) {
        if (realtime == null || realtime.getUpdatedAt() == null) {
            return nowInHkOffset();
        }
        return formatDateTime(realtime.getUpdatedAt());
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.atZone(HK_ZONE).format(OFFSET_TIME_FORMATTER);
    }

    private String text(String language, String zhHant, String zhHans, String en) {
        return LanguageSupport.text(language, zhHant, zhHans, en);
    }

    private AccountAssetSnapshot calculateAccountAssetSnapshot(String userId, List<Map<String, Object>> positions) {
        BigDecimal securitiesMarketValue = BigDecimal.ZERO;
        for (Map<String, Object> item : positions) {
            Object value = item.get("referenceMarketValue");
            if (value instanceof BigDecimal) {
                securitiesMarketValue = securitiesMarketValue.add((BigDecimal) value);
            }
        }
        securitiesMarketValue = securitiesMarketValue.setScale(2, RoundingMode.HALF_UP);

        AccountLedgerService.AccountSnapshot accountSnapshot = accountLedgerService == null
                ? null
                : accountLedgerService.getAccountSnapshot(userId);
        BigDecimal cashAvailable = accountSnapshot == null
                ? INITIAL_CAPITAL.subtract(securitiesMarketValue).setScale(2, RoundingMode.HALF_UP)
                : normalizeMoney(accountSnapshot.getAvailableCash());
        BigDecimal frozenCash = accountSnapshot == null
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : normalizeMoney(accountSnapshot.getFrozenCash());
        BigDecimal transitCash = accountSnapshot == null
                ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                : normalizeMoney(accountSnapshot.getTransitCash());
        BigDecimal totalAssets = securitiesMarketValue
                .add(cashAvailable)
                .add(frozenCash)
                .add(transitCash)
                .setScale(2, RoundingMode.HALF_UP);
        return new AccountAssetSnapshot(securitiesMarketValue, cashAvailable, frozenCash, transitCash, totalAssets);
    }

    private BigDecimal normalizeMoney(BigDecimal amount) {
        if (amount == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        return amount.setScale(2, RoundingMode.HALF_UP);
    }

    private int resolveTrendDays(String range) {
        if ("30d".equalsIgnoreCase(range)) {
            return 30;
        }
        return 7;
    }

    private BigDecimal interpolateAssetPoint(BigDecimal start, BigDecimal end, int index, int totalPoints) {
        if (totalPoints <= 1) {
            return end.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal ratio = new BigDecimal(index)
                .divide(new BigDecimal(totalPoints - 1), 6, RoundingMode.HALF_UP);
        return start.add(end.subtract(start).multiply(ratio)).setScale(2, RoundingMode.HALF_UP);
    }

    private static class AccountAssetSnapshot {
        private final BigDecimal securitiesMarketValue;
        private final BigDecimal cashAvailable;
        private final BigDecimal frozenCash;
        private final BigDecimal transitCash;
        private final BigDecimal totalAssets;

        private AccountAssetSnapshot(BigDecimal securitiesMarketValue,
                                     BigDecimal cashAvailable,
                                     BigDecimal frozenCash,
                                     BigDecimal transitCash,
                                     BigDecimal totalAssets) {
            this.securitiesMarketValue = securitiesMarketValue;
            this.cashAvailable = cashAvailable;
            this.frozenCash = frozenCash;
            this.transitCash = transitCash;
            this.totalAssets = totalAssets;
        }
    }
}
