package com.simtrade.backend.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.simtrade.backend.dto.OrderRequest;
import com.simtrade.backend.dto.TradeOrderCreateRequest;
import com.simtrade.backend.dto.TradeOrderPreviewResult;
import com.simtrade.backend.dto.TradeOrderSubmitResult;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.service.FeeCalculator;
import com.simtrade.backend.mapper.OrderMapper;
import com.simtrade.backend.service.MockDataService;
import com.simtrade.backend.service.OrderService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.DayOfWeek;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

@Slf4j
@Service
public class OrderServiceImpl extends ServiceImpl<OrderMapper, Order> implements OrderService {

    private static final int TYPE_BUY = 1;
    private static final int TYPE_SELL = 2;

    private static final int STATUS_PENDING = 0;
    private static final int STATUS_PARTIAL_FILLED = 1;
    private static final int STATUS_FILLED = 2;
    private static final int STATUS_CANCELED = 3;
    private static final int MAX_PENDING_LIMIT_ORDERS = 5;
    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");
    private static final LocalTime MORNING_OPEN = LocalTime.of(9, 30);
    private static final LocalTime MORNING_CLOSE = LocalTime.of(12, 0);
    private static final LocalTime AFTERNOON_OPEN = LocalTime.of(13, 0);
    private static final LocalTime MARKET_CLOSE = LocalTime.of(16, 0);

    private final ConcurrentMap<String, Order> localOrderStore = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, String> orderTypeStore = new ConcurrentHashMap<>();
    private Clock tradingClock = Clock.system(HK_ZONE);

    @Autowired
    private MockDataService mockDataService;

    @Autowired
    private FeeCalculator feeCalculator;

