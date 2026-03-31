package com.simtrade.backend.mq;

import com.alibaba.fastjson.JSON;
import com.simtrade.backend.dto.MarketData;
import com.simtrade.backend.service.MarketDataRealtimeService;
import com.simtrade.backend.service.MatchingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Slf4j
@Component
public class MarketDataConsumer {

    @Autowired
    private MatchingService matchingService;

    @Autowired
    private MarketDataRealtimeService marketDataRealtimeService;

    @Autowired
    private AobProtobufMarketDataDecoder aobProtobufMarketDataDecoder;

    @RabbitListener(queues = "${aob.mq.quote-queue:market.data.queue}")
    public void receiveMarketData(Message message) {
        try {
            MarketData marketData = decodeMessage(message);
            if (marketData == null || marketData.getStockCode() == null || marketData.getStockCode().trim().isEmpty()) {
                log.warn("Skip market data message due to unsupported payload format.");
                return;
            }
            log.info("Received market data for stock: {}", marketData.getStockCode());
            MarketDataRealtimeService.QuoteSnapshot snapshot = marketDataRealtimeService.publish(marketData);
            if (snapshot != null) {
                // Trigger order matching on accepted fresh quotes only.
                matchingService.matchOrders(marketData);
            }

        } catch (Exception e) {
            log.error("Failed to process market data message.", e);
        }
    }

    private MarketData decodeMessage(Message message) {
        if (message == null || message.getBody() == null || message.getBody().length == 0) {
            return null;
        }

        byte[] body = message.getBody();
        MessageProperties properties = message.getMessageProperties();
        String contentType = properties == null ? null : properties.getContentType();

        if (isLikelyJson(body, contentType)) {
            MarketData json = tryParseJson(body);
            if (json != null) {
                return json;
            }
        }

        Optional<MarketData> protobuf = aobProtobufMarketDataDecoder.decode(body);
        if (protobuf.isPresent()) {
            return protobuf.get();
        }

        return tryParseJson(body);
    }

    private MarketData tryParseJson(byte[] body) {
        try {
            String text = new String(body, StandardCharsets.UTF_8);
            return JSON.parseObject(text, MarketData.class);
        } catch (Exception ignored) {
            return null;
        }
    }

    private boolean isLikelyJson(byte[] body, String contentType) {
        if (contentType != null) {
            String normalized = contentType.toLowerCase();
            if (normalized.contains("json") || normalized.contains("text")) {
                return true;
            }
        }
        String text = new String(body, StandardCharsets.UTF_8).trim();
        return text.startsWith("{") || text.startsWith("[");
    }
}
