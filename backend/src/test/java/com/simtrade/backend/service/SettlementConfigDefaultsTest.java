package com.simtrade.backend.service;

import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.io.ClassPathResource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Properties;

class SettlementConfigDefaultsTest {

    @Test
    void applicationProd_shouldDisableReadSettlementFallbackByDefault() {
        YamlPropertiesFactoryBean yaml = new YamlPropertiesFactoryBean();
        yaml.setResources(new ClassPathResource("application-prod.yml"));
        Properties properties = yaml.getObject();

        Assertions.assertNotNull(properties);
        Assertions.assertEquals(
                "${APP_SETTLEMENT_READ_FALLBACK_ENABLED:false}",
                properties.getProperty("app.settlement.read-fallback-enabled")
        );
    }

    @Test
    void demoEnvExample_shouldDocumentReadSettlementFallbackAsDisabled() throws Exception {
        Path envPath = Path.of("/Users/liuliu/Desktop/trading_game/deploy/env/backend.demo.env.example");
        String content = Files.readString(envPath);

        Assertions.assertTrue(content.contains("APP_SETTLEMENT_READ_FALLBACK_ENABLED=false"));
    }
}