    @Override
    @Transactional(rollbackFor = Exception.class)
    public String placeOrder(OrderRequest request) {
        TradeOrderCreateRequest v1Request = new TradeOrderCreateRequest();
        v1Request.setStockCode(request.getStockCode());
        v1Request.setDirection(request.getType() != null && request.getType() == TYPE_BUY ? "BUY" : "SELL");
        v1Request.setOrderType("LIMIT");
        v1Request.setPrice(request.getPrice());
        v1Request.setQuantity(request.getQuantity());
        return placeOrderV1(request.getUserId(), v1Request).getOrderId();
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TradeOrderSubmitResult placeOrderV1(String userId, TradeOrderCreateRequest request) {
        ValidationContext context = validateAndBuildContext(userId, request);
        Order order = buildPendingOrder(
                userId,
                context.stockCode,
                context.type,
                context.effectivePrice,
                context.quantity
        );
        try {
            this.save(order);
        } catch (Exception e) {
            log.warn("Persist order failed, fallback to in-memory only. orderId={}, reason={}",
                    order.getId(), e.getMessage());
        }
        saveToLocalStore(order, context.orderType);

        TradeOrderSubmitResult result = new TradeOrderSubmitResult();
        result.setOrderId(order.getId());
        result.setStatus("PENDING");
        result.setTradableNow(context.tradableNow);
        result.setValidityType(context.validityType);
        result.setValidUntil(context.validUntil);
        result.setValidityNote(context.validityNote);
        result.setSuccessActions(Arrays.asList(
                "VIEW_ACTIVE_ORDERS",
                "TRADE_AGAIN",
                "OPEN_QUOTE",
                "BACK_HOME"
        ));
        return result;
    }

    @Override
    public TradeOrderPreviewResult previewOrderV1(String userId, TradeOrderCreateRequest request) {
        ValidationContext context = validateAndBuildContext(userId, request);
        boolean isBuy = context.type == TYPE_BUY;
        BigDecimal estimatedAmount = context.effectivePrice
                .multiply(new BigDecimal(context.quantity))
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal estimatedFee = feeCalculator.calculateTotalFee(
                estimatedAmount,
                isBuy,
                context.lots
        );

        TradeOrderPreviewResult preview = new TradeOrderPreviewResult();
        preview.setStockCode(context.stockCode);
        preview.setStockName(mockDataService.getStockName(context.stockCode));
        preview.setDirection(context.direction);
        preview.setOrderType(context.orderType);
        preview.setPrice(context.effectivePrice);
        preview.setQuantity(context.quantity);
        preview.setLots(context.lots);
        preview.setEstimatedAmount(estimatedAmount);
        preview.setEstimatedFee(estimatedFee);
        preview.setEstimatedTotalCost(estimatedAmount.add(estimatedFee));
        preview.setEstimatedNetProceeds(estimatedAmount.subtract(estimatedFee));
        preview.setCurrentPrice(context.currentPrice);
        preview.setTickSize(context.tickSize);
        preview.setLimitPriceMin(context.limitPriceMin);
        preview.setLimitPriceMax(context.limitPriceMax);
        preview.setTradableNow(context.tradableNow);
        preview.setValidityType(context.validityType);
        preview.setValidUntil(context.validUntil);
        preview.setValidityNote(context.validityNote);
        preview.setSuccessActions(Arrays.asList("SUBMIT_ORDER", "EDIT_ORDER", "CANCEL"));
        return preview;
    }

    @Override
    public long countTodayBuyOrders(String userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long dbCount = 0;
        try {
            dbCount = this.count(new QueryWrapper<Order>()
                    .eq("user_id", userId)
                    .eq("type", TYPE_BUY)
                    .ge("create_time", startOfDay));
        } catch (Exception e) {
            log.warn("Count buy orders from db failed, fallback to in-memory only. reason={}", e.getMessage());
        }

        long localCount = localOrderStore.values().stream()
                .filter(order -> userId.equals(order.getUserId()))
                .filter(order -> TYPE_BUY == safeInt(order.getType()))
                .filter(order -> order.getCreateTime() != null && !order.getCreateTime().isBefore(startOfDay))
                .count();

        if (dbCount <= 0) {
            return localCount;
        }
        return Math.max(dbCount, localCount);
    }

    @Override
    public List<Order> listActiveOrders(String userId, String status) {
        List<Order> orders = listOrdersByUser(userId);

        if ("FILLED".equalsIgnoreCase(status)) {
            return orders.stream()
                    .filter(order -> safeInt(order.getStatus()) == STATUS_FILLED)
                    .collect(Collectors.toList());
        }

        return orders.stream()
                .filter(order -> safeInt(order.getStatus()) == STATUS_PENDING
                        || safeInt(order.getStatus()) == STATUS_PARTIAL_FILLED)
                .collect(Collectors.toList());
    }

    @Override
    public List<Order> listHistoryOrders(String userId, LocalDate dateFrom, LocalDate dateTo) {
        List<Order> orders = listOrdersByUser(userId);
        return orders.stream()
                .filter(order -> safeInt(order.getStatus()) == STATUS_FILLED
                        || safeInt(order.getStatus()) == STATUS_CANCELED)
                .filter(order -> matchDateRange(order, dateFrom, dateTo))
                .collect(Collectors.toList());
    }

    @Override
    public Order getOrderDetail(String userId, String orderId) {
        Order order = getOrderByIdOrNull(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found");
        }
        if (order.getUserId() != null && !userId.equals(order.getUserId())) {
            throw new IllegalArgumentException("Order not found");
        }
        return cloneOrder(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order cancelOrder(String userId, String orderId) {
        Order order = getOrderDetail(userId, orderId);
        int status = safeInt(order.getStatus());
        if (status != STATUS_PENDING && status != STATUS_PARTIAL_FILLED) {
            throw new IllegalArgumentException("Order is not cancelable");
        }

        order.setStatus(STATUS_CANCELED);
        order.setUpdateTime(LocalDateTime.now());
        try {
            this.updateById(order);
        } catch (Exception e) {
            log.warn("Cancel order db update failed, fallback to in-memory only. orderId={}, reason={}",
                    orderId, e.getMessage());
        }
        saveToLocalStore(order, getOrderType(orderId));
        return cloneOrder(order);
    }

    @Override
    public String getOrderType(String orderId) {
        return orderTypeStore.getOrDefault(orderId, "LIMIT");
    }

    private ValidationContext validateAndBuildContext(String userId, TradeOrderCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null.");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be blank.");
        }

        String stockCode = request.getStockCode();
        if (stockCode == null || stockCode.trim().isEmpty()) {
            throw new IllegalArgumentException("Stock code cannot be blank.");
        }

        int type = parseDirection(request.getDirection());
        String direction = type == TYPE_BUY ? "BUY" : "SELL";
        String orderType = normalizeOrderType(request.getOrderType());

        BigDecimal currentPrice = mockDataService.getCurrentPrice(stockCode);
        BigDecimal tickSize = mockDataService.getTickSize(currentPrice);
        BigDecimal limitPriceMin = currentPrice.subtract(tickSize.multiply(new BigDecimal("20")));
        BigDecimal limitPriceMax = currentPrice.add(tickSize.multiply(new BigDecimal("20")));

        BigDecimal effectivePrice = "MARKET".equals(orderType) ? currentPrice : request.getPrice();
        Integer quantity = request.getQuantity();
        if ("LIMIT".equals(orderType) && effectivePrice == null) {
            throw new IllegalArgumentException("Price is required for LIMIT order.");
        }
        if (effectivePrice == null) {
            throw new IllegalArgumentException("Price cannot be null.");
        }
        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0.");
        }
        if (!mockDataService.isSupportedStock(stockCode)) {
            throw new IllegalArgumentException("Stock is not tradable in the whitelist pool.");
        }
        if (mockDataService.isSuspended(stockCode)) {
            throw new IllegalArgumentException("Stock is suspended. Only cancellation is allowed.");
        }

        TradingWindowContext tradingWindowContext = resolveTradingWindow(orderType);
        validateTradingWindow(orderType, tradingWindowContext);
        validatePriceFloor(type, effectivePrice);
        validateLotSize(stockCode, quantity);
        if ("LIMIT".equals(orderType)) {
            validatePriceRange(effectivePrice, limitPriceMin, limitPriceMax);
        }
        validateDailyBuyLimit(userId, type);
        validateLimitQueueLimit(userId, orderType);

        int lotSize = mockDataService.getLotSize(stockCode);
        int lots = Math.max(1, quantity / Math.max(1, lotSize));

        ValidationContext context = new ValidationContext();
        context.stockCode = stockCode;
        context.type = type;
        context.direction = direction;
        context.orderType = orderType;
        context.quantity = quantity;
        context.effectivePrice = effectivePrice;
        context.currentPrice = currentPrice;
        context.tickSize = tickSize;
        context.limitPriceMin = limitPriceMin;
        context.limitPriceMax = limitPriceMax;
        context.lots = lots;
        context.tradableNow = tradingWindowContext.tradableNow;
        context.validityType = tradingWindowContext.validityType;
        context.validUntil = tradingWindowContext.validUntil;
        context.validityNote = tradingWindowContext.validityNote;
        return context;
    }

