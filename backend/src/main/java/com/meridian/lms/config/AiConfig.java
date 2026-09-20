package com.meridian.lms.config;

import com.meridian.lms.ai.AiProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(AiProperties.class)
public class AiConfig {
    // ChatClient is built inside the service constructor
    // because it needs the injected ChatModel bean.
}