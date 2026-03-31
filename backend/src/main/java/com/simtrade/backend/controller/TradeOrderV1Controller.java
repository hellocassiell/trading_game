package com.simtrade.backend.controller;

import com.simtrade.backend.common.Result;
import com.simtrade.backend.common.LanguageSupport;
import com.simtrade.backend.dto.TradeOrderCancelResult;
import com.simtrade.backend.dto.TradeOrderAmendRequest;
import com.simtrade.backend.dto.TradeOrderCreateRequest;
import com.simtrade.backend.dto.TradeOrderPreviewResult;
import com.simtrade.backend.dto.TradeOrderSubmitResult;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.service.MockDataService;
import com.simtrade.backend.service.ViewQueryService;
import com.simtrade.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/trade/orders")
public class TradeOrderV1Controller {

    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");
    private static final DateTimeFormatter OFFSET_TIME_FORMATTER = DateTimeFormatter.ISO_OFFSET_DATE_TIME;

    @Autowired
    private OrderService orderService;

    @Autowired
    private ViewQueryService viewQueryService;

    @Autowired
    private MockDataService mockDataService;

    @PostMapping
    public Result<TradeOrderSubmitResult> submitOrder(
            @RequestHeader("X-User-Id") String userId,
            @RequestHeader(value = "X-Idempotency-Key", required = false) String idempotencyKey,
            @Validated @RequestBody TradeOrderCreateRequest request,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = resolveLanguage(headerLang, queryLang, acceptLang);
        TradeOrderSubmitResult result = orderService.placeOrderV1(userId, request, idempotencyKey);
        result.setValidityNote(localizeValidityNote(result.getValidityType(), result.getTradableNow(), language, result.getValidityNote()));
        result.setLanguage(language);
        return Result.success(result);
    }

    @PostMapping("/preview")
    public Result<TradeOrderPreviewResult> previewOrder(
            @RequestHeader("X-User-Id") String userId,
            @Validated @RequestBody TradeOrderCreateRequest request,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = resolveLanguage(headerLang, queryLang, acceptLang);
        TradeOrderPreviewResult result = orderService.previewOrderV1(userId, request);
        result.setStockName(mockDataService.getStockName(result.getStockCode(), language));
        result.setValidityNote(localizeValidityNote(result.getValidityType(), result.getTradableNow(), language, result.getValidityNote()));
        result.setLanguage(language);
        return Result.success(result);
    }

    @PostMapping("/{orderId}/cancel")
    public Result<TradeOrderCancelResult> cancelOrder(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        Order canceledOrder = orderService.cancelOrder(userId, orderId);

        TradeOrderCancelResult data = new TradeOrderCancelResult();
        data.setOrderId(canceledOrder.getId());
        data.setStatus(viewQueryService.mapOrderStatus(canceledOrder.getStatus()));
        data.setReleasedCash(calculateReleasedCash(canceledOrder));
        data.setReleasedQuantity(calculateReleasedQuantity(canceledOrder));
        data.setLanguage(resolveLanguage(headerLang, queryLang, acceptLang));
        return Result.success(data);
    }

    @PostMapping("/{orderId}/amend")
    public Result<Map<String, Object>> amendOrder(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable("orderId") String orderId,
            @Validated @RequestBody TradeOrderAmendRequest request,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = resolveLanguage(headerLang, queryLang, acceptLang);
        Order amendedOrder = orderService.amendOrderV1(userId, orderId, request);
        return Result.success(viewQueryService.toOrderView(amendedOrder, language));
    }

