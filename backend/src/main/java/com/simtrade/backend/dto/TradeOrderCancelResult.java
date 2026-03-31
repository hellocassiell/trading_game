package com.simtrade.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TradeOrderCancelResult {
    private String orderId;
    private String status;
    private BigDecimal releasedCash;
    private Integer releasedQuantity;
    private String language;

    @JsonProperty("lang")
    public String getLang() {
        return language;
    }

    @JsonProperty("lang")
    public void setLang(String lang) {
        this.language = lang;
    }
}
