package com.simtrade.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_account_position")
public class AccountPositionEntity {

    @TableId(type = IdType.AUTO)
    private Long id;

    private String userId;
    private String stockCode;
    private Integer tradableQuantity;
    private Integer frozenQuantity;
    private Integer transitQuantity;
    private BigDecimal totalCost;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
