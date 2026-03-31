package com.simtrade.backend.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class MarketData {
    private String stockCode;
    private Long timestamp;
    // Nominal price from quote push, preferred for matching
    private BigDecimal nominalPrice;
    // Optional last traded price fallback
    private BigDecimal lastPrice;
    
    // Ask/Offer Book data
    private List<Level> asks; // Sell orders
    private List<Level> bids; // Buy orders

    @Data
    public static class Level {
        private BigDecimal price;
        private Integer volume;
    }
}