    @GetMapping("/active")
    public Result<Map<String, Object>> activeOrders(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(value = "status", defaultValue = "ALL") String status,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = resolveLanguage(headerLang, queryLang, acceptLang);
        List<Order> orders = orderService.listActiveOrders(userId, status);
        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (Order order : orders) {
            items.add(viewQueryService.toOrderView(order, language));
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("statusFilter", status);
        data.put("total", items.size());
        data.put("updatedAt", LocalDateTime.now(HK_ZONE).atZone(HK_ZONE).format(OFFSET_TIME_FORMATTER));
        data.put("items", items);
        data.put("lang", language);
        return Result.success(data);
    }

    @GetMapping("/history")
    public Result<Map<String, Object>> orderHistory(
            @RequestHeader("X-User-Id") String userId,
            @RequestParam(value = "page", defaultValue = "1") Integer page,
            @RequestParam(value = "pageSize", defaultValue = "20") Integer pageSize,
            @RequestParam(value = "dateFrom", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(value = "dateTo", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = resolveLanguage(headerLang, queryLang, acceptLang);
        List<Order> allOrders = orderService.listHistoryOrders(userId, dateFrom, dateTo);
        int safePage = page == null || page < 1 ? 1 : page;
        int safePageSize = pageSize == null || pageSize < 1 ? 20 : pageSize;

        int total = allOrders.size();
        int fromIndex = Math.min((safePage - 1) * safePageSize, total);
        int toIndex = Math.min(fromIndex + safePageSize, total);
        List<Order> pageOrders = allOrders.subList(fromIndex, toIndex);

        List<Map<String, Object>> items = new ArrayList<Map<String, Object>>();
        for (Order order : pageOrders) {
            items.add(viewQueryService.toOrderView(order, language));
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("page", safePage);
        data.put("pageSize", safePageSize);
        data.put("total", total);
        data.put("items", items);
        data.put("lang", language);
        return Result.success(data);
    }

    @GetMapping("/{orderId}")
    public Result<Map<String, Object>> orderDetail(
            @RequestHeader("X-User-Id") String userId,
            @PathVariable("orderId") String orderId,
            @RequestHeader(value = "X-Lang", required = false) String headerLang,
            @RequestParam(value = "lang", required = false) String queryLang,
            @RequestHeader(value = "Accept-Language", required = false) String acceptLang) {
        String language = resolveLanguage(headerLang, queryLang, acceptLang);
        Order order = orderService.getOrderDetail(userId, orderId);
        return Result.success(viewQueryService.toOrderView(order, language));
    }

    private BigDecimal calculateReleasedCash(Order order) {
        if (order.getType() == null || order.getType() != 1) {
            return BigDecimal.ZERO;
        }
        int quantity = order.getQuantity() == null ? 0 : order.getQuantity();
        int filledQuantity = order.getFilledQuantity() == null ? 0 : order.getFilledQuantity();
        int remainingQuantity = Math.max(0, quantity - filledQuantity);
        return (order.getPrice() == null ? BigDecimal.ZERO : order.getPrice())
                .multiply(new BigDecimal(remainingQuantity));
    }

    private Integer calculateReleasedQuantity(Order order) {
        if (order.getType() == null || order.getType() != 2) {
            return 0;
        }
        int quantity = order.getQuantity() == null ? 0 : order.getQuantity();
        int filledQuantity = order.getFilledQuantity() == null ? 0 : order.getFilledQuantity();
        return Math.max(0, quantity - filledQuantity);
    }

    private String resolveLanguage(String headerLang, String queryLang, String acceptLang) {
        return LanguageSupport.determineLanguage(headerLang, queryLang, acceptLang);
    }

    private String localizeValidityNote(String validityType, Boolean tradableNow, String language, String fallback) {
        if ("IMMEDIATE".equalsIgnoreCase(validityType)) {
            if (Boolean.TRUE.equals(tradableNow)) {
                return LanguageSupport.text(
                        language,
                        "市價單將按當前市價即時成交。",
                        "市价单将按当前市价即时成交。",
                        "Market order will be executed immediately at the current market price."
                );
            }
            return LanguageSupport.text(
                    language,
                    "非交易時段不支援市價單。",
                    "非交易时段不支持市价单。",
                    "Market orders are unavailable outside trading hours."
            );
        }

        if ("DAY_CLOSE".equalsIgnoreCase(validityType)) {
            return LanguageSupport.text(
                    language,
                    "限價單有效至今日收市（16:00 HKT）。",
                    "限价单有效至今日收市（16:00 HKT）。",
                    "Limit order remains active until today's market close (16:00 HKT)."
            );
        }

        if ("NEXT_TRADING_DAY_CLOSE".equalsIgnoreCase(validityType)) {
            return LanguageSupport.text(
                    language,
                    "非交易時段提交的限價單將有效至下一交易日收市（16:00 HKT）。",
                    "非交易时段提交的限价单将有效至下一交易日收市（16:00 HKT）。",
                    "Limit order submitted outside trading hours remains active until next trading day close (16:00 HKT)."
            );
        }

        return fallback;
    }
}
