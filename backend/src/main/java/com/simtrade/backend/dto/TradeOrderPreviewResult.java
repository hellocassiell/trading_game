package com.simtrade.backend.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TradeOrderPreviewResult {
    private String stockCode;
    private String stockName;
    private String direction;
    private String orderType;
    private BigDecimal price;
    private Integer quantity;
    private Integer lots;
    private BigDecimal estimatedAmount;
    private BigDecimal estimatedFee;
    private BigDecimal estimatedTotalCost;
    private BigDecimal estimatedNetProceeds;
    private BigDecimal currentPrice;
    private BigDecimal tickSize;
    private BigDecimal limitPriceMin;
    private BigDecimal limitPriceMax;
    private Boolean tradableNow;
    private String validityType;
    private String validUntil;
    private String validityNote;
    private List<String> successActions;
}
