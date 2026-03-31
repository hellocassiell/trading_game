package com.simtrade.backend.service;

import com.simtrade.backend.entity.Order;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;

class AccountLedgerServiceTest {

    private AccountLedgerService ledgerService;

    @BeforeEach
    void setUp() {
        ledgerService = new AccountLedgerService();
    }

    @Test
    void buyPendingThenMatched_shouldFreezeThenMoveToTransitAndSettleToTradable() {
        Order buyOrder = buildOrder("ord_buy_1", "u_10001", "00700", 1, new BigDecimal("300.00"), 100);

        ledgerService.reserveForPendingOrder(buyOrder, "LIMIT", new BigDecimal("120.00"));
        AccountLedgerService.AccountSnapshot afterReserve = ledgerService.getAccountSnapshot("u_10001");
        Assertions.assertEquals(new BigDecimal("969880.00"), afterReserve.getAvailableCash());
        Assertions.assertEquals(new BigDecimal("30120.00"), afterReserve.getFrozenCash());

        ledgerService.onOrderMatched(
                buyOrder,
                "LIMIT",
                100,
                new BigDecimal("299.80"),
                new BigDecimal("162.38"),
                LocalDateTime.of(2026, 3, 27, 10, 0),
                LocalDate.of(2026, 3, 31)
        );
        AccountLedgerService.AccountSnapshot afterMatch = ledgerService.getAccountSnapshot("u_10001");
        Assertions.assertEquals(new BigDecimal("969857.62"), afterMatch.getAvailableCash());
        Assertions.assertEquals(new BigDecimal("0.00"), afterMatch.getFrozenCash());

        AccountLedgerService.PositionSnapshot beforeSettlePosition = ledgerService.getPositionSnapshot("u_10001", "00700");
        Assertions.assertEquals(100, beforeSettlePosition.getTransitQuantity());
        Assertions.assertEquals(0, beforeSettlePosition.getTradableQuantity());

        ledgerService.processSettlements(LocalDate.of(2026, 3, 31));
        AccountLedgerService.PositionSnapshot afterSettlePosition = ledgerService.getPositionSnapshot("u_10001", "00700");
        Assertions.assertEquals(0, afterSettlePosition.getTransitQuantity());
        Assertions.assertEquals(100, afterSettlePosition.getTradableQuantity());
    }

    @Test
    void sellPendingThenMatched_shouldFreezeQtyThenSettleCash() {
        ledgerService.seedPosition("u_10002", "00700", 1000, new BigDecimal("280.0000"));

        Order sellOrder = buildOrder("ord_sell_1", "u_10002", "00700", 2, new BigDecimal("300.00"), 200);
        ledgerService.reserveForPendingOrder(sellOrder, "LIMIT", BigDecimal.ZERO);

        AccountLedgerService.PositionSnapshot afterReserve = ledgerService.getPositionSnapshot("u_10002", "00700");
        Assertions.assertEquals(800, afterReserve.getTradableQuantity());
        Assertions.assertEquals(200, afterReserve.getFrozenQuantity());

        ledgerService.onOrderMatched(
                sellOrder,
                "LIMIT",
                200,
                new BigDecimal("301.20"),
                new BigDecimal("172.27"),
                LocalDateTime.of(2026, 3, 27, 10, 0),
                LocalDate.of(2026, 3, 31)
        );

        AccountLedgerService.AccountSnapshot afterMatch = ledgerService.getAccountSnapshot("u_10002");
        Assertions.assertEquals(new BigDecimal("60067.73"), afterMatch.getTransitCash());

        ledgerService.processSettlements(LocalDate.of(2026, 3, 31));
        AccountLedgerService.AccountSnapshot afterSettle = ledgerService.getAccountSnapshot("u_10002");
        Assertions.assertEquals(new BigDecimal("1060067.73"), afterSettle.getAvailableCash());
        Assertions.assertEquals(new BigDecimal("0.00"), afterSettle.getTransitCash());
    }

    @Test
    void cancelPendingBuy_shouldReleaseFrozenCash() {
        Order buyOrder = buildOrder("ord_buy_2", "u_10003", "00700", 1, new BigDecimal("300.00"), 100);
        ledgerService.reserveForPendingOrder(buyOrder, "LIMIT", new BigDecimal("120.00"));

        ledgerService.releaseOnOrderCanceled(buyOrder, "LIMIT");
        AccountLedgerService.AccountSnapshot account = ledgerService.getAccountSnapshot("u_10003");

        Assertions.assertEquals(new BigDecimal("1000000.00"), account.getAvailableCash());
        Assertions.assertEquals(new BigDecimal("0.00"), account.getFrozenCash());
    }

    @Test
    void getPositionSnapshots_shouldReturnOnlyPositiveQuantityPositions() {
        ledgerService.seedPosition("u_10004", "00700", 300, new BigDecimal("290.0000"));
        ledgerService.seedPosition("u_10004", "02800", 0, new BigDecimal("19.2000"));

        Map<String, AccountLedgerService.PositionSnapshot> snapshots = ledgerService.getPositionSnapshots("u_10004");
        Assertions.assertTrue(snapshots.containsKey("00700"));
        Assertions.assertFalse(snapshots.containsKey("02800"));
    }

    @Test
    void orderSettlementSnapshot_shouldExposePendingThenSettledStatus() {
        Order buyOrder = buildOrder("ord_settle_1", "u_10005", "00700", 1, new BigDecimal("300.00"), 100);
        ledgerService.reserveForPendingOrder(buyOrder, "LIMIT", new BigDecimal("120.00"));
        ledgerService.onOrderMatched(
                buyOrder,
                "LIMIT",
                100,
                new BigDecimal("299.90"),
                new BigDecimal("162.39"),
                LocalDateTime.of(2026, 3, 27, 11, 0),
                LocalDate.of(2026, 3, 31)
        );

        AccountLedgerService.OrderSettlementSnapshot pending = ledgerService.getOrderSettlementSnapshot("ord_settle_1");
        Assertions.assertNotNull(pending);
        Assertions.assertEquals("PENDING", pending.getSettlementStatus());
        Assertions.assertEquals(LocalDate.of(2026, 3, 31), pending.getSettlementDate());
        Assertions.assertEquals(new BigDecimal("-30152.39"), pending.getNetCashFlow());

        ledgerService.processSettlements(LocalDate.of(2026, 3, 31));
        AccountLedgerService.OrderSettlementSnapshot settled = ledgerService.getOrderSettlementSnapshot("ord_settle_1");
        Assertions.assertNotNull(settled);
        Assertions.assertEquals("SETTLED", settled.getSettlementStatus());
    }

    private Order buildOrder(String orderId,
                             String userId,
                             String stockCode,
                             int type,
                             BigDecimal price,
                             int quantity) {
        Order order = new Order();
        order.setId(orderId);
        order.setUserId(userId);
        order.setStockCode(stockCode);
        order.setType(type);
        order.setPrice(price);
        order.setQuantity(quantity);
        order.setFilledQuantity(0);
        order.setStatus(0);
        order.setCreateTime(LocalDateTime.of(2026, 3, 27, 9, 30));
        order.setUpdateTime(LocalDateTime.of(2026, 3, 27, 9, 30));
        return order;
    }
}
