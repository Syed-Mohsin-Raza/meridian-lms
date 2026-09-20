package com.meridian.lms.ai;

import com.meridian.lms.ai.dto.CustomerCreditProfile;
import com.meridian.lms.ai.dto.NarrativeResult;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SpringAiCreditRiskNarrativeService implements CreditRiskNarrativeService {

    private static final Logger log = LoggerFactory.getLogger(SpringAiCreditRiskNarrativeService.class);

    private final ChatClient chatClient;
    private final CreditRiskNarrativeCache cache;
    private final FallbackNarrativeBuilder fallbackBuilder;
    private final AiProperties properties;

    public SpringAiCreditRiskNarrativeService(
            ChatModel chatModel,
            CreditRiskNarrativeCache cache,
            FallbackNarrativeBuilder fallbackBuilder,
            AiProperties properties
    ) {
        this.chatClient = ChatClient.builder(chatModel)
                .defaultSystem("""
                        You are a senior loan officer at a financial institution.
                        Analyze the customer's credit profile and provide a concise
                        2-3 sentence risk assessment. Be direct and factual.
                        Do not offer financial advice. Focus only on observable data.
                        """)
                .build();
        this.cache = cache;
        this.fallbackBuilder = fallbackBuilder;
        this.properties = properties;
    }

    @Override
    @Retry(name = "openAiChat", fallbackMethod = "fallbackNarrative")
    @CircuitBreaker(name = "openAiChat", fallbackMethod = "fallbackNarrative")
    public NarrativeResult generateNarrative(CustomerCreditProfile profile) {
        if (!properties.enabled()) {
            log.debug("AI disabled, using fallback for customer {}", profile.customerId());
            return new NarrativeResult(fallbackBuilder.build(profile), false, true);
        }

        String cacheKey = cache.buildKey(profile);
        Optional<String> cached = cache.get(cacheKey);
        if (cached.isPresent()) {
            log.debug("Cache hit for customer {}", profile.customerId());
            return new NarrativeResult(cached.get(), true, false);
        }

        String prompt = buildPrompt(profile);
        String narrative = chatClient.prompt(prompt)
                .call()
                .content();

        cache.put(cacheKey, narrative);
        log.info("Generated AI narrative for customer {}", profile.customerId());
        return new NarrativeResult(narrative, false, false);
    }

    private NarrativeResult fallbackNarrative(CustomerCreditProfile profile, Exception ex) {
        log.warn("AI narrative failed for customer {}, using template fallback: {}",
                profile.customerId(), ex.getMessage());
        return new NarrativeResult(fallbackBuilder.build(profile), false, true);
    }

    private String buildPrompt(CustomerCreditProfile profile) {
        return """
                Customer Credit Profile:
                - Credit Score: %d (%s)
                - Total Loans: %d (Active: %d, Delinquent: %d)
                - Total Borrowed: $%s
                - On-Time Payment Rate: %.1f%%
                - Average Loan Age: %d months
                - Largest Loan: $%s

                Provide a 2-3 sentence risk assessment.
                """.formatted(
                profile.creditScore(),
                profile.creditTier(),
                profile.totalLoans(),
                profile.activeLoans(),
                profile.delinquentLoans(),
                profile.totalBorrowed(),
                profile.onTimePaymentRate(),
                profile.averageLoanAgeMonths(),
                profile.largestLoanAmount()
        );
    }
}