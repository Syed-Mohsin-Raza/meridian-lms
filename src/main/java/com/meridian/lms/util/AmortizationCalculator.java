package com.meridian.lms.util;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Calculates loan amortization schedules using standard mortgage formula.

 * Formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 * Where:
 *   M = monthly payment
 *   P = principal
 *   r = monthly interest rate (annual / 12 / 100)
 *   n = number of months
 */
@Component
public class AmortizationCalculator {

    private static final MathContext MC = new MathContext(20, RoundingMode.HALF_EVEN);
    private static final int MONEY_SCALE = 4;
    private static final BigDecimal TWELVE = new BigDecimal("12");
    private static final BigDecimal HUNDRED = new BigDecimal("100");

    /**
     * Calculate the monthly payment for a loan.
     */
    public BigDecimal calculateMonthlyPayment(
            BigDecimal principal,
            BigDecimal annualRatePercent,
            int termMonths) {

        if (principal == null || principal.signum() <= 0) {
            throw new IllegalArgumentException("Principal must be positive");
        }
        if (termMonths <= 0) {
            throw new IllegalArgumentException("Term must be positive");
        }

        // Zero-interest loan: just divide principal by term
        if (annualRatePercent == null || annualRatePercent.signum() == 0) {
            return principal.divide(BigDecimal.valueOf(termMonths), MONEY_SCALE, RoundingMode.HALF_EVEN);
        }

        BigDecimal monthlyRate = annualRatePercent
                .divide(HUNDRED, MC)
                .divide(TWELVE, MC);

        BigDecimal onePlusR = BigDecimal.ONE.add(monthlyRate);
        BigDecimal onePlusRPowN = onePlusR.pow(termMonths, MC);

        // Numerator: P * r * (1+r)^n
        BigDecimal numerator = principal
                .multiply(monthlyRate, MC)
                .multiply(onePlusRPowN, MC);

        // Denominator: (1+r)^n - 1
        BigDecimal denominator = onePlusRPowN.subtract(BigDecimal.ONE);

        return numerator.divide(denominator, MONEY_SCALE, RoundingMode.HALF_EVEN);
    }

    /**
     * Generate a full amortization schedule.
     */
    public List<Installment> generateSchedule(
            BigDecimal principal,
            BigDecimal annualRatePercent,
            int termMonths) {

        BigDecimal monthlyPayment = calculateMonthlyPayment(principal, annualRatePercent, termMonths);
        BigDecimal monthlyRate = (annualRatePercent == null || annualRatePercent.signum() == 0)
                ? BigDecimal.ZERO
                : annualRatePercent.divide(HUNDRED, MC).divide(TWELVE, MC);

        List<Installment> schedule = new ArrayList<>();
        BigDecimal balance = principal;

        for (int i = 1; i <= termMonths; i++) {
            BigDecimal interestPortion = balance.multiply(monthlyRate, MC)
                    .setScale(MONEY_SCALE, RoundingMode.HALF_EVEN);
            BigDecimal principalPortion = monthlyPayment.subtract(interestPortion);

            // Last installment: adjust to clear remaining balance
            if (i == termMonths) {
                principalPortion = balance;
                monthlyPayment = principalPortion.add(interestPortion);
            }

            balance = balance.subtract(principalPortion);

            schedule.add(new Installment(
                    i,
                    monthlyPayment,
                    principalPortion,
                    interestPortion,
                    balance.max(BigDecimal.ZERO)  // guard against tiny negative from rounding
            ));
        }

        return schedule;
    }

    /**
     * Calculate total interest paid over the life of the loan.
     */
    public BigDecimal calculateTotalInterest(
            BigDecimal principal,
            BigDecimal annualRatePercent,
            int termMonths) {

        if (annualRatePercent == null || annualRatePercent.signum() == 0) {
            return BigDecimal.ZERO.setScale(MONEY_SCALE, RoundingMode.HALF_EVEN);
        }

        BigDecimal monthlyPayment = calculateMonthlyPayment(principal, annualRatePercent, termMonths);
        BigDecimal totalPayable = monthlyPayment.multiply(BigDecimal.valueOf(termMonths));
        return totalPayable.subtract(principal).setScale(MONEY_SCALE, RoundingMode.HALF_EVEN);
    }

    /**
     * Calculate total amount payable (principal + interest).
     */
    public BigDecimal calculateTotalPayable(
            BigDecimal principal,
            BigDecimal annualRatePercent,
            int termMonths) {

        return principal.add(calculateTotalInterest(principal, annualRatePercent, termMonths));
    }

    /**
     * Immutable installment record for a schedule.
     */
    public record Installment(
            int number,
            BigDecimal payment,
            BigDecimal principal,
            BigDecimal interest,
            BigDecimal remainingBalance
    ) {}
}