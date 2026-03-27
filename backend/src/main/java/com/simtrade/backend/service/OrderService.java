package com.simtrade.backend.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.simtrade.backend.dto.OrderRequest;
import com.simtrade.backend.entity.Order;

public interface OrderService extends IService<Order> {
    String placeOrder(OrderRequest request);
}