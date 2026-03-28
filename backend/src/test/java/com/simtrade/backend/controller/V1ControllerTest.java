package com.simtrade.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simtrade.backend.common.GlobalExceptionHandler;
import com.simtrade.backend.dto.TradeOrderCancelResult;
import com.simtrade.backend.dto.TradeOrderPreviewResult;
import com.simtrade.backend.dto.TradeOrderSubmitResult;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.mapper.OrderMapper;
import com.simtrade.backend.service.OrderService;
import com.simtrade.backend.service.ViewQueryService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({
        AccountV1Controller.class,
        HomeV1Controller.class,
        TradeV1Controller.class,
        LeaderboardV1Controller.class,
        TradeOrderV1Controller.class,
        OrderController.class
})
@Import(GlobalExceptionHandler.class)
class V1ControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ViewQueryService viewQueryService;

    @MockBean
    private OrderService orderService;

    @MockBean
    private OrderMapper orderMapper;

    @Test
    void accountProfile_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> profile = new LinkedHashMap<String, Object>();
        profile.put("nickname", "Joey Cheung");
        profile.put("dailyTradesRemaining", 16);

        Mockito.when(viewQueryService.buildAccountProfile("u_10001")).thenReturn(profile);

        mockMvc.perform(get("/api/v1/account/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.nickname").value("Joey Cheung"))
                .andExpect(jsonPath("$.data.dailyTradesRemaining").value(16));
    }

    @Test
    void homeOverview_shouldReturnCompetitionData() throws Exception {
        Map<String, Object> competition = new LinkedHashMap<String, Object>();
        competition.put("name", "智财港股投资大赛2020");

        Map<String, Object> overview = new LinkedHashMap<String, Object>();
        overview.put("competition", competition);

        Mockito.when(viewQueryService.buildHomeOverview("u_10001")).thenReturn(overview);

        mockMvc.perform(get("/api/v1/home/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.competition.name").value("智财港股投资大赛2020"));
    }

    @Test
    void submitOrder_shouldReturnOrderIdAndSuccessActions() throws Exception {
        TradeOrderSubmitResult result = new TradeOrderSubmitResult();
        result.setOrderId("ord_001");
        result.setStatus("PENDING");
        result.setSuccessActions(Arrays.asList(
                "VIEW_ACTIVE_ORDERS",
                "TRADE_AGAIN",
                "OPEN_QUOTE",
                "BACK_HOME"
        ));

        Mockito.when(orderService.placeOrderV1(Mockito.eq("u_10001"), Mockito.any())).thenReturn(result);

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("direction", "BUY");
        request.put("orderType", "LIMIT");
        request.put("price", new BigDecimal("300.00"));
        request.put("quantity", 100);

        mockMvc.perform(post("/api/v1/trade/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderId").value("ord_001"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.successActions[0]").value("VIEW_ACTIVE_ORDERS"));
    }

    @Test
    void submitMarketOrder_withoutPrice_shouldPassValidationAndCallService() throws Exception {
        TradeOrderSubmitResult result = new TradeOrderSubmitResult();
        result.setOrderId("ord_market_001");
        result.setStatus("PENDING");

        Mockito.when(orderService.placeOrderV1(Mockito.eq("u_10001"), Mockito.any())).thenReturn(result);

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("direction", "BUY");
        request.put("orderType", "MARKET");
        request.put("quantity", 100);

        mockMvc.perform(post("/api/v1/trade/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderId").value("ord_market_001"));
    }

    @Test
    void previewOrder_shouldReturnEstimatedFeeAndAmount() throws Exception {
        TradeOrderPreviewResult result = new TradeOrderPreviewResult();
        result.setStockCode("00700");
        result.setOrderType("LIMIT");
        result.setDirection("BUY");
        result.setPrice(new BigDecimal("300.00"));
        result.setQuantity(100);
        result.setLots(1);
        result.setEstimatedAmount(new BigDecimal("30000.00"));
        result.setEstimatedFee(new BigDecimal("131.40"));
        result.setEstimatedTotalCost(new BigDecimal("30131.40"));

        Mockito.when(orderService.previewOrderV1(Mockito.eq("u_10001"), Mockito.any())).thenReturn(result);

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("direction", "BUY");
        request.put("orderType", "LIMIT");
        request.put("price", new BigDecimal("300.00"));
        request.put("quantity", 100);

        mockMvc.perform(post("/api/v1/trade/orders/preview")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.stockCode").value("00700"))
                .andExpect(jsonPath("$.data.estimatedFee").value(131.40));
    }

    @Test
    void activeOrders_shouldReturnItems() throws Exception {
        Order order = buildOrder("ord_001", 1, 0);
        Map<String, Object> orderView = new LinkedHashMap<String, Object>();
        orderView.put("orderId", "ord_001");
        orderView.put("status", "PENDING");

        Mockito.when(orderService.listActiveOrders("u_10001", "ALL")).thenReturn(Arrays.asList(order));
        Mockito.when(viewQueryService.toOrderView(order)).thenReturn(orderView);

        mockMvc.perform(get("/api/v1/trade/orders/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].orderId").value("ord_001"));
    }

    @Test
    void historyOrders_shouldReturnPagedItems() throws Exception {
        Order order = buildOrder("ord_002", 1, 2);
        Map<String, Object> orderView = new LinkedHashMap<String, Object>();
        orderView.put("orderId", "ord_002");
        orderView.put("status", "FILLED");

        Mockito.when(orderService.listHistoryOrders(Mockito.eq("u_10001"), Mockito.isNull(), Mockito.isNull()))
                .thenReturn(Arrays.asList(order));
        Mockito.when(viewQueryService.toOrderView(order)).thenReturn(orderView);

        mockMvc.perform(get("/api/v1/trade/orders/history"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].status").value("FILLED"));
    }

    @Test
    void orderDetail_shouldReturnDetailView() throws Exception {
        Order order = buildOrder("ord_003", 2, 0);
        Map<String, Object> orderView = new LinkedHashMap<String, Object>();
        orderView.put("orderId", "ord_003");
        orderView.put("canCancel", true);

        Mockito.when(orderService.getOrderDetail("u_10001", "ord_003")).thenReturn(order);
        Mockito.when(viewQueryService.toOrderView(order)).thenReturn(orderView);

        mockMvc.perform(get("/api/v1/trade/orders/ord_003"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId").value("ord_003"))
                .andExpect(jsonPath("$.data.canCancel").value(true));
    }

    @Test
    void cancelOrder_shouldReturnReleasedResourceData() throws Exception {
        Order order = buildOrder("ord_004", 1, 3);
        order.setFilledQuantity(20);

        Mockito.when(orderService.cancelOrder("u_10001", "ord_004")).thenReturn(order);
        Mockito.when(viewQueryService.mapOrderStatus(3)).thenReturn("CANCELED");

        mockMvc.perform(post("/api/v1/trade/orders/ord_004/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId").value("ord_004"))
                .andExpect(jsonPath("$.data.status").value("CANCELED"))
                .andExpect(jsonPath("$.data.releasedCash").value(24000));
    }

    @Test
    void amendOrder_shouldReturnUpdatedOrderSummary() throws Exception {
        Order amended = buildOrder("ord_005", 1, 0);
        amended.setPrice(new BigDecimal("301.20"));
        amended.setQuantity(200);

        Mockito.when(orderService.amendOrderV1(Mockito.eq("u_10001"), Mockito.eq("ord_005"), Mockito.any()))
                .thenReturn(amended);
        Mockito.when(viewQueryService.toOrderView(amended)).thenReturn(new LinkedHashMap<String, Object>() {{
            put("orderId", "ord_005");
            put("status", "PENDING");
            put("price", new BigDecimal("301.20"));
            put("quantity", 200);
            put("canAmend", true);
        }});

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("price", new BigDecimal("301.20"));
        request.put("quantity", 200);

        mockMvc.perform(post("/api/v1/trade/orders/ord_005/amend")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderId").value("ord_005"))
                .andExpect(jsonPath("$.data.price").value(301.20))
                .andExpect(jsonPath("$.data.quantity").value(200))
                .andExpect(jsonPath("$.data.canAmend").value(true));
    }

    @Test
    void search_shouldReturnMatchedStocks() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("keyword", "腾讯");
        response.put("total", 1);
        response.put("items", Arrays.asList(buildSearchItem("00700", "腾讯控股")));

        Mockito.when(viewQueryService.searchTradeTargets("腾讯")).thenReturn(response);

        mockMvc.perform(get("/api/v1/trade/search").param("keyword", "腾讯"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].stockCode").value("00700"));
    }

    @Test
    void quote_shouldReturnStockQuote() throws Exception {
        Map<String, Object> quote = new LinkedHashMap<String, Object>();
        quote.put("stockCode", "00700");
        quote.put("stockName", "腾讯控股");
        quote.put("currentPrice", new BigDecimal("300.00"));

        Mockito.when(viewQueryService.buildTradeQuote("00700")).thenReturn(quote);

        mockMvc.perform(get("/api/v1/trade/quote/00700"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.stockCode").value("00700"))
                .andExpect(jsonPath("$.data.stockName").value("腾讯控股"));
    }

    @Test
    void starTraders_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("total", 1);
        response.put("items", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("name", "青姐");
            put("tag", "独立股评人");
        }}));

        Mockito.when(viewQueryService.buildStarTradersLeaderboard("u_10001")).thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/star-traders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].name").value("青姐"));
    }

    @Test
    void topHoldings_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("total", 1);
        response.put("items", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("stockCode", "00700");
            put("stockName", "腾讯控股");
        }}));

        Mockito.when(viewQueryService.buildTopHoldingsLeaderboard()).thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/top-holdings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].stockCode").value("00700"));
    }

    @Test
    void topTurnover_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("buy", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("stockCode", "00700");
            put("amount", new BigDecimal("202000.00"));
        }}));
        response.put("sell", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("stockCode", "02800");
            put("amount", new BigDecimal("181000.00"));
        }}));

        Mockito.when(viewQueryService.buildTopTurnoverLeaderboard()).thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/top-turnover"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.buy[0].stockCode").value("00700"))
                .andExpect(jsonPath("$.data.sell[0].stockCode").value("02800"));
    }

    @Test
    void rankings_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("page", 1);
        response.put("pageSize", 20);
        response.put("total", 1);
        response.put("items", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("rank", 1);
            put("nickname", "Mary Lee");
        }}));

        Mockito.when(viewQueryService.buildRankingsLeaderboard("u_10001", 1, 20)).thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/rankings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].nickname").value("Mary Lee"));
    }

    private Order buildOrder(String orderId, int type, int statusValue) {
        Order order = new Order();
        order.setId(orderId);
        order.setUserId("u_10001");
        order.setStockCode("00700");
        order.setType(type);
        order.setPrice(new BigDecimal("300.00"));
        order.setQuantity(100);
        order.setFilledQuantity(0);
        order.setFilledAvgPrice(BigDecimal.ZERO);
        order.setStatus(statusValue);
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        return order;
    }

    private Map<String, Object> buildSearchItem(String stockCode, String stockName) {
        Map<String, Object> item = new LinkedHashMap<String, Object>();
        item.put("stockCode", stockCode);
        item.put("stockName", stockName);
        return item;
    }
}