    private void validatePriceFloor(int type, BigDecimal price) {
        if (type == TYPE_BUY && price.compareTo(new BigDecimal("0.05")) < 0) {
            throw new IllegalArgumentException("Buy price cannot be lower than HK$0.05.");
        }
        if (type == TYPE_SELL && price.compareTo(new BigDecimal("0.01")) < 0) {
            throw new IllegalArgumentException("Sell price cannot be lower than HK$0.01.");
        }
    }

    private void validateLotSize(String stockCode, Integer quantity) {
        Integer lotSize = mockDataService.getLotSize(stockCode);
        if (quantity % lotSize != 0) {
            throw new IllegalArgumentException("Quantity must be a multiple of lot size: " + lotSize);
        }
    }

    private void validatePriceRange(BigDecimal price, BigDecimal minPrice, BigDecimal maxPrice) {
        if (price.compareTo(maxPrice) > 0 || price.compareTo(minPrice) < 0) {
            throw new IllegalArgumentException("Price exceeds ±20 ticks limit. Allowed range: ["
                    + minPrice + ", " + maxPrice + "]");
        }
    }

    private void validateDailyBuyLimit(String userId, int type) {
        if (type == TYPE_BUY && countTodayBuyOrders(userId) >= 20) {
            throw new IllegalArgumentException("Exceeded maximum of 20 buy orders per day.");
        }
    }

