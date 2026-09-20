package com.meridian.lms.ai;

import com.meridian.lms.ai.dto.CustomerCreditProfile;
import com.meridian.lms.ai.dto.NarrativeResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.ai.chat.model.ChatModel;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SpringAiCreditRiskNarrativeServiceTest {

    @Mock
    private CreditRiskNarrativeCache cache;

    @Mock
    private FallbackNarrativeBuilder fallbackBuilder;

    private SpringAiCreditRiskNarrativeService service;

    @BeforeEach
    void setUp() {
        AiProperties properties = new AiProperties("test-key", "gpt-4o-mini", Duration.ofHours(24), true);
        // Use a mock ChatModel — the ChatClient will be built inside the constructor
        // but never invoked in tests that exercise cache/disabled paths.
        ChatModel unusedModel = mock(ChatModel.class);
        lenient().when(fallbackBuilder.build(any())).thenReturn("fallback text");
        service = new SpringAiCreditRiskNarrativeService(unusedModel, cache, fallbackBuilder, properties);
    }

    @Test
    void shouldReturnCachedNarrative_whenCacheHit() {
        CustomerCreditProfile profile = sampleProfile();
        when(cache.buildKey(profile)).thenReturn("key-1");
        when(cache.get("key-1")).thenReturn(Optional.of("Cached narrative"));

        NarrativeResult result = service.generateNarrative(profile);

        assertThat(result.narrative()).isEqualTo("Cached narrative");
        assertThat(result.cached()).isTrue();
        assertThat(result.fallbackUsed()).isFalse();
        verify(fallbackBuilder, never()).build(any());
    }

    @Test
    void shouldReturnFallback_whenAiDisabled() {
        AiProperties disabled = new AiProperties("test-key", "gpt-4o-mini", Duration.ofHours(24), false);
        ChatModel unusedModel = mock(ChatModel.class);
        SpringAiCreditRiskNarrativeService disabledService =
                new SpringAiCreditRiskNarrativeService(unusedModel, cache, fallbackBuilder, disabled);

        CustomerCreditProfile profile = sampleProfile();
        when(fallbackBuilder.build(profile)).thenReturn("Template narrative");

        NarrativeResult result = disabledService.generateNarrative(profile);

        assertThat(result.narrative()).isEqualTo("Template narrative");
        assertThat(result.fallbackUsed()).isTrue();
        assertThat(result.cached()).isFalse();
        verify(cache, never()).get(anyString());
    }

    private CustomerCreditProfile sampleProfile() {
        return new CustomerCreditProfile(
                2L,
                650,
                "STANDARD",
                1,
                0,
                0,
                new BigDecimal("5000.00"),
                100.0,
                3,
                new BigDecimal("5000.00")
        );
    }
}