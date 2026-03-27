package com.simtrade.backend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("t_order")
public class Order {
    @TableId(type = IdType.ASSIGN_ID)
    private String id;
    
    private String userId;
    private String stockCode;
    
    // 1: Buy, 2: Sell
    private Integer type;
    
    private BigDecimal price;
    private Integer quantity;
    private Integer filledQuantity;
    private BigDecimal filledAvgPrice;
    
    // 0: Pending, 1: Partial Filled, 2: Filled, 3: Canceled, 4: Rejected
    private Integer status;
    
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}