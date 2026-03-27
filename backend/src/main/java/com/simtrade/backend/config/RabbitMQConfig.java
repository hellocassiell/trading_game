package com.simtrade.backend.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String MARKET_DATA_EXCHANGE = "market.data.exchange";
    public static final String MARKET_DATA_QUEUE = "market.data.queue";
    public static final String MARKET_DATA_ROUTING_KEY = "market.data.routing.key";

    @Bean
    public DirectExchange marketDataExchange() {
        return new DirectExchange(MARKET_DATA_EXCHANGE);
    }

    @Bean
    public Queue marketDataQueue() {
        return new Queue(MARKET_DATA_QUEUE, true);
    }

    @Bean
    public Binding marketDataBinding(Queue marketDataQueue, DirectExchange marketDataExchange) {
        return BindingBuilder.bind(marketDataQueue).to(marketDataExchange).with(MARKET_DATA_ROUTING_KEY);
    }
}