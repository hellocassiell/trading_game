package com.simtrade.backend.service;

import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class MockDataService {
    
    // Mock current market price for ±20 ticks check
    public BigDecimal getCurrentPrice(String stockCode) {
        // Just mock some prices
        if ("00700".equals(stockCode)) return new BigDecimal("300.00");
        if ("09988".equals(stockCode)) return new BigDecimal("70.00");
        return new BigDecimal("10.00");
    }

    // Mock lot size for the stock
    public Integer getLotSize(String stockCode) {
        if ("00700".equals(stockCode)) return 100;
        if ("09988".equals(stockCode)) return 100;
        return 500;
    }

    // Mock tick size based on HKEX rules (simplified)
    public BigDecimal getTickSize(BigDecimal price) {
        if (price.compareTo(new BigDecimal("0.25")) <= 0) return new BigDecimal("0.001");
        if (price.compareTo(new BigDecimal("0.50")) <= 0) return new BigDecimal("0.005");
        if (price.compareTo(new BigDecimal("10.00")) <= 0) return new BigDecimal("0.01");
        if (price.compareTo(new BigDecimal("20.00")) <= 0) return new BigDecimal("0.02");
        if (price.compareTo(new BigDecimal("100.00")) <= 0) return new BigDecimal("0.05");
        if (price.compareTo(new BigDecimal("200.00")) <= 0) return new BigDecimal("0.10");
        if (price.compareTo(new BigDecimal("500.00")) <= 0) return new BigDecimal("0.20");
        if (price.compareTo(new BigDecimal("1000.00")) <= 0) return new BigDecimal("0.50");
        return new BigDecimal("1.00");
    }
}