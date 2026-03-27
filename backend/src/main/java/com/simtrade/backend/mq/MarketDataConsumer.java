package com.simtrade.backend.mq;

import com.alibaba.fastjson.JSON;
import com.simtrade.backend.config.RabbitMQConfig;
import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.service.MatchingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class MarketDataConsumer {

    @Autowired
    private MatchingService matchingService;

    @RabbitListener(queues = RabbitMQConfig.MARKET_DATA_QUEUE)
    public void receiveMarketData(String message) {
        try {
            MarketData marketData = JSON.parseObject(message, MarketData.class);
            log.info("Received market data for stock: {}", marketData.getStockCode());
            
            // Trigger order matching
            matchingService.matchOrders(marketData);
            
        } catch (Exception e) {
            log.error("Failed to process market data: {}", message, e);
        }
    }
}