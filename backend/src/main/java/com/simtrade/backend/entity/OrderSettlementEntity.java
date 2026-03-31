package com.simtrade.backend.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("t_order_settlement")
public class OrderSettlementEntity {

    @TableId
    private String orderId;

    private String userId;
    private String stockCode;
    private LocalDate settlementDate;
    private String settlementStatus;
    private Integer matchedQuantity;
    private BigDecimal matchedAmount;
    private BigDecimal totalFee;
    private BigDecimal netCashFlow;
    private LocalDateTime lastMatchedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
