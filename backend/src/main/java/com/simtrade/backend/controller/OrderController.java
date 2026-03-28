package com.simtrade.backend.controller;

import com.simtrade.backend.common.Result;
import com.simtrade.backend.dto.OrderRequest;
import com.simtrade.backend.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public Result<String> placeOrder(@Validated @RequestBody OrderRequest request) {
        String orderId = orderService.placeOrder(request);
        return Result.success(orderId);
    }
}
