package com.meridian.lms.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;

@ConfigurationProperties(prefix = "meridian.ai")
public record AiProperties(
        String apiKey,
        String model,
        Duration cacheTtl,
        boolean enabled
) {}