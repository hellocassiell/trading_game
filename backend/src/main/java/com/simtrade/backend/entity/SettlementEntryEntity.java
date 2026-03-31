package com.simtrade.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@TableName("t_settlement_entry")
public class SettlementEntryEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String orderId;
    private String userId;
    private String stockCode;
    private Integer type;
    private Integer quantity;
    private BigDecimal cashAmount;
    private LocalDate settlementDate;
    private Integer settled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