    private void validateLimitQueueLimit(String userId, String orderType) {
        if (!"LIMIT".equals(orderType)) {
            return;
        }
        if (countPendingLimitOrders(userId) >= MAX_PENDING_LIMIT_ORDERS) {
            throw new IllegalArgumentException("Exceeded maximum of 5 pending LIMIT orders.");
        }
    }

    private long countPendingLimitOrders(String userId) {
        return listOrdersByUser(userId).stream()
                .filter(order -> isPendingStatus(order.getStatus()))
                .filter(this::isLimitOrder)
                .count();
    }

    private boolean isPendingStatus(Integer status) {
        int safeStatus = safeInt(status);
        return safeStatus == STATUS_PENDING || safeStatus == STATUS_PARTIAL_FILLED;
    }

    private boolean isLimitOrder(Order order) {
        return "LIMIT".equalsIgnoreCase(getOrderType(order.getId()));
    }

    private void validateTradingWindow(String orderType, TradingWindowContext tradingWindowContext) {
        if ("MARKET".equals(orderType) && !tradingWindowContext.tradableNow) {
            throw new IllegalArgumentException("Market orders are only accepted during trading hours "
                    + "(09:30-12:00, 13:00-16:00 HKT). Please use LIMIT order outside trading hours.");
        }
    }

    private TradingWindowContext resolveTradingWindow(String orderType) {
        ZonedDateTime now = ZonedDateTime.now(tradingClock).withZoneSameInstant(HK_ZONE);
        boolean tradableNow = isTradingSession(now);

        TradingWindowContext context = new TradingWindowContext();
        context.tradableNow = tradableNow;
        if (!"LIMIT".equals(orderType)) {
            context.validityType = "IMMEDIATE";
            context.validUntil = null;
            context.validityNote = tradableNow
                    ? "Market order will be executed immediately at the current market price."
                    : "Market order is unavailable outside trading hours.";
            return context;
        }

        ZonedDateTime validUntil = resolveLimitOrderValidUntil(now, tradableNow);
        boolean currentDayClose = now.toLocalDate().equals(validUntil.toLocalDate());
        context.validityType = currentDayClose ? "DAY_CLOSE" : "NEXT_TRADING_DAY_CLOSE";
        context.validUntil = validUntil.toOffsetDateTime().toString();
        context.validityNote = currentDayClose
                ? "Limit order remains active until today's market close (16:00 HKT)."
                : "Limit order submitted outside trading hours remains active until next trading day close (16:00 HKT).";
        return context;
    }

    private ZonedDateTime resolveLimitOrderValidUntil(ZonedDateTime now, boolean tradableNow) {
        if (tradableNow || shouldExpireAtCurrentDayClose(now)) {
            return marketCloseAt(now.toLocalDate());
        }
        LocalDate nextTradingDate = nextTradingDay(now.toLocalDate().plusDays(1));
        return marketCloseAt(nextTradingDate);
    }

    private boolean shouldExpireAtCurrentDayClose(ZonedDateTime now) {
        return isTradingDay(now.toLocalDate()) && now.toLocalTime().isBefore(MARKET_CLOSE);
    }

    private ZonedDateTime marketCloseAt(LocalDate date) {
        return date.atTime(MARKET_CLOSE).atZone(HK_ZONE);
    }

    private LocalDate nextTradingDay(LocalDate date) {
        LocalDate current = date;
        while (!isTradingDay(current)) {
            current = current.plusDays(1);
        }
        return current;
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
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
    }

