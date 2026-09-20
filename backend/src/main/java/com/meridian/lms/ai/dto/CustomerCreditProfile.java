package com.meridian.lms.ai.dto;

import java.math.BigDecimal;

public record CustomerCreditProfile(
        Long customerId,
        int creditScore,
        String creditTier,
        int totalLoans,
        int activeLoans,
        int delinquentLoans,
        BigDecimal totalBorrowed,
        double onTimePaymentRate,
        int averageLoanAgeMonths,
        BigDecimal largestLoanAmount
) {}