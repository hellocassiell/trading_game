package com.simtrade.backend.service;

import com.simtrade.backend.dto.MarketData;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

class MarketDataRealtimeServiceTest {

    @Test
    void publish_shouldIgnoreOlderTimestampUpdate() {
        MarketDataRealtimeService service = new MarketDataRealtimeService();

        MarketData first = new MarketData();
        first.setStockCode("00700");
        first.setNominalPrice(new BigDecimal("300.00"));
        first.setTimestamp(1_800_000L);
        MarketDataRealtimeService.QuoteSnapshot firstSnapshot = service.publish(first);

        MarketData stale = new MarketData();
        stale.setStockCode("00700");
        stale.setNominalPrice(new BigDecimal("301.00"));
        stale.setTimestamp(1_700_000L);
        MarketDataRealtimeService.QuoteSnapshot staleSnapshot = service.publish(stale);

        MarketDataRealtimeService.QuoteSnapshot latest = service.getLatestSnapshot("00700");
        Assertions.assertNotNull(firstSnapshot);
        Assertions.assertNull(staleSnapshot);
        Assertions.assertNotNull(latest);
        Assertions.assertEquals(new BigDecimal("300.00"), latest.getNominalPrice());
    }

    @Test
    void publish_shouldIgnoreEqualTimestampUpdate() {
        MarketDataRealtimeService service = new MarketDataRealtimeService();

        MarketData first = new MarketData();
        first.setStockCode("00700");
        first.setNominalPrice(new BigDecimal("300.00"));
        first.setTimestamp(2_000_000L);
        service.publish(first);

        MarketData duplicate = new MarketData();
        duplicate.setStockCode("00700");
        duplicate.setNominalPrice(new BigDecimal("299.00"));
        duplicate.setTimestamp(2_000_000L);
        MarketDataRealtimeService.QuoteSnapshot duplicateSnapshot = service.publish(duplicate);

        MarketDataRealtimeService.QuoteSnapshot latest = service.getLatestSnapshot("00700");
        Assertions.assertNull(duplicateSnapshot);
        Assertions.assertNotNull(latest);
        Assertions.assertEquals(new BigDecimal("300.00"), latest.getNominalPrice());
    }
}
