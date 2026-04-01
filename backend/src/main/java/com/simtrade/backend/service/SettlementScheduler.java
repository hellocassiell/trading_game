package com.simtrade.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneId;

@Component
@ConditionalOnProperty(
        prefix = "app.settlement.scheduler",
        name = "enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class SettlementScheduler {

    static final ZoneId HK_ZONE = ZoneId.of("Asia/Hong_Kong");

    private static final Logger log = LoggerFactory.getLogger(SettlementScheduler.class);

    private final AccountLedgerService accountLedgerService;
    private final Clock clock;

    @Autowired
    public SettlementScheduler(AccountLedgerService accountLedgerService) {
        this(accountLedgerService, Clock.system(HK_ZONE));
    }

    SettlementScheduler(AccountLedgerService accountLedgerService, Clock clock) {
        this.accountLedgerService = accountLedgerService;
        this.clock = clock;
    }

    @Scheduled(
            cron = "${app.settlement.scheduler.cron:0 5 6 * * *}",
            zone = "${app.settlement.scheduler.zone:Asia/Hong_Kong}"
    )
    public void runDailySettlement() {
        LocalDate settlementDate = LocalDate.now(clock.withZone(HK_ZONE));
        log.info("Running scheduled settlement for date={}", settlementDate);
        accountLedgerService.processSettlements(settlementDate);
    }
}
