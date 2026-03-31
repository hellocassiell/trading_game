package com.simtrade.backend.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_order_reservation")
public class OrderReservationEntity {

    @TableId
    private String orderId;

    private String userId;
    private String stockCode;
    private Integer type;
    private Integer remainingQuantity;
    private BigDecimal remainingReservedCash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
