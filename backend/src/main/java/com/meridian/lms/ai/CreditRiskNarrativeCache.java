package com.meridian.lms.ai;

import com.meridian.lms.ai.dto.CustomerCreditProfile;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CreditRiskNarrativeCache {

    private final StringRedisTemplate redisTemplate;
    private final AiProperties properties;

    public CreditRiskNarrativeCache(StringRedisTemplate redisTemplate, AiProperties properties) {
        this.redisTemplate = redisTemplate;
        this.properties = properties;
    }

    public String buildKey(CustomerCreditProfile profile) {
        return "ai:risk:%d:%d:%d".formatted(
                profile.customerId(),
                profile.creditScore(),
                profile.totalLoans()
        );
    }

    public Optional<String> get(String key) {
        return Optional.ofNullable(redisTemplate.opsForValue().get(key));
    }

    public void put(String key, String narrative) {
        redisTemplate.opsForValue().set(key, narrative, properties.cacheTtl());
    }
}