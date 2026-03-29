package com.simtrade.backend.service;

import com.simtrade.backend.entity.Order;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

class ViewQueryServiceTest {

    private ViewQueryService viewQueryService;
    private OrderService orderService;
    private MockDataService mockDataService;
    private UserProfileService userProfileService;

    @BeforeEach
    void setUp() {
        viewQueryService = new ViewQueryService();
        orderService = Mockito.mock(OrderService.class);
        mockDataService = Mockito.mock(MockDataService.class);
        userProfileService = Mockito.mock(UserProfileService.class);

        ReflectionTestUtils.setField(viewQueryService, "orderService", orderService);
        ReflectionTestUtils.setField(viewQueryService, "mockDataService", mockDataService);
        ReflectionTestUtils.setField(viewQueryService, "feeCalculator", new FeeCalculator());
        ReflectionTestUtils.setField(viewQueryService, "userProfileService", userProfileService);

        Mockito.when(mockDataService.getStockName("00700")).thenReturn("腾讯控股");
        Mockito.when(mockDataService.getCurrentPrice("00700")).thenReturn(new BigDecimal("300.00"));
        Mockito.when(mockDataService.getLotSize("00700")).thenReturn(100);
    }

    @Test
    void buildAccountPositions_shouldAggregateFilledOrdersPerUser() {
        List<Order> orders = Arrays.asList(
                buildOrder("ord_buy_1", "u_2001", "00700", 1, 2, new BigDecimal("295.00"), 200, 200),
                buildOrder("ord_sell_1", "u_2001", "00700", 2, 2, new BigDecimal("305.00"), 100, 100),
                buildOrder("ord_cancel_1", "u_2001", "00700", 1, 3, new BigDecimal("299.00"), 100, 0)
        );
        Mockito.when(orderService.listHistoryOrders("u_2001", null, null)).thenReturn(orders);

        Map<String, Object> result = viewQueryService.buildAccountPositions("u_2001");
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

        Map<String, Object> profile = viewQueryService.buildAccountProfile("u_2001");

        Assertions.assertEquals("测试用户", profile.get("nickname"));
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
        order.setCreateTime(LocalDateTime.now());
        order.setUpdateTime(LocalDateTime.now());
        return order;
    }
}
