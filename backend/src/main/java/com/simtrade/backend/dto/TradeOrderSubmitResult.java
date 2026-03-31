package com.simtrade.backend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
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
