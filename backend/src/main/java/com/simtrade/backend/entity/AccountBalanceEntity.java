package com.simtrade.backend.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_account_balance")
public class AccountBalanceEntity {

    @TableId
    private String userId;

    private BigDecimal availableCash;
    private BigDecimal frozenCash;
    private BigDecimal transitCash;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
