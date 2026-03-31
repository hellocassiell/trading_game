package com.simtrade.backend.mq;

import com.google.protobuf.CodedOutputStream;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.core.MessageProperties;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@ConditionalOnProperty(prefix = "aob.subscription", name = "enabled", havingValue = "true")
public class AobSubscriptionPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${aob.subscription.exchange:subscribe.exchange}")
    private String subscribeExchange;

    @Value("${aob.subscription.routing-key:subscribe.key}")
    private String subscribeRoutingKey;

    @Value("${aob.subscription.asset-ids:00700.HK,02800.HK,0388.HK,2800.HK}")
    private String assetIdsRaw;

    @Value("${aob.subscription.command-code:1}")
    private int commandCode;

    @Value("${aob.subscription.market-type-hk:1}")
    private int marketTypeHk;

    @Value("${aob.subscription.quote-level-lv2:2}")
    private int quoteLevelLv2;

    @Value("${aob.subscription.type:0}")
    private int subscribeType;

    public AobSubscriptionPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void onApplicationReady() {
        List<String> assetIds = parseAssetIds(assetIdsRaw);
        if (assetIds.isEmpty()) {
            log.warn("AOB subscription skipped: no asset ids configured.");
            return;
        }

        try {
            byte[] payload = buildSubscribePayload(assetIds);
            MessageProperties properties = new MessageProperties();
            properties.setContentType(MessageProperties.CONTENT_TYPE_BYTES);
            Message message = new Message(payload, properties);
            rabbitTemplate.send(subscribeExchange, subscribeRoutingKey, message);
            log.info("AOB subscription published. exchange={}, routingKey={}, assets={}",
                    subscribeExchange, subscribeRoutingKey, assetIds);
        } catch (Exception ex) {
            log.error("Failed to publish AOB subscription.", ex);
        }
    }

    private byte[] buildSubscribePayload(List<String> assetIds) throws Exception {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        CodedOutputStream coded = CodedOutputStream.newInstance(outputStream);

        // repeated BizCommand command = 1;
        coded.writeEnum(1, commandCode);

        // repeated string assetId = 2;
        for (String assetId : assetIds) {
            coded.writeString(2, assetId);
        }

        // repeated MarketQuoteLevel quoteLevel = 3;
        ByteArrayOutputStream quoteLevelStream = new ByteArrayOutputStream();
        CodedOutputStream quoteLevel = CodedOutputStream.newInstance(quoteLevelStream);
        quoteLevel.writeEnum(1, marketTypeHk);
        quoteLevel.writeEnum(2, quoteLevelLv2);
        quoteLevel.flush();
        coded.writeByteArray(3, quoteLevelStream.toByteArray());

        // optional uint32 type = 6;
        coded.writeUInt32(6, subscribeType);

        // optional string channelId = 7;
        coded.writeString(7, "simtrade-" + UUID.randomUUID());

        coded.flush();
        return outputStream.toByteArray();
    }

    private List<String> parseAssetIds(String raw) {
        List<String> result = new ArrayList<String>();
        if (raw == null || raw.trim().isEmpty()) {
            return result;
        }
        String[] parts = raw.split(",");
        for (String part : parts) {
            if (part == null) {
                continue;
            }
            String value = part.trim().toUpperCase();
            if (!value.isEmpty()) {
                result.add(value);
            }
        }
        return result;
    }
}

