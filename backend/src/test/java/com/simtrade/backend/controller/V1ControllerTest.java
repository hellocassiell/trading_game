package com.simtrade.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simtrade.backend.common.GlobalExceptionHandler;
import com.simtrade.backend.dto.TradeOrderCancelResult;
import com.simtrade.backend.dto.TradeOrderPreviewResult;
import com.simtrade.backend.dto.TradeOrderSubmitResult;
import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.entity.Order;
import com.simtrade.backend.mapper.AccountBalanceMapper;
import com.simtrade.backend.mapper.AccountPositionMapper;
import com.simtrade.backend.mapper.OrderMapper;
import com.simtrade.backend.mapper.OrderReservationMapper;
import com.simtrade.backend.mapper.OrderSettlementMapper;
import com.simtrade.backend.mapper.SettlementEntryMapper;
import com.simtrade.backend.mapper.UserProfileMapper;
import com.simtrade.backend.service.AuthService;
import com.simtrade.backend.service.MarketDataRealtimeService;
import com.simtrade.backend.service.MatchingService;
import com.simtrade.backend.service.MockDataService;
import com.simtrade.backend.service.OrderService;
import com.simtrade.backend.service.AvatarStorageService;
import com.simtrade.backend.service.UserProfileService;
import com.simtrade.backend.service.ViewQueryService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.request;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest({
        AccountV1Controller.class,
        HomeV1Controller.class,
        TradeV1Controller.class,
        LeaderboardV1Controller.class,
        TradeOrderV1Controller.class,
        OrderController.class,
        AuthV1Controller.class
})
@Import(GlobalExceptionHandler.class)
@TestPropertySource(properties = {
        "app.cors.allowed-origin-patterns=https://*.vercel.app,http://localhost:*,http://127.0.0.1:*"
})
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

    @MockBean
    private UserProfileMapper userProfileMapper;

    @MockBean
    private AccountBalanceMapper accountBalanceMapper;

    @MockBean
    private AccountPositionMapper accountPositionMapper;

    @MockBean
    private OrderReservationMapper orderReservationMapper;

    @MockBean
    private OrderSettlementMapper orderSettlementMapper;

    @MockBean
    private SettlementEntryMapper settlementEntryMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private MockDataService mockDataService;

    @MockBean
    private UserProfileService userProfileService;

    @MockBean
    private AvatarStorageService avatarStorageService;

    @MockBean
    private MarketDataRealtimeService marketDataRealtimeService;

    @MockBean
    private MatchingService matchingService;

    @Test
    void accountProfile_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> profile = new LinkedHashMap<String, Object>();
        profile.put("nickname", "Joey Cheung");
        profile.put("dailyTradesRemaining", 16);

        Mockito.when(viewQueryService.buildAccountProfile(Mockito.eq("u_10001"), Mockito.anyString()))
                .thenReturn(profile);

        mockMvc.perform(get("/api/v1/account/profile")
                        .header("X-User-Id", "u_10001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.nickname").value("Joey Cheung"))
                .andExpect(jsonPath("$.data.dailyTradesRemaining").value(16));
    }

    @Test
    void accountProfile_shouldReturn400WhenUserIdHeaderMissing() throws Exception {
        mockMvc.perform(get("/api/v1/account/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.msg").value("用戶 ID 不能為空。"));
    }

    @Test
    void accountAssetTrend_shouldReturnRangeData() throws Exception {
        Map<String, Object> trend = new LinkedHashMap<String, Object>();
        trend.put("range", "7d");
        trend.put("currency", "HKD");
        trend.put("updatedAt", "2026-03-31T21:00:00+08:00");
        trend.put("points", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("date", "2026-03-31");
            put("totalAssets", new BigDecimal("1000000.00"));
            put("changePercent", new BigDecimal("0.00"));
        }}));

        Mockito.when(viewQueryService.buildAccountAssetTrend(Mockito.eq("u_10001"), Mockito.eq("7d"), Mockito.anyString()))
                .thenReturn(trend);

        mockMvc.perform(get("/api/v1/account/asset-trend")
                        .header("X-User-Id", "u_10001")
                        .param("range", "7d"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.range").value("7d"))
                .andExpect(jsonPath("$.data.currency").value("HKD"))
                .andExpect(jsonPath("$.data.points[0].date").value("2026-03-31"));
    }

    @Test
    void accountAssetTrend_shouldReturn400WhenUserIdHeaderMissing() throws Exception {
        mockMvc.perform(get("/api/v1/account/asset-trend").param("range", "7d"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.msg").value("用戶 ID 不能為空。"));
    }

    @Test
    void homeOverview_shouldReturnCompetitionData() throws Exception {
        Map<String, Object> competition = new LinkedHashMap<String, Object>();
        competition.put("name", "智财港股投资大赛2020");

        Map<String, Object> overview = new LinkedHashMap<String, Object>();
        overview.put("competition", competition);

        Mockito.when(viewQueryService.buildHomeOverview(Mockito.eq("u_10001"), Mockito.anyString())).thenReturn(overview);

        mockMvc.perform(get("/api/v1/home/overview")
                        .header("X-User-Id", "u_10001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.competition.name").value("智财港股投资大赛2020"));
    }

    @Test
    void homeOverview_shouldReturn400WhenUserIdHeaderMissing() throws Exception {
        mockMvc.perform(get("/api/v1/home/overview"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.msg").value("用戶 ID 不能為空。"));
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

        Mockito.when(orderService.placeOrderV1(Mockito.eq("u_10001"), Mockito.any(), Mockito.isNull())).thenReturn(result);

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("direction", "BUY");
        request.put("orderType", "LIMIT");
        request.put("price", new BigDecimal("300.00"));
        request.put("quantity", 100);

        mockMvc.perform(post("/api/v1/trade/orders")
                        .header("X-User-Id", "u_10001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderId").value("ord_001"))
                .andExpect(jsonPath("$.data.status").value("PENDING"))
                .andExpect(jsonPath("$.data.lang").value("zh-Hant"))
                .andExpect(jsonPath("$.data.successActions[0]").value("VIEW_ACTIVE_ORDERS"));
    }

    @Test
    void submitOrder_shouldReturn400WhenUserIdHeaderMissing() throws Exception {
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
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.msg").value("用戶 ID 不能為空。"));
    }

    @Test
    void submitMarketOrder_withoutPrice_shouldPassValidationAndCallService() throws Exception {
        TradeOrderSubmitResult result = new TradeOrderSubmitResult();
        result.setOrderId("ord_market_001");
        result.setStatus("PENDING");

        Mockito.when(orderService.placeOrderV1(Mockito.eq("u_10001"), Mockito.any(), Mockito.isNull())).thenReturn(result);

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("direction", "BUY");
        request.put("orderType", "MARKET");
        request.put("quantity", 100);

        mockMvc.perform(post("/api/v1/trade/orders")
                        .header("X-User-Id", "u_10001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderId").value("ord_market_001"));
    }

    @Test
    void submitOrder_shouldForwardIdempotencyKeyHeader() throws Exception {
        TradeOrderSubmitResult result = new TradeOrderSubmitResult();
        result.setOrderId("ord_idem_001");
        result.setStatus("PENDING");
        Mockito.when(orderService.placeOrderV1(Mockito.eq("u_10001"), Mockito.any(), Mockito.eq("idem-001")))
                .thenReturn(result);

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("direction", "BUY");
        request.put("orderType", "LIMIT");
        request.put("price", new BigDecimal("300.00"));
        request.put("quantity", 100);

        mockMvc.perform(post("/api/v1/trade/orders")
                        .header("X-User-Id", "u_10001")
                        .header("X-Idempotency-Key", "idem-001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.orderId").value("ord_idem_001"));

        Mockito.verify(orderService).placeOrderV1(Mockito.eq("u_10001"), Mockito.any(), Mockito.eq("idem-001"));
    }

    @Test
    void corsPreflight_shouldAllowLocalFrontendOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/trade/orders")
                        .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type,x-user-id"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, org.hamcrest.Matchers.containsString("POST")))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, org.hamcrest.Matchers.containsString("x-user-id")));
    }

    @Test
    void corsPreflight_shouldAllowVercelPreviewOrigin() throws Exception {
        mockMvc.perform(options("/api/v1/trade/orders")
                        .header(HttpHeaders.ORIGIN, "https://demo-trading.vercel.app")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "content-type,x-user-id"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://demo-trading.vercel.app"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_METHODS, org.hamcrest.Matchers.containsString("POST")))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, org.hamcrest.Matchers.containsString("x-user-id")));
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
        Mockito.when(mockDataService.getStockName("00700", "zh-Hant")).thenReturn("騰訊控股");

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("direction", "BUY");
        request.put("orderType", "LIMIT");
        request.put("price", new BigDecimal("300.00"));
        request.put("quantity", 100);

        mockMvc.perform(post("/api/v1/trade/orders/preview")
                        .header("X-User-Id", "u_10001")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.stockCode").value("00700"))
                .andExpect(jsonPath("$.data.lang").value("zh-Hant"))
                .andExpect(jsonPath("$.data.estimatedFee").value(131.40));
    }

    @Test
    void auth_sendAndVerifyCode_shouldReturn200() throws Exception {
        Mockito.doNothing().when(authService).sendCode("91234567");
        Mockito.when(authService.verifyCode("91234567", "123456"))
                .thenReturn(new com.simtrade.backend.dto.AuthSessionResponse("u_4567", "91234567", "token", false));

        mockMvc.perform(post("/api/v1/auth/send-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"91234567\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));

        mockMvc.perform(post("/api/v1/auth/verify-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"phone\":\"91234567\",\"code\":\"123456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.userId").value("u_4567"))
                .andExpect(jsonPath("$.data.phone").value("91234567"));
    }

    @Test
    void auth_session_shouldReturnLoggedInWhenUserIdProvided() throws Exception {
        Mockito.when(userProfileService.getPhone("u_4567")).thenReturn("91234567");
        Mockito.when(userProfileService.hasCompletedProfile("u_4567")).thenReturn(true);

        mockMvc.perform(get("/api/v1/auth/session")
                        .header("X-User-Id", "u_4567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.loggedIn").value(true))
                .andExpect(jsonPath("$.data.userId").value("u_4567"))
                .andExpect(jsonPath("$.data.phone").value("91234567"))
                .andExpect(jsonPath("$.data.profileCompleted").value(true))
                .andExpect(jsonPath("$.data.accountStatus").value("ACTIVE"));
    }

    @Test
    void auth_session_shouldReturnLoggedOutWhenUserIdMissing() throws Exception {
        mockMvc.perform(get("/api/v1/auth/session"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.loggedIn").value(false))
                .andExpect(jsonPath("$.data.userId").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.data.phone").value(org.hamcrest.Matchers.nullValue()))
                .andExpect(jsonPath("$.data.profileCompleted").value(false));
    }

    @Test
    void auth_completeProfile_shouldReturn200() throws Exception {
        Mockito.when(avatarStorageService.normalizeProfileAvatarId("a3")).thenReturn("a3");
        Mockito.doNothing().when(userProfileService).upsertProfile("u_4567", "小明", "a3");

        mockMvc.perform(post("/api/v1/auth/profile")
                        .header("X-User-Id", "u_4567")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"小明\",\"avatarId\":\"a3\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200));
    }

    @Test
    void auth_completeProfile_shouldReturn400WhenAvatarIdUnsupported() throws Exception {
        Mockito.when(avatarStorageService.normalizeProfileAvatarId("bad_avatar"))
                .thenThrow(new IllegalArgumentException("Unsupported avatar identifier."));

        mockMvc.perform(post("/api/v1/auth/profile")
                        .header("X-User-Id", "u_4567")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nickname\":\"小明\",\"avatarId\":\"bad_avatar\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test
    void auth_uploadAvatar_shouldReturnAvatarId() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "avatar.png",
                "image/png",
                new byte[]{1, 2, 3, 4}
        );
        Mockito.when(avatarStorageService.storeUploadedAvatar(Mockito.eq("u_4567"), Mockito.any()))
                .thenReturn("/api/v1/auth/avatar-files/u_4567_1.png");
        Mockito.when(avatarStorageService.currentAvatarVersion()).thenReturn(1);

        mockMvc.perform(multipart("/api/v1/auth/avatar-upload")
                        .file(file)
                        .header("X-User-Id", "u_4567"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.avatarId").value("/api/v1/auth/avatar-files/u_4567_1.png"))
                .andExpect(jsonPath("$.data.avatarVersion").value(1));
    }

    @Test
    void activeOrders_shouldReturnItems() throws Exception {
        Order order = buildOrder("ord_001", 1, 0);
        Map<String, Object> orderView = new LinkedHashMap<String, Object>();
        orderView.put("orderId", "ord_001");
        orderView.put("status", "PENDING");

        Mockito.when(orderService.listActiveOrders("u_10001", "ALL")).thenReturn(Arrays.asList(order));
        Mockito.when(viewQueryService.toOrderView(Mockito.eq(order), Mockito.anyString()))
                .thenReturn(orderView);

        mockMvc.perform(get("/api/v1/trade/orders/active")
                        .header("X-User-Id", "u_10001"))
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
        Mockito.when(viewQueryService.toOrderView(Mockito.eq(order), Mockito.anyString()))
                .thenReturn(orderView);

        mockMvc.perform(get("/api/v1/trade/orders/history")
                        .header("X-User-Id", "u_10001"))
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
        Mockito.when(viewQueryService.toOrderView(Mockito.eq(order), Mockito.anyString()))
                .thenReturn(orderView);

        mockMvc.perform(get("/api/v1/trade/orders/ord_003")
                        .header("X-User-Id", "u_10001"))
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

        mockMvc.perform(post("/api/v1/trade/orders/ord_004/cancel")
                        .header("X-User-Id", "u_10001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.orderId").value("ord_004"))
                .andExpect(jsonPath("$.data.status").value("CANCELED"))
                .andExpect(jsonPath("$.data.lang").value("zh-Hant"))
                .andExpect(jsonPath("$.data.releasedCash").value(24000));
    }

    @Test
    void amendOrder_shouldReturnUpdatedOrderSummary() throws Exception {
        Order amended = buildOrder("ord_005", 1, 0);
        amended.setPrice(new BigDecimal("301.20"));
        amended.setQuantity(200);

        Mockito.when(orderService.amendOrderV1(Mockito.eq("u_10001"), Mockito.eq("ord_005"), Mockito.any()))
                .thenReturn(amended);
        Mockito.when(viewQueryService.toOrderView(Mockito.eq(amended), Mockito.anyString())).thenReturn(new LinkedHashMap<String, Object>() {{
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
                        .header("X-User-Id", "u_10001")
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

        Mockito.when(viewQueryService.searchTradeTargets(Mockito.eq("腾讯"), Mockito.anyString()))
                .thenReturn(response);

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

        Mockito.when(viewQueryService.buildTradeQuote(Mockito.eq("00700"), Mockito.anyString()))
                .thenReturn(quote);

        mockMvc.perform(get("/api/v1/trade/quote/00700"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.stockCode").value("00700"))
                .andExpect(jsonPath("$.data.stockName").value("腾讯控股"));
    }

    @Test
    void quoteStream_shouldReturnEventStreamAndSubscribeRealtimeService() throws Exception {
        Mockito.when(marketDataRealtimeService.subscribe("00700")).thenReturn(new SseEmitter(1000L));

        mockMvc.perform(get("/api/v1/trade/quote/stream").param("stockCode", "00700"))
                .andExpect(status().isOk())
                .andExpect(request().asyncStarted());

        Mockito.verify(marketDataRealtimeService).subscribe("00700");
    }

    @Test
    void debugPushQuote_shouldPublishAndTriggerMatching() throws Exception {
        Mockito.when(marketDataRealtimeService.publish(Mockito.any(MarketData.class)))
                .thenReturn(new MarketDataRealtimeService.QuoteSnapshot(
                        "00700",
                        new BigDecimal("301.20"),
                        null,
                        java.util.Collections.emptyList(),
                        java.util.Collections.emptyList(),
                        LocalDateTime.now(),
                        1L,
                        System.currentTimeMillis()
                ));

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("nominalPrice", new BigDecimal("301.20"));
        request.put("timestamp", System.currentTimeMillis());

        mockMvc.perform(post("/api/v1/trade/quote/debug-push")
                        .param("forceMatch", "true")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accepted").value(true))
                .andExpect(jsonPath("$.data.forceMatch").value(true))
                .andExpect(jsonPath("$.data.stockCode").value("00700"));

        Mockito.verify(marketDataRealtimeService, Mockito.times(1)).publish(Mockito.any());
        Mockito.verify(matchingService, Mockito.times(1)).matchOrders(Mockito.any(), Mockito.eq(true));
    }

    @Test
    void debugPushQuote_shouldRejectStaleMarketDataAndSkipMatching() throws Exception {
        Mockito.when(marketDataRealtimeService.publish(Mockito.any(MarketData.class))).thenReturn(null);

        Map<String, Object> request = new LinkedHashMap<String, Object>();
        request.put("stockCode", "00700");
        request.put("nominalPrice", new BigDecimal("301.20"));
        request.put("timestamp", System.currentTimeMillis());

        mockMvc.perform(post("/api/v1/trade/quote/debug-push")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.accepted").value(false))
                .andExpect(jsonPath("$.data.reason").value("STALE_MARKET_DATA"));

        Mockito.verify(matchingService, Mockito.never()).matchOrders(Mockito.any(), Mockito.anyBoolean());
    }

    @Test
    void starTraders_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("total", 1);
        response.put("items", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("name", "青姐");
            put("tag", "独立股评人");
        }}));

        Mockito.when(viewQueryService.buildStarTradersLeaderboard(Mockito.eq("u_10001"), Mockito.anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/star-traders")
                        .header("X-User-Id", "u_10001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].name").value("青姐"));
    }

    @Test
    void starTraders_shouldReturn400WhenUserIdHeaderMissing() throws Exception {
        mockMvc.perform(get("/api/v1/leaderboard/star-traders"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.msg").value("用戶 ID 不能為空。"));
    }

    @Test
    void topHoldings_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("total", 1);
        response.put("items", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("stockCode", "00700");
            put("stockName", "腾讯控股");
        }}));

        Mockito.when(viewQueryService.buildTopHoldingsLeaderboard(Mockito.anyString()))
                .thenReturn(response);

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

        Mockito.when(viewQueryService.buildTopTurnoverLeaderboard(Mockito.anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/top-turnover"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.buy[0].stockCode").value("00700"))
                .andExpect(jsonPath("$.data.sell[0].stockCode").value("02800"));
    }

    @Test
    void topLoserHoldings_shouldReturnWrappedPayload() throws Exception {
        Map<String, Object> response = new LinkedHashMap<String, Object>();
        response.put("total", 1);
        response.put("items", Arrays.asList(new LinkedHashMap<String, Object>() {{
            put("stockCode", "00700");
            put("stockName", "腾讯控股");
            put("lossAmount", new BigDecimal("1000.00"));
        }}));

        Mockito.when(viewQueryService.buildTopLoserHoldingsLeaderboard(Mockito.anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/top-loser-holdings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].stockCode").value("00700"));
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

        Mockito.when(viewQueryService.buildRankingsLeaderboard(Mockito.eq("u_10001"), Mockito.eq(1), Mockito.eq(20), Mockito.anyString()))
                .thenReturn(response);

        mockMvc.perform(get("/api/v1/leaderboard/rankings")
                        .header("X-User-Id", "u_10001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(200))
                .andExpect(jsonPath("$.data.page").value(1))
                .andExpect(jsonPath("$.data.total").value(1))
                .andExpect(jsonPath("$.data.items[0].nickname").value("Mary Lee"));
    }

    @Test
    void rankings_shouldReturn400WhenUserIdHeaderMissing() throws Exception {
        mockMvc.perform(get("/api/v1/leaderboard/rankings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(400))
                .andExpect(jsonPath("$.msg").value("用戶 ID 不能為空。"));
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
