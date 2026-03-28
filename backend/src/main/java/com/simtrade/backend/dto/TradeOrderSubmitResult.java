package com.simtrade.backend.dto;

import lombok.Data;

import java.util.List;

@Data
public class TradeOrderSubmitResult {
    private String orderId;
    private String status;
    private Boolean tradableNow;
    private String validityType;
    private String validUntil;
    private String validityNote;
    private List<String> successActions;
}
