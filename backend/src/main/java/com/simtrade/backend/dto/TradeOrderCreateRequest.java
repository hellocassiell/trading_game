package com.simtrade.backend.dto;

import lombok.Data;

import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class TradeOrderCreateRequest {
    @NotBlank(message = "Stock code cannot be blank")
    private String stockCode;

    @NotBlank(message = "Direction cannot be blank")
    private String direction;

    @NotBlank(message = "Order type cannot be blank")
    private String orderType;

    @DecimalMin(value = "0.001", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 1, message = "Quantity must be greater than 0")
    private Integer quantity;
}
