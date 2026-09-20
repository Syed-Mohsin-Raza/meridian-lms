package com.meridian.lms.ai;

import com.meridian.lms.ai.dto.CustomerCreditProfile;
import org.springframework.stereotype.Component;

@Component
public class FallbackNarrativeBuilder {

    public String build(CustomerCreditProfile profile) {
        int score = profile.creditScore();
        double onTimeRate = profile.onTimePaymentRate();
        String tier = profile.creditTier();
        int totalLoans = profile.totalLoans();

        if (score >= 750) {
            return "Low-risk profile (%s tier, score %d). Payment history shows %.1f%% on-time rate across %d loans. No significant risk indicators identified."
                    .formatted(tier, score, onTimeRate, totalLoans);
        } else if (score >= 650) {
            return "Moderate risk profile (%s tier, score %d). On-time payment rate is %.1f%% across %d loans. Loan officer review recommended."
                    .formatted(tier, score, onTimeRate, totalLoans);
        } else {
            return "Elevated risk profile (%s tier, score %d). On-time rate is %.1f%% across %d loans. Manual underwriting required."
                    .formatted(tier, score, onTimeRate, totalLoans);
        }
    }
}