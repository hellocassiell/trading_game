package com.simtrade.backend.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.lang.reflect.Constructor;

class SettlementSchedulerTest {

    private static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");

    @Test
    void runDailySettlement_shouldProcessCurrentHongKongTradingDate() {
        AccountLedgerService accountLedgerService = Mockito.mock(AccountLedgerService.class);
        Clock clock = Clock.fixed(Instant.parse("2026-03-31T16:30:00Z"), ZoneId.of("UTC"));
        SettlementScheduler scheduler = new SettlementScheduler(accountLedgerService, clock);

        scheduler.runDailySettlement();

        Mockito.verify(accountLedgerService).processSettlements(LocalDate.of(2026, 4, 1));
    }

    @Test
    void primaryConstructor_shouldBeAutowiredForSpringInstantiation() throws Exception {
        Constructor<SettlementScheduler> constructor = SettlementScheduler.class.getConstructor(AccountLedgerService.class);
        Assertions.assertTrue(constructor.isAnnotationPresent(Autowired.class));
    }
}