    private List<Order> listOrdersByUser(String userId) {
        Map<String, Order> merged = new HashMap<>();
        try {
            List<Order> dbOrders = this.list(new QueryWrapper<Order>().eq("user_id", userId));
            if (dbOrders != null) {
                for (Order order : dbOrders) {
                    merged.put(order.getId(), cloneOrder(order));
                }
            }
        } catch (Exception e) {
            log.warn("List orders from db failed, fallback to in-memory only. reason={}", e.getMessage());
        }

        for (Order order : localOrderStore.values()) {
            if (userId.equals(order.getUserId())) {
                merged.put(order.getId(), cloneOrder(order));
            }
        }

        List<Order> result = new ArrayList<Order>(merged.values());
        result.sort(Comparator.comparing(Order::getCreateTime, Comparator.nullsLast(LocalDateTime::compareTo)).reversed());
        return result;
    }

    private boolean matchDateRange(Order order, LocalDate dateFrom, LocalDate dateTo) {
        if (order.getCreateTime() == null) {
            return false;
        }
        LocalDate date = order.getCreateTime().toLocalDate();
        if (dateFrom != null && date.isBefore(dateFrom)) {
            return false;
        }
        return dateTo == null || !date.isAfter(dateTo);
    }

    private Order getOrderByIdOrNull(String orderId) {
        try {
            Order dbOrder = this.getById(orderId);
            if (dbOrder != null) {
                return dbOrder;
            }
        } catch (Exception e) {
            log.warn("Get order from db failed, fallback to in-memory only. orderId={}, reason={}",
                    orderId, e.getMessage());
        }
        return localOrderStore.get(orderId);
    }

    private void saveToLocalStore(Order order, String orderType) {
        localOrderStore.put(order.getId(), cloneOrder(order));
        if (orderType != null) {
            orderTypeStore.put(order.getId(), orderType);
        }
    }

    private int parseDirection(String direction) {
        if ("BUY".equalsIgnoreCase(direction)) {
            return TYPE_BUY;
        }
        if ("SELL".equalsIgnoreCase(direction)) {
            return TYPE_SELL;
        }
        throw new IllegalArgumentException("Direction must be BUY or SELL");
    }

    private String normalizeOrderType(String orderType) {
        if ("LIMIT".equalsIgnoreCase(orderType)) {
            return "LIMIT";
        }
        if ("MARKET".equalsIgnoreCase(orderType)) {
            return "MARKET";
        }
        throw new IllegalArgumentException("Order type must be LIMIT or MARKET");
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private Order buildPendingOrder(String userId, String stockCode, int type, BigDecimal price, int quantity) {
        LocalDateTime now = LocalDateTime.now();
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setUserId(userId);
        order.setStockCode(stockCode);
        order.setType(type);
        order.setPrice(price);
        order.setQuantity(quantity);
        order.setFilledQuantity(0);
        order.setFilledAvgPrice(BigDecimal.ZERO);
        order.setStatus(STATUS_PENDING);
        order.setCreateTime(now);
        order.setUpdateTime(now);
        return order;
    }

    private Order cloneOrder(Order source) {
        Order target = new Order();
        target.setId(source.getId());
        target.setUserId(source.getUserId());
        target.setStockCode(source.getStockCode());
        target.setType(source.getType());
        target.setPrice(source.getPrice());
        target.setQuantity(source.getQuantity());
        target.setFilledQuantity(source.getFilledQuantity());
        target.setFilledAvgPrice(source.getFilledAvgPrice());
        target.setStatus(source.getStatus());
        target.setCreateTime(source.getCreateTime());
        target.setUpdateTime(source.getUpdateTime());
        return target;
    }

    private static class ValidationContext {
        private String stockCode;
        private int type;
        private String direction;
        private String orderType;
        private BigDecimal effectivePrice;
        private Integer quantity;
        private BigDecimal currentPrice;
        private BigDecimal tickSize;
        private BigDecimal limitPriceMin;
        private BigDecimal limitPriceMax;
        private Integer lots;
        private Boolean tradableNow;
        private String validityType;
        private String validUntil;
        private String validityNote;
    }

    private static class TradingWindowContext {
        private Boolean tradableNow;
        private String validityType;
        private String validUntil;
        private String validityNote;
    }
}
