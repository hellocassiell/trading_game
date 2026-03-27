package com.simtrade.backend.service;

import com.simtrade.backend.dto.MarketData;

public interface MatchingService {
    void matchOrders(MarketData marketData);
}