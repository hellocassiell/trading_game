package com.simtrade.backend.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class TradeOrderCancelResult {
    private String orderId;
    private String status;
    private BigDecimal releasedCash;
    private Integer releasedQuantity;
}
