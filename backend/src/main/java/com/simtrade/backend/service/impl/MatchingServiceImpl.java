package com.simtrade.backend.service.impl;

import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.service.FeeCalculator;
import com.simtrade.backend.service.MatchingService;
import com.simtrade.backend.service.OrderService;
import com.simtrade.backend.service.TradingCalendarService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
public class MatchingServiceImpl implements MatchingService {

    private static final int TYPE_BUY = 1;
    private static final int TYPE_SELL = 2;
    private static final int STATUS_PENDING = 0;
    private static final int STATUS_PARTIAL_FILLED = 1;
    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");
    private static final LocalTime MORNING_OPEN = LocalTime.of(9, 30);
    private static final LocalTime MORNING_CLOSE = LocalTime.of(12, 0);
    private static final LocalTime AFTERNOON_OPEN = LocalTime.of(13, 0);
    private static final LocalTime MARKET_CLOSE = LocalTime.of(16, 0);

    @Autowired
    private OrderService orderService;

    @Autowired
    private FeeCalculator feeCalculator;

    @Autowired(required = false)
    private TradingCalendarService tradingCalendarService = new TradingCalendarService();

    private Clock tradingClock = Clock.system(HK_ZONE);

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void matchOrders(MarketData marketData) {
        matchOrders(marketData, false);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public void matchOrders(MarketData marketData, boolean ignoreTradingSession) {
        if (marketData == null || marketData.getStockCode() == null || marketData.getStockCode().trim().isEmpty()) {
            return;
        }

        LocalDateTime now = nowInHkDateTime();
        orderService.closeExpiredLimitOrders(now);
        if (!ignoreTradingSession && !isTradingSession(now.atZone(HK_ZONE))) {
            return;
        }

        String stockCode = marketData.getStockCode();
        List<Order> orders = orderService.listOpenOrdersByStock(stockCode);
        if (orders == null || orders.isEmpty()) {
            return;
        }

        if (hasOrderBookLiquidity(marketData)) {
            matchAgainstOrderBook(orders, marketData, now);
            return;
        }

        matchAtSinglePrice(orders, marketData, now);
    }

    private void matchAgainstOrderBook(List<Order> orders, MarketData marketData, LocalDateTime now) {
        List<OrderExecutionState> buyQueue = buildExecutionQueue(orders, TYPE_BUY);
        List<OrderExecutionState> sellQueue = buildExecutionQueue(orders, TYPE_SELL);
        if (buyQueue.isEmpty() && sellQueue.isEmpty()) {
            return;
        }

        List<MarketData.Level> asks = normalizeLevels(marketData.getAsks(), true);
        List<MarketData.Level> bids = normalizeLevels(marketData.getBids(), false);
        consumeLevels(asks, buyQueue, TYPE_BUY, now);
        consumeLevels(bids, sellQueue, TYPE_SELL, now);
    }

    private void consumeLevels(List<MarketData.Level> levels,
                               List<OrderExecutionState> queue,
                               int side,
                               LocalDateTime now) {
        if (levels.isEmpty() || queue.isEmpty()) {
            return;
        }

        for (MarketData.Level level : levels) {
            if (level == null || level.getPrice() == null || level.getVolume() == null) {
                continue;
            }
            if (level.getPrice().compareTo(BigDecimal.ZERO) <= 0 || level.getVolume() <= 0) {
                continue;
            }

            int available = level.getVolume();
            for (OrderExecutionState state : queue) {
                if (available <= 0) {
                    break;
                }
                if (state.remaining <= 0) {
                    continue;
                }
                if (!isCrossedByBookLevel(side, state.limitPrice, level.getPrice())) {
                    continue;
                }

                int requested = Math.min(available, state.remaining);
                if (requested <= 0) {
                    continue;
                }
                int beforeRemaining = state.remaining;
                Order matched = orderService.applyMatchExecution(state.orderId, level.getPrice(), requested);
                int afterRemaining = resolveRemaining(matched);
                int matchedQty = Math.max(0, beforeRemaining - afterRemaining);
                if (matchedQty <= 0) {
                    continue;
                }
                state.remaining = afterRemaining;
                available -= matchedQty;
                logMatchedTrade(matched, level.getPrice(), matchedQty, now);
            }
        }
    }

    private void matchAtSinglePrice(List<Order> orders, MarketData marketData, LocalDateTime now) {
        BigDecimal matchingPrice = resolveMatchingPrice(marketData);
        if (matchingPrice == null || matchingPrice.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Skip matching due to missing nominal price and depth. stockCode={}", marketData.getStockCode());
            return;
        }

        executeAtPrice(buildExecutionQueue(orders, TYPE_BUY), TYPE_BUY, matchingPrice, now);
        executeAtPrice(buildExecutionQueue(orders, TYPE_SELL), TYPE_SELL, matchingPrice, now);
    }

    private void executeAtPrice(List<OrderExecutionState> queue, int side, BigDecimal price, LocalDateTime now) {
        for (OrderExecutionState state : queue) {
            if (state.remaining <= 0) {
                continue;
            }
            if (!isCrossedByBookLevel(side, state.limitPrice, price)) {
                continue;
            }
            int beforeRemaining = state.remaining;
            Order matched = orderService.applyMatchExecution(state.orderId, price, state.remaining);
            int afterRemaining = resolveRemaining(matched);
            int matchedQty = Math.max(0, beforeRemaining - afterRemaining);
            if (matchedQty <= 0) {
                continue;
            }
            state.remaining = afterRemaining;
            logMatchedTrade(matched, price, matchedQty, now);
        }
    }

    private List<OrderExecutionState> buildExecutionQueue(List<Order> orders, int side) {
        if (orders == null || orders.isEmpty()) {
            return Collections.emptyList();
        }
        List<OrderExecutionState> queue = new ArrayList<OrderExecutionState>();
        for (Order order : orders) {
            if (order == null || !isPendingStatus(order.getStatus())) {
                continue;
            }
            if (safeType(order.getType()) != side) {
                continue;
            }
            int remaining = resolveRemaining(order);
            if (remaining <= 0) {
                continue;
            }
            queue.add(new OrderExecutionState(order.getId(), order.getPrice(), order.getCreateTime(), remaining));
        }
        queue.sort(priorityComparator(side));
        return queue;
    }

    private Comparator<OrderExecutionState> priorityComparator(int side) {
        return (a, b) -> {
            BigDecimal pa = a.limitPrice == null ? BigDecimal.ZERO : a.limitPrice;
            BigDecimal pb = b.limitPrice == null ? BigDecimal.ZERO : b.limitPrice;
            int priceCompare = side == TYPE_BUY ? pb.compareTo(pa) : pa.compareTo(pb);
            if (priceCompare != 0) {
                return priceCompare;
            }
            if (a.createTime != null && b.createTime != null) {
                int timeCompare = a.createTime.compareTo(b.createTime);
                if (timeCompare != 0) {
                    return timeCompare;
                }
            } else if (a.createTime == null && b.createTime != null) {
                return 1;
            } else if (a.createTime != null) {
                return -1;
            }
            return a.orderId.compareTo(b.orderId);
        };
    }

    private boolean hasOrderBookLiquidity(MarketData marketData) {
        return hasPositiveLevel(marketData.getAsks()) || hasPositiveLevel(marketData.getBids());
    }

    private boolean hasPositiveLevel(List<MarketData.Level> levels) {
        if (levels == null || levels.isEmpty()) {
            return false;
        }
        for (MarketData.Level level : levels) {
            if (level == null || level.getPrice() == null || level.getVolume() == null) {
                continue;
            }
            if (level.getPrice().compareTo(BigDecimal.ZERO) > 0 && level.getVolume() > 0) {
                return true;
            }
        }
        return false;
    }

    private List<MarketData.Level> normalizeLevels(List<MarketData.Level> levels, boolean ascending) {
        if (levels == null || levels.isEmpty()) {
            return Collections.emptyList();
        }
        List<MarketData.Level> normalized = new ArrayList<MarketData.Level>();
        for (MarketData.Level level : levels) {
            if (level == null || level.getPrice() == null || level.getVolume() == null) {
                continue;
            }
            if (level.getPrice().compareTo(BigDecimal.ZERO) <= 0 || level.getVolume() <= 0) {
                continue;
            }
            normalized.add(level);
        }
        normalized.sort(ascending
                ? Comparator.comparing(MarketData.Level::getPrice)
                : (a, b) -> b.getPrice().compareTo(a.getPrice()));
        return normalized;
    }

    private BigDecimal resolveMatchingPrice(MarketData marketData) {
        if (marketData.getNominalPrice() != null && marketData.getNominalPrice().compareTo(BigDecimal.ZERO) > 0) {
            return marketData.getNominalPrice();
        }
        if (marketData.getLastPrice() != null && marketData.getLastPrice().compareTo(BigDecimal.ZERO) > 0) {
            return marketData.getLastPrice();
        }

        BigDecimal bestAsk = findBestPrice(marketData.getAsks(), true);
        BigDecimal bestBid = findBestPrice(marketData.getBids(), false);
        if (bestAsk != null && bestBid != null) {
            return bestAsk.add(bestBid).divide(new BigDecimal("2"), 4, RoundingMode.HALF_UP);
        }
        if (bestAsk != null) {
            return bestAsk;
        }
        return bestBid;
    }

    private BigDecimal findBestPrice(List<MarketData.Level> levels, boolean ascending) {
        if (levels == null || levels.isEmpty()) {
            return null;
        }
        return levels.stream()
                .filter(level -> level != null && level.getPrice() != null && level.getPrice().compareTo(BigDecimal.ZERO) > 0)
                .map(MarketData.Level::getPrice)
                .sorted(ascending ? BigDecimal::compareTo : (a, b) -> b.compareTo(a))
                .findFirst()
                .orElse(null);
    }

    private boolean isPendingStatus(Integer status) {
        int safeStatus = status == null ? 0 : status;
        return safeStatus == STATUS_PENDING || safeStatus == STATUS_PARTIAL_FILLED;
    }

    private int safeType(Integer type) {
        return type == null ? TYPE_BUY : type;
    }

    private int resolveRemaining(Order order) {
        if (order == null) {
            return 0;
        }
        int total = order.getQuantity() == null ? 0 : order.getQuantity();
        int filled = order.getFilledQuantity() == null ? 0 : order.getFilledQuantity();
        return Math.max(0, total - filled);
    }

    private boolean isCrossedByBookLevel(int side, BigDecimal limitPrice, BigDecimal bookPrice) {
        if (bookPrice == null || bookPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return false;
        }
        if (limitPrice == null) {
            return true;
        }
        if (side == TYPE_BUY) {
            return limitPrice.compareTo(bookPrice) >= 0;
        }
        return limitPrice.compareTo(bookPrice) <= 0;
    }

    private void logMatchedTrade(Order order, BigDecimal executionPrice, int matchedQuantity, LocalDateTime now) {
        BigDecimal matchedAmount = executionPrice.multiply(new BigDecimal(matchedQuantity)).setScale(2, RoundingMode.HALF_UP);
        int lots = Math.max(1, matchedQuantity / 100);
        boolean isBuy = order.getType() != null && order.getType() == TYPE_BUY;
        BigDecimal totalFee = feeCalculator.calculateTotalFee(matchedAmount, isBuy, lots);
        LocalDate settlementDate = calculateTPlusTwo(now.toLocalDate());

        log.info("Order matched. orderId={}, stockCode={}, executionPrice={}, matchedQty={}, totalFee={}, settlementDate={}, status={}",
                order.getId(), order.getStockCode(), executionPrice, matchedQuantity, totalFee, settlementDate, order.getStatus());
    }

    private LocalDate calculateTPlusTwo(LocalDate tradeDate) {
        return tradingCalendarService.addTradingDays(tradeDate, 2);
    }

    private boolean isTradingSession(ZonedDateTime dateTime) {
        if (!isTradingDay(dateTime.toLocalDate())) {
            return false;
        }
        LocalTime time = dateTime.toLocalTime();
        boolean morningSession = !time.isBefore(MORNING_OPEN) && time.isBefore(MORNING_CLOSE);
        boolean afternoonSession = !time.isBefore(AFTERNOON_OPEN) && time.isBefore(MARKET_CLOSE);
        return morningSession || afternoonSession;
    }

    private boolean isTradingDay(LocalDate date) {
        return tradingCalendarService.isTradingDay(date);
    }

    private LocalDateTime nowInHkDateTime() {
        return ZonedDateTime.now(tradingClock).withZoneSameInstant(HK_ZONE).toLocalDateTime();
    }

    private static class OrderExecutionState {
        private final String orderId;
        private final BigDecimal limitPrice;
        private final LocalDateTime createTime;
        private int remaining;

        private OrderExecutionState(String orderId, BigDecimal limitPrice, LocalDateTime createTime, int remaining) {
            this.orderId = orderId;
            this.limitPrice = limitPrice;
            this.createTime = createTime;
            this.remaining = remaining;
        }
    }
}
