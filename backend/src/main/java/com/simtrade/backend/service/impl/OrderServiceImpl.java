package com.simtrade.backend.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.simtrade.backend.dto.OrderRequest;
import com.simtrade.backend.dto.TradeOrderAmendRequest;
import com.simtrade.backend.dto.TradeOrderCreateRequest;
import com.simtrade.backend.dto.TradeOrderPreviewResult;
import com.simtrade.backend.dto.TradeOrderSubmitResult;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.service.AccountLedgerService;
import com.simtrade.backend.service.FeeCalculator;
import com.simtrade.backend.mapper.OrderMapper;
import com.simtrade.backend.service.MockDataService;
import com.simtrade.backend.service.OrderService;
import com.simtrade.backend.service.TradingCalendarService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
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
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.TimeUnit;
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
    private static final long DUPLICATE_WINDOW_MS = 1500;
    private static final String REDIS_SUBMISSION_KEY_PREFIX = "trade:dedup:submit:";
    private static final String REDIS_IDEMPOTENCY_KEY_PREFIX = "trade:idempotency:submit:";
    private static final long IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60;
    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");
    private static final LocalTime MORNING_OPEN = LocalTime.of(9, 30);
    private static final LocalTime MORNING_CLOSE = LocalTime.of(12, 0);
    private static final LocalTime AFTERNOON_OPEN = LocalTime.of(13, 0);
    private static final LocalTime MARKET_CLOSE = LocalTime.of(16, 0);

    private final ConcurrentMap<String, Long> submissionTracker = new ConcurrentHashMap<>();
    private final ConcurrentMap<String, SubmissionIdempotencyRecord> localIdempotencyTracker = new ConcurrentHashMap<String, SubmissionIdempotencyRecord>();
    private final ConcurrentMap<String, Object> idempotencyLocks = new ConcurrentHashMap<String, Object>();
    private Clock tradingClock = Clock.system(HK_ZONE);

    @Value("${app.order.redis-strict-mode:false}")
    private boolean redisStrictMode = false;

    @Autowired
    private MockDataService mockDataService;

    @Autowired
    private FeeCalculator feeCalculator;

    @Autowired(required = false)
    private StringRedisTemplate stringRedisTemplate;

    @Autowired(required = false)
    private ObjectMapper objectMapper = new ObjectMapper();

    @Autowired(required = false)
    private AccountLedgerService accountLedgerService = new AccountLedgerService();

    @Autowired(required = false)
    private TradingCalendarService tradingCalendarService = new TradingCalendarService();

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
        return placeOrderV1(userId, request, null);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public TradeOrderSubmitResult placeOrderV1(String userId, TradeOrderCreateRequest request, String idempotencyKey) {
        String normalizedKey = normalizeIdempotencyKey(idempotencyKey);
        if (normalizedKey == null) {
            return doPlaceOrderV1(userId, request);
        }

        String redisKey = REDIS_IDEMPOTENCY_KEY_PREFIX + userId + ":" + normalizedKey;
        String requestFingerprint = buildIdempotencyFingerprint(request);
        Object lock = idempotencyLocks.computeIfAbsent(redisKey, key -> new Object());
        synchronized (lock) {
            SubmissionIdempotencyRecord existing = loadIdempotencyRecord(redisKey);
            if (existing != null) {
                ensureSamePayload(existing, requestFingerprint);
                return existing.toSubmitResult();
            }
            TradeOrderSubmitResult created = doPlaceOrderV1(userId, request);
            storeIdempotencyRecord(redisKey, SubmissionIdempotencyRecord.from(requestFingerprint, created));
            return created;
        }
    }

    private TradeOrderSubmitResult doPlaceOrderV1(String userId, TradeOrderCreateRequest request) {
        ValidationContext context = validateAndBuildContext(userId, request);
        ensureUniqueSubmission(buildSubmissionSignature(userId, context));
        Order order = buildPendingOrder(
                userId,
                context.stockCode,
                context.type,
                context.orderType,
                context.effectivePrice,
                context.quantity
        );
        applyInitialExecution(order, context);
        boolean saved = this.save(order);
        if (!saved) {
            throw new IllegalStateException("Persist order failed.");
        }
        applyLedgerAfterOrderAccepted(order, context);

        TradeOrderSubmitResult result = new TradeOrderSubmitResult();
        result.setOrderId(order.getId());
        result.setStatus(mapStatus(order.getStatus()));
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
        LocalDateTime startOfDay = LocalDate.now(tradingClock).atStartOfDay();
        return this.count(new QueryWrapper<Order>()
                .eq("user_id", userId)
                .eq("type", TYPE_BUY)
                .ge("create_time", startOfDay));
    }

    @Override
    public List<Order> listActiveOrders(String userId, String status) {
        closeExpiredLimitOrders(nowInHkDateTime());
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
        closeExpiredLimitOrders(nowInHkDateTime());
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
        order.setUpdateTime(nowInHkDateTime());
        boolean updated = this.updateById(order);
        if (!updated) {
            throw new IllegalStateException("Cancel order persistence failed.");
        }
        if (accountLedgerService != null) {
            accountLedgerService.releaseOnOrderCanceled(order, safeOrderType(order.getOrderType()));
        }
        return cloneOrder(order);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order amendOrderV1(String userId, String orderId, TradeOrderAmendRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null.");
        }

        Order order = getOrderDetail(userId, orderId);
        int status = safeInt(order.getStatus());
        if (status != STATUS_PENDING && status != STATUS_PARTIAL_FILLED) {
            throw new IllegalArgumentException("Order is not amendable");
        }
        if (!isLimitOrder(order)) {
            throw new IllegalArgumentException("Only LIMIT order can be amended");
        }

        BigDecimal currentPrice = mockDataService.getCurrentPrice(order.getStockCode());
        BigDecimal tickSize = mockDataService.getTickSize(currentPrice);
        validateLotSize(order.getStockCode(), request.getQuantity());
        validatePriceFloor(safeInt(order.getType()), request.getPrice());
        validatePriceRange(
                request.getPrice(),
                currentPrice.subtract(tickSize.multiply(new BigDecimal("20"))),
                currentPrice.add(tickSize.multiply(new BigDecimal("20")))
        );
        validateLimitQueueLimit(userId, "LIMIT", orderId);
        LocalDateTime now = nowInHkDateTime();
        Order canceledOrder = cloneOrder(order);
        canceledOrder.setStatus(STATUS_CANCELED);
        canceledOrder.setUpdateTime(now);
        boolean canceledUpdated = this.updateById(canceledOrder);
        if (!canceledUpdated) {
            throw new IllegalStateException("Cancel original order during amend failed.");
        }
        if (accountLedgerService != null) {
            accountLedgerService.releaseOnOrderCanceled(canceledOrder, safeOrderType(canceledOrder.getOrderType()));
        }

        Order amendedOrder = buildPendingOrder(
                userId,
                order.getStockCode(),
                safeInt(order.getType()),
                "LIMIT",
                request.getPrice(),
                request.getQuantity()
        );
        boolean saved = this.save(amendedOrder);
        if (!saved) {
            throw new IllegalStateException("Persist amended order failed.");
        }
        if (accountLedgerService != null) {
            int lotSize = mockDataService.getLotSize(amendedOrder.getStockCode());
            int lots = Math.max(1, amendedOrder.getQuantity() / Math.max(1, lotSize));
            BigDecimal estimateAmount = amendedOrder.getPrice()
                    .multiply(new BigDecimal(amendedOrder.getQuantity()))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal estimateFee = feeCalculator.calculateTotalFee(estimateAmount, safeInt(amendedOrder.getType()) == TYPE_BUY, lots);
            accountLedgerService.reserveForPendingOrder(amendedOrder, "LIMIT", estimateFee);
        }
        return cloneOrder(amendedOrder);
    }

    @Override
    public String getOrderType(String orderId) {
        Order order = getOrderByIdOrNull(orderId);
        if (order == null) {
            return "LIMIT";
        }
        return safeOrderType(order.getOrderType());
    }

    @Override
    public List<Order> listOpenOrdersByStock(String stockCode) {
        if (stockCode == null || stockCode.trim().isEmpty()) {
            return new ArrayList<Order>();
        }
        List<Order> result = this.list(new QueryWrapper<Order>()
                .eq("stock_code", stockCode)
                .in("status", STATUS_PENDING, STATUS_PARTIAL_FILLED));
        result.sort(Comparator.comparing(Order::getCreateTime, Comparator.nullsLast(LocalDateTime::compareTo)));
        return result;
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public Order applyMatchExecution(String orderId, BigDecimal executionPrice, int matchedQuantity) {
        if (orderId == null || orderId.trim().isEmpty()) {
            throw new IllegalArgumentException("Order not found");
        }
        if (executionPrice == null || executionPrice.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }
        if (matchedQuantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0.");
        }

        Order current = getOrderByIdOrNull(orderId);
        if (current == null) {
            throw new IllegalArgumentException("Order not found");
        }
        if (!isPendingStatus(current.getStatus())) {
            return cloneOrder(current);
        }

        int totalQuantity = safeInt(current.getQuantity());
        int currentFilled = safeInt(current.getFilledQuantity());
        int remaining = Math.max(0, totalQuantity - currentFilled);
        int actualMatched = Math.min(remaining, matchedQuantity);
        if (actualMatched <= 0) {
            return cloneOrder(current);
        }

        BigDecimal oldAvg = current.getFilledAvgPrice() == null ? BigDecimal.ZERO : current.getFilledAvgPrice();
        BigDecimal oldNotional = oldAvg.multiply(new BigDecimal(currentFilled));
        BigDecimal newNotional = executionPrice.multiply(new BigDecimal(actualMatched));
        int newFilled = currentFilled + actualMatched;
        BigDecimal avgPrice = oldNotional.add(newNotional)
                .divide(new BigDecimal(newFilled), 4, RoundingMode.HALF_UP);

        current.setFilledQuantity(newFilled);
        current.setFilledAvgPrice(avgPrice);
        current.setStatus(newFilled >= totalQuantity ? STATUS_FILLED : STATUS_PARTIAL_FILLED);
        current.setUpdateTime(nowInHkDateTime());

        boolean updated = this.updateById(current);
        if (!updated) {
            throw new IllegalStateException("Persist matched order failed.");
        }
        String orderType = safeOrderType(current.getOrderType());
        if (accountLedgerService != null) {
            int lotSize = mockDataService.getLotSize(current.getStockCode());
            int lots = Math.max(1, actualMatched / Math.max(1, lotSize));
            BigDecimal matchedAmount = executionPrice.multiply(new BigDecimal(actualMatched)).setScale(2, RoundingMode.HALF_UP);
            BigDecimal fee = feeCalculator.calculateTotalFee(matchedAmount, safeInt(current.getType()) == TYPE_BUY, lots);
            accountLedgerService.onOrderMatched(
                    current,
                    orderType,
                    actualMatched,
                    executionPrice,
                    fee,
                    nowInHkDateTime(),
                    calculateSettlementDate(nowInHkDateTime().toLocalDate())
            );
        }
        return cloneOrder(current);
    }

    @Override
    @Transactional(rollbackFor = Exception.class)
    public int closeExpiredLimitOrders(LocalDateTime triggerTime) {
        LocalDateTime effectiveTrigger = triggerTime == null ? nowInHkDateTime() : triggerTime;
        if (!isAfterMarketClose(effectiveTrigger)) {
            return 0;
        }

        int canceled = 0;
        for (Order order : listOpenOrders()) {
            if (order == null || !isPendingStatus(order.getStatus())) {
                continue;
            }
            if (!isLimitOrder(order)) {
                continue;
            }
            if (!isLimitOrderExpired(order, effectiveTrigger)) {
                continue;
            }

            Order canceledOrder = cloneOrder(order);
            canceledOrder.setStatus(STATUS_CANCELED);
            canceledOrder.setUpdateTime(effectiveTrigger);
                boolean updated = this.updateById(canceledOrder);
                if (!updated) {
                    throw new IllegalStateException("Persist close cleanup failed.");
                }
            if (accountLedgerService != null) {
                accountLedgerService.releaseOnOrderCanceled(canceledOrder, safeOrderType(canceledOrder.getOrderType()));
            }
            canceled++;
        }
        return canceled;
    }

    private ValidationContext validateAndBuildContext(String userId, TradeOrderCreateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request cannot be null.");
        }
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("User ID cannot be blank.");
        }
        closeExpiredLimitOrders(nowInHkDateTime());

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
        validateSellHoldings(userId, stockCode, type, quantity);
        if ("LIMIT".equals(orderType)) {
            validatePriceRange(effectivePrice, limitPriceMin, limitPriceMax);
        }
        validateDailyBuyLimit(userId, type);
        validateLimitQueueLimit(userId, orderType, null);

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

    private void validateSellHoldings(String userId, String stockCode, int type, Integer quantity) {
        if (type != TYPE_SELL) {
            return;
        }
        int available = resolveAvailableHoldings(userId, stockCode);
        if (quantity > available) {
            throw new IllegalArgumentException("Insufficient holdings to sell. Available: " + available);
        }
    }

    private int resolveAvailableHoldings(String userId, String stockCode) {
        if (accountLedgerService != null) {
            int tradable = accountLedgerService.getTradableQuantity(userId, stockCode);
            if (tradable > 0 || accountLedgerService.hasPositionRecord(userId, stockCode)) {
                return tradable;
            }
        }
        int net = 0;
        for (Order order : listOrdersByUser(userId)) {
            if (order == null || !stockCode.equals(order.getStockCode())) {
                continue;
            }
            int filled = safeInt(order.getFilledQuantity());
            if (filled <= 0) {
                continue;
            }
            int orderType = safeInt(order.getType());
            if (orderType == TYPE_BUY) {
                net += filled;
            } else if (orderType == TYPE_SELL) {
                net -= filled;
            }
        }
        return Math.max(net, 0);
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

    private void validateLimitQueueLimit(String userId, String orderType, String ignoredOrderId) {
        if (!"LIMIT".equals(orderType)) {
            return;
        }
        if (countPendingLimitOrders(userId, ignoredOrderId) >= MAX_PENDING_LIMIT_ORDERS) {
            throw new IllegalArgumentException("Exceeded maximum of 5 pending LIMIT orders.");
        }
    }

    private long countPendingLimitOrders(String userId, String ignoredOrderId) {
        return listOrdersByUser(userId).stream()
                .filter(order -> isPendingStatus(order.getStatus()))
                .filter(this::isLimitOrder)
                .filter(order -> ignoredOrderId == null || !ignoredOrderId.equals(order.getId()))
                .count();
    }

    private boolean isPendingStatus(Integer status) {
        int safeStatus = safeInt(status);
        return safeStatus == STATUS_PENDING || safeStatus == STATUS_PARTIAL_FILLED;
    }

    private boolean isLimitOrder(Order order) {
        return "LIMIT".equalsIgnoreCase(safeOrderType(order == null ? null : order.getOrderType()));
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
        return tradingCalendarService.nextTradingDay(date);
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

    private List<Order> listOrdersByUser(String userId) {
        List<Order> result = this.list(new QueryWrapper<Order>().eq("user_id", userId));
        result.sort(Comparator.comparing(Order::getCreateTime, Comparator.nullsLast(LocalDateTime::compareTo)).reversed());
        return result;
    }

    private List<Order> listOpenOrders() {
        return this.list(new QueryWrapper<Order>()
                .in("status", STATUS_PENDING, STATUS_PARTIAL_FILLED));
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
        return this.getById(orderId);
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

    private String safeOrderType(String orderType) {
        if ("MARKET".equalsIgnoreCase(orderType)) {
            return "MARKET";
        }
        return "LIMIT";
    }

    private int safeInt(Integer value) {
        return value == null ? 0 : value;
    }

    private LocalDateTime nowInHkDateTime() {
        return ZonedDateTime.now(tradingClock).withZoneSameInstant(HK_ZONE).toLocalDateTime();
    }

    private void applyInitialExecution(Order order, ValidationContext context) {
        if (order == null || context == null) {
            return;
        }

        if (shouldFillImmediately(context)) {
            order.setStatus(STATUS_FILLED);
            order.setFilledQuantity(context.quantity);
            order.setFilledAvgPrice(context.currentPrice);
            return;
        }

        order.setStatus(STATUS_PENDING);
        order.setFilledQuantity(0);
        order.setFilledAvgPrice(BigDecimal.ZERO);
    }

    private boolean shouldFillImmediately(ValidationContext context) {
        if ("MARKET".equals(context.orderType)) {
            return true;
        }
        if (!Boolean.TRUE.equals(context.tradableNow)) {
            return false;
        }
        if (context.effectivePrice == null || context.currentPrice == null) {
            return false;
        }
        if (context.type == TYPE_BUY) {
            return context.effectivePrice.compareTo(context.currentPrice) >= 0;
        }
        return context.effectivePrice.compareTo(context.currentPrice) <= 0;
    }

    private void ensureUniqueSubmission(String signature) {
        if (tryAcquireSubmissionInRedis(signature)) {
            return;
        }
        ensureUniqueSubmissionInMemory(signature);
    }

    private boolean tryAcquireSubmissionInRedis(String signature) {
        if (stringRedisTemplate == null) {
            if (redisStrictMode) {
                throw new IllegalStateException("Redis dedup is unavailable.");
            }
            return false;
        }
        try {
            Boolean created = stringRedisTemplate.opsForValue().setIfAbsent(
                    REDIS_SUBMISSION_KEY_PREFIX + signature,
                    "1",
                    DUPLICATE_WINDOW_MS,
                    TimeUnit.MILLISECONDS
            );
            if (Boolean.TRUE.equals(created)) {
                return true;
            }
            throw new IllegalArgumentException("Duplicate order submission detected. Please try again later.");
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            if (redisStrictMode) {
                throw new IllegalStateException("Redis dedup is unavailable.", ex);
            }
            log.warn("Redis dedup unavailable, fallback to in-memory dedup. reason={}", ex.getMessage());
            return false;
        }
    }

    private void ensureUniqueSubmissionInMemory(String signature) {
        long now = System.currentTimeMillis();
        Long previous = submissionTracker.get(signature);
        if (previous != null && now - previous < DUPLICATE_WINDOW_MS) {
            throw new IllegalArgumentException("Duplicate order submission detected. Please try again later.");
        }
        submissionTracker.put(signature, now);
    }

    private String buildSubmissionSignature(String userId, ValidationContext context) {
        String price = context.effectivePrice == null
                ? "0"
                : context.effectivePrice.stripTrailingZeros().toPlainString();
        return String.join("|", userId, context.stockCode, context.direction, context.orderType, price, String.valueOf(context.quantity));
    }

    private String buildIdempotencyFingerprint(TradeOrderCreateRequest request) {
        if (request == null) {
            return "null";
        }
        String stockCode = request.getStockCode() == null ? "" : request.getStockCode().trim().toUpperCase(Locale.ROOT);
        String direction = request.getDirection() == null ? "" : request.getDirection().trim().toUpperCase(Locale.ROOT);
        String orderType = request.getOrderType() == null ? "" : request.getOrderType().trim().toUpperCase(Locale.ROOT);
        String quantity = request.getQuantity() == null ? "0" : String.valueOf(request.getQuantity());
        String price = request.getPrice() == null
                ? "0"
                : request.getPrice().stripTrailingZeros().toPlainString();
        return String.join("|", stockCode, direction, orderType, quantity, price);
    }

    private String normalizeIdempotencyKey(String idempotencyKey) {
        if (idempotencyKey == null) {
            return null;
        }
        String trimmed = idempotencyKey.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.length() > 128) {
            throw new IllegalArgumentException("Idempotency key length must be <= 128.");
        }
        return trimmed;
    }

    private SubmissionIdempotencyRecord loadIdempotencyRecord(String redisKey) {
        SubmissionIdempotencyRecord local = localIdempotencyTracker.get(redisKey);
        if (local != null) {
            if (local.isExpired()) {
                localIdempotencyTracker.remove(redisKey);
                local = null;
            } else {
                return local;
            }
        }
        if (stringRedisTemplate == null) {
            if (redisStrictMode) {
                throw new IllegalStateException("Load idempotency record failed: redis is unavailable.");
            }
            return local;
        }
        try {
            String raw = stringRedisTemplate.opsForValue().get(redisKey);
            if (raw == null || raw.trim().isEmpty()) {
                return null;
            }
            SubmissionIdempotencyRecord parsed = parseIdempotencyRecord(raw);
            if (parsed != null && !parsed.isExpired()) {
                localIdempotencyTracker.put(redisKey, parsed);
            } else if (parsed != null) {
                localIdempotencyTracker.remove(redisKey);
                return null;
            }
            return parsed;
        } catch (Exception ex) {
            if (redisStrictMode) {
                throw new IllegalStateException("Load idempotency record failed.", ex);
            }
            log.warn("Load idempotency record from redis failed, fallback to local cache. reason={}", ex.getMessage());
            return null;
        }
    }

    private void storeIdempotencyRecord(String redisKey, SubmissionIdempotencyRecord record) {
        if (record == null) {
            return;
        }
        localIdempotencyTracker.put(redisKey, record);
        if (stringRedisTemplate == null) {
            if (redisStrictMode) {
                throw new IllegalStateException("Persist idempotency record failed: redis is unavailable.");
            }
            return;
        }
        try {
            String payload = writeIdempotencyRecord(record);
            stringRedisTemplate.opsForValue().set(redisKey, payload, IDEMPOTENCY_TTL_SECONDS, TimeUnit.SECONDS);
        } catch (Exception ex) {
            if (redisStrictMode) {
                throw new IllegalStateException("Persist idempotency record failed.", ex);
            }
            log.warn("Persist idempotency record to redis failed, keep local cache only. reason={}", ex.getMessage());
        }
    }

    private void ensureSamePayload(SubmissionIdempotencyRecord record, String fingerprint) {
        if (record == null) {
            return;
        }
        if (record.requestFingerprint != null && !record.requestFingerprint.equals(fingerprint)) {
            throw new IllegalArgumentException("Idempotency key is already used with different request payload.");
        }
    }

    private String writeIdempotencyRecord(SubmissionIdempotencyRecord record) {
        if (objectMapper == null) {
            throw new IllegalStateException("ObjectMapper is unavailable.");
        }
        try {
            return objectMapper.writeValueAsString(record);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Serialize idempotency record failed.", ex);
        }
    }

    private SubmissionIdempotencyRecord parseIdempotencyRecord(String raw) {
        if (objectMapper == null) {
            return null;
        }
        try {
            return objectMapper.readValue(raw, SubmissionIdempotencyRecord.class);
        } catch (Exception ex) {
            log.warn("Parse idempotency record failed, ignore stale redis payload. reason={}", ex.getMessage());
            return null;
        }
    }

    private String mapStatus(Integer status) {
        int safeStatus = safeInt(status);
        if (safeStatus == STATUS_PENDING) {
            return "PENDING";
        }
        if (safeStatus == STATUS_PARTIAL_FILLED) {
            return "PARTIAL_FILLED";
        }
        if (safeStatus == STATUS_FILLED) {
            return "FILLED";
        }
        if (safeStatus == STATUS_CANCELED) {
            return "CANCELED";
        }
        return "REJECTED";
    }

    private Order buildPendingOrder(String userId, String stockCode, int type, String orderType, BigDecimal price, int quantity) {
        LocalDateTime now = nowInHkDateTime();
        Order order = new Order();
        order.setId(UUID.randomUUID().toString());
        order.setUserId(userId);
        order.setStockCode(stockCode);
        order.setType(type);
        order.setOrderType(safeOrderType(orderType));
        order.setPrice(price);
        order.setQuantity(quantity);
        order.setFilledQuantity(0);
        order.setFilledAvgPrice(BigDecimal.ZERO);
        order.setStatus(STATUS_PENDING);
        order.setCreateTime(now);
        order.setUpdateTime(now);
        return order;
    }

    private void applyLedgerAfterOrderAccepted(Order order, ValidationContext context) {
        if (accountLedgerService == null || order == null || context == null) {
            return;
        }
        if (safeInt(order.getStatus()) == STATUS_PENDING) {
            BigDecimal estimateAmount = context.effectivePrice
                    .multiply(new BigDecimal(context.quantity))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal estimateFee = feeCalculator.calculateTotalFee(
                    estimateAmount,
                    context.type == TYPE_BUY,
                    context.lots
            );
            accountLedgerService.reserveForPendingOrder(order, context.orderType, estimateFee);
            return;
        }
        if (safeInt(order.getStatus()) == STATUS_FILLED) {
            BigDecimal matchedAmount = context.currentPrice
                    .multiply(new BigDecimal(context.quantity))
                    .setScale(2, RoundingMode.HALF_UP);
            BigDecimal fee = feeCalculator.calculateTotalFee(
                    matchedAmount,
                    context.type == TYPE_BUY,
                    context.lots
            );
            accountLedgerService.onOrderMatched(
                    order,
                    context.orderType,
                    context.quantity,
                    context.currentPrice,
                    fee,
                    nowInHkDateTime(),
                    calculateSettlementDate(nowInHkDateTime().toLocalDate())
            );
        }
    }

    private LocalDate calculateSettlementDate(LocalDate tradeDate) {
        return tradingCalendarService.addTradingDays(tradeDate, 2);
    }

    private boolean isAfterMarketClose(LocalDateTime dateTime) {
        if (dateTime == null) {
            return false;
        }
        if (!isTradingDay(dateTime.toLocalDate())) {
            return false;
        }
        return !dateTime.toLocalTime().isBefore(MARKET_CLOSE);
    }

    private boolean isLimitOrderExpired(Order order, LocalDateTime triggerTime) {
        if (order == null || order.getCreateTime() == null || triggerTime == null) {
            return false;
        }
        ZonedDateTime creation = order.getCreateTime().atZone(HK_ZONE);
        ZonedDateTime validUntil = resolveLimitOrderValidUntil(creation, isTradingSession(creation));
        return !triggerTime.atZone(HK_ZONE).isBefore(validUntil);
    }

    private Order cloneOrder(Order source) {
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

    private static class SubmissionIdempotencyRecord {
        private String requestFingerprint;
        private String orderId;
        private String status;
        private Boolean tradableNow;
        private String validityType;
        private String validUntil;
        private String validityNote;
        private Long createdAtEpochMs;

        public SubmissionIdempotencyRecord() {
        }

        private static SubmissionIdempotencyRecord from(String requestFingerprint, TradeOrderSubmitResult result) {
            SubmissionIdempotencyRecord record = new SubmissionIdempotencyRecord();
            record.requestFingerprint = requestFingerprint;
            record.orderId = result.getOrderId();
            record.status = result.getStatus();
            record.tradableNow = result.getTradableNow();
            record.validityType = result.getValidityType();
            record.validUntil = result.getValidUntil();
            record.validityNote = result.getValidityNote();
            record.createdAtEpochMs = System.currentTimeMillis();
            return record;
        }

        private TradeOrderSubmitResult toSubmitResult() {
            TradeOrderSubmitResult result = new TradeOrderSubmitResult();
            result.setOrderId(orderId);
            result.setStatus(status);
            result.setTradableNow(tradableNow);
            result.setValidityType(validityType);
            result.setValidUntil(validUntil);
            result.setValidityNote(validityNote);
            result.setSuccessActions(Arrays.asList(
                    "VIEW_ACTIVE_ORDERS",
                    "TRADE_AGAIN",
                    "OPEN_QUOTE",
                    "BACK_HOME"
            ));
            return result;
        }

        public String getRequestFingerprint() {
            return requestFingerprint;
        }

        public void setRequestFingerprint(String requestFingerprint) {
            this.requestFingerprint = requestFingerprint;
        }

        public String getOrderId() {
            return orderId;
        }

        public void setOrderId(String orderId) {
            this.orderId = orderId;
        }

        public String getStatus() {
            return status;
        }

        public void setStatus(String status) {
            this.status = status;
        }

        public Boolean getTradableNow() {
            return tradableNow;
        }

        public void setTradableNow(Boolean tradableNow) {
            this.tradableNow = tradableNow;
        }

        public String getValidityType() {
            return validityType;
        }

        public void setValidityType(String validityType) {
            this.validityType = validityType;
        }

        public String getValidUntil() {
            return validUntil;
        }

        public void setValidUntil(String validUntil) {
            this.validUntil = validUntil;
        }

        public String getValidityNote() {
            return validityNote;
        }

        public void setValidityNote(String validityNote) {
            this.validityNote = validityNote;
        }

        public Long getCreatedAtEpochMs() {
            return createdAtEpochMs;
        }

        public void setCreatedAtEpochMs(Long createdAtEpochMs) {
            this.createdAtEpochMs = createdAtEpochMs;
        }

        private boolean isExpired() {
            if (createdAtEpochMs == null || createdAtEpochMs <= 0L) {
                return false;
            }
            return System.currentTimeMillis() - createdAtEpochMs > IDEMPOTENCY_TTL_SECONDS * 1000L;
        }
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
