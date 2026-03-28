package com.simtrade.backend.service;

import com.simtrade.backend.entity.Order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ViewQueryService {

    private static final String DEFAULT_CURRENCY = "HKD";
    private static final BigDecimal INITIAL_CAPITAL = new BigDecimal("1000000.00");
    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");
    private static final DateTimeFormatter OFFSET_TIME_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    @Autowired
    private OrderService orderService;

    @Autowired
    private MockDataService mockDataService;

    @Autowired
    private FeeCalculator feeCalculator;

    public Map<String, Object> buildAccountProfile(String userId) {
        long dailyBuyUsed = orderService.countTodayBuyOrders(userId);
        int dailyTradesRemaining = (int) Math.max(0, 20 - dailyBuyUsed);

        BigDecimal securitiesMarketValue = new BigDecimal("513910.00");
        BigDecimal cashAvailable = new BigDecimal("379562.10");
        BigDecimal totalAssets = securitiesMarketValue.add(cashAvailable).setScale(2, RoundingMode.HALF_UP);

        Map<String, Object> profile = new LinkedHashMap<String, Object>();
        profile.put("userId", userId);
        profile.put("nickname", "Joey Cheung");
        profile.put("avatar", "https://example.com/avatar/u_10001.png");
        profile.put("currency", DEFAULT_CURRENCY);
        profile.put("rank", 91);
        profile.put("rankDelta", 12);
        profile.put("dailyTradesRemaining", dailyTradesRemaining);
        profile.put("weeklyTradesRequired", 4);
        profile.put("weeklyTradesRemaining", 2);
        profile.put("initialCapital", INITIAL_CAPITAL);
        profile.put("bonusAmount", new BigDecimal("50000.00"));
        profile.put("securitiesMarketValue", securitiesMarketValue);
        profile.put("cashAvailable", cashAvailable);
        profile.put("totalAssets", totalAssets);
        profile.put("updatedAt", nowInHkOffset());
        return profile;
    }

    public Map<String, Object> buildAccountPositions(String userId) {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("currency", DEFAULT_CURRENCY);
        response.put("updatedAt", nowInHkOffset());

        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        items.add(buildPositionItem("00700", 1000, new BigDecimal("323.40")));
        items.add(buildPositionItem("02800", 2000, new BigDecimal("19.20")));
        response.put("items", items);
        return response;
    }

    public Map<String, Object> buildHomeOverview(String userId) {
        Map<String, Object> overview = new LinkedHashMap<String, Object>();
        Map<String, Object> competition = new LinkedHashMap<String, Object>();
        competition.put("name", "智财港股投资大赛2020");
        competition.put("sponsor", "Citi");
        competition.put("currency", DEFAULT_CURRENCY);
        competition.put("updatedAt", nowInHkOffset());
        overview.put("competition", competition);

        Map<String, Object> eventStats = new LinkedHashMap<String, Object>();
        eventStats.put("participantCount", 223563);
        eventStats.put("holdingAssetValue", 9562000000L);
        eventStats.put("tradingAmount", 1105153);
        eventStats.put("tradingCount", 151586);
        overview.put("eventStats", eventStats);

        Map<String, Object> banner = new LinkedHashMap<String, Object>();
        banner.put("title", "想赚取 HK$500,000 模拟交易资金？");
        banner.put("ctaText", "查看详情");
        banner.put("linkType", "RULES");
        overview.put("banner", banner);
        overview.put("mySummary", buildAccountProfile(userId));

        Map<String, Object> starParticipant = new LinkedHashMap<String, Object>();
        starParticipant.put("tabs", Arrays.asList("青姐", "沈大师", "英sir"));
        starParticipant.put("featuredTab", "青姐");
        starParticipant.put("name", "青姐");
        starParticipant.put("tag", "独立股评人");
        starParticipant.put("advice", "今日关注港股科技与高息 ETF 配置节奏");
        starParticipant.put("totalAssets", new BigDecimal("1656735.00"));
        starParticipant.put("topHolding", "00700 腾讯控股");
        starParticipant.put("recentTrade", "买入 02800 盈富基金");
        overview.put("starParticipant", starParticipant);

        Map<String, Object> topBuy = new LinkedHashMap<String, Object>();
        topBuy.put("stockCode", "00700");
        topBuy.put("stockName", "腾讯控股");
        topBuy.put("amount", new BigDecimal("202000.00"));

        Map<String, Object> topSell = new LinkedHashMap<String, Object>();
        topSell.put("stockCode", "02800");
        topSell.put("stockName", "盈富基金");
        topSell.put("amount", new BigDecimal("181000.00"));

        Map<String, Object> topTurnoverSnapshot = new LinkedHashMap<String, Object>();
        topTurnoverSnapshot.put("topBuy", topBuy);
        topTurnoverSnapshot.put("topSell", topSell);
        overview.put("topTurnoverSnapshot", topTurnoverSnapshot);

        List<Map<String, Object>> ranking = new ArrayList<Map<String, Object>>();
        Map<String, Object> rankingTop = new LinkedHashMap<String, Object>();
        rankingTop.put("rank", 1);
        rankingTop.put("rankMovement", "SAME");
        rankingTop.put("nickname", "Mary Lee");
        rankingTop.put("totalAssets", new BigDecimal("3228531.00"));
        rankingTop.put("changePercent", new BigDecimal("93.00"));
        ranking.add(rankingTop);
        overview.put("ranking", ranking);
        return overview;
    }

    public Map<String, Object> searchTradeTargets(String keyword) {
        List<Map<String, Object>> items = mockDataService.searchStocks(keyword);
        items.sort(Comparator.comparing(item -> String.valueOf(item.get("stockCode"))));

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("keyword", keyword == null ? "" : keyword.trim());
        data.put("total", items.size());
        data.put("items", items);
        data.put("updatedAt", nowInHkOffset());
        return data;
    }

    public Map<String, Object> buildTradeQuote(String stockCode) {
        if (!mockDataService.isSupportedStock(stockCode)) {
            throw new IllegalArgumentException("Stock is not tradable in the whitelist pool.");
        }

        BigDecimal currentPrice = mockDataService.getCurrentPrice(stockCode);
        BigDecimal prevClose = mockDataService.getPrevClose(stockCode);
        BigDecimal tickSize = mockDataService.getTickSize(currentPrice);
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
        data.put("stockName", mockDataService.getStockName(stockCode));
        data.put("currency", DEFAULT_CURRENCY);
        data.put("currentPrice", currentPrice);
        data.put("prevClose", prevClose);
        data.put("changeAmount", changeAmount);
        data.put("changePercent", changePercent);
        data.put("tickSize", tickSize);
        data.put("lotSize", mockDataService.getLotSize(stockCode));
        data.put("suspended", mockDataService.isSuspended(stockCode));
        data.put("tradable", !mockDataService.isSuspended(stockCode));
        data.put("updatedAt", nowInHkOffset());
        data.put("bidPrice", currentPrice.subtract(tickSize));
        data.put("askPrice", currentPrice.add(tickSize));
        return data;
    }

    public Map<String, Object> toOrderView(Order order) {
        Map<String, Object> view = new LinkedHashMap<String, Object>();
        view.put("orderId", order.getId());
        view.put("stockCode", order.getStockCode());
        view.put("stockName", mockDataService.getStockName(order.getStockCode()));
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

    private Map<String, Object> buildPositionItem(String stockCode, int quantity, BigDecimal avgPrice) {
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
        item.put("stockName", mockDataService.getStockName(stockCode));
        item.put("quantity", quantity);
        item.put("tradableQuantity", quantity);
        item.put("averagePrice", avgPrice);
        item.put("currentPrice", currentPrice);
        item.put("pnlAmount", pnlAmount);
        item.put("pnlPercent", pnlPercent);
        item.put("referenceMarketValue", referenceMarketValue);
        return item;
    }

    private int safeType(Integer type) {
        return type == null ? 1 : type;
    }

    private String nowInHkOffset() {
        return LocalDateTime.now(HK_ZONE).atZone(HK_ZONE).format(OFFSET_TIME_FORMATTER);
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime.atZone(HK_ZONE).format(OFFSET_TIME_FORMATTER);
    }
}
