package com.simtrade.backend.dto;

import lombok.Data;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.math.BigDecimal;

@Data
public class OrderRequest {
    @NotBlank(message = "User ID cannot be blank")
    private String userId;

    @NotBlank(message = "Stock code cannot be blank")
    private String stockCode;

    @NotNull(message = "Order type cannot be null")
    private Integer type; // 1: Buy, 2: Sell

    @NotNull(message = "Price cannot be null")
    @DecimalMin(value = "0.001", message = "Price must be greater than 0")
    private BigDecimal price;

    @NotNull(message = "Quantity cannot be null")
    @Min(value = 1, message = "Quantity must be greater than 0")
    private Integer quantity;
}