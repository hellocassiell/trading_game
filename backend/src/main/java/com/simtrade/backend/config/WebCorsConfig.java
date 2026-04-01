package com.simtrade.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    private final String[] allowedOriginPatterns;

    public WebCorsConfig(
            @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origin-patterns:http://localhost:*,http://127.0.0.1:*}")
            String allowedOriginPatternsValue
    ) {
        this.allowedOriginPatterns = Arrays.stream(allowedOriginPatternsValue.split(","))
                .map(String::trim)
                .filter(value -> !value.isEmpty())
                .toArray(String[]::new);
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(allowedOriginPatterns)
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders(
                        "Content-Type",
                        "X-User-Id",
                        "Authorization",
                        "X-Lang",
                        "lang",
                        "Accept-Language"
                )
                .allowCredentials(true)
                .maxAge(3600);
    }
}
