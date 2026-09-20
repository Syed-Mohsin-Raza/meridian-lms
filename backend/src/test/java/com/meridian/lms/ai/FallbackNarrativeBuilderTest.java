package com.meridian.lms.ai;

import com.meridian.lms.ai.dto.CustomerCreditProfile;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class FallbackNarrativeBuilderTest {

    private final FallbackNarrativeBuilder builder = new FallbackNarrativeBuilder();

    @Test
    void shouldReturnLowRiskNarrative_whenScoreIsPrime() {
        CustomerCreditProfile profile = profile(780, "PRIME", 5, 100.0);

        String narrative = builder.build(profile);

        assertThat(narrative)
                .contains("Low-risk")
                .contains("PRIME")
                .contains("780")
                .contains("100.0%");
    }

    @Test
    void shouldReturnModerateRiskNarrative_whenScoreIsStandard() {
        CustomerCreditProfile profile = profile(680, "STANDARD", 3, 92.5);

        String narrative = builder.build(profile);

        assertThat(narrative)
                .contains("Moderate risk")
                .contains("STANDARD")
                .contains("680")
                .contains("92.5%")
                .contains("Loan officer review");
    }

    @Test
    void shouldReturnElevatedRiskNarrative_whenScoreIsSubprime() {
        CustomerCreditProfile profile = profile(580, "DEEP_SUBPRIME", 4, 60.0);

        String narrative = builder.build(profile);

        assertThat(narrative)
                .contains("Elevated risk")
                .contains("DEEP_SUBPRIME")
                .contains("580")
                .contains("Manual underwriting required");
    }

    @Test
    void shouldIncludeLoanCount_whenMultipleLoans() {
        CustomerCreditProfile profile = profile(720, "NEAR_PRIME", 8, 95.0);

        String narrative = builder.build(profile);

        assertThat(narrative).contains("8 loans");
    }

    private CustomerCreditProfile profile(int score, String tier, int totalLoans, double onTimeRate) {
        return new CustomerCreditProfile(
                42L,
                score,
                tier,
                totalLoans,
                1,
                0,
                new BigDecimal("25000.00"),
                onTimeRate,
                12,
                new BigDecimal("10000.00")
        );
    }
}