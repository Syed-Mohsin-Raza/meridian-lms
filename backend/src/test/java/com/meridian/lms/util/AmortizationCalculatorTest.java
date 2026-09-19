package com.meridian.lms.util;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

class AmortizationCalculatorTest {

    private AmortizationCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new AmortizationCalculator();
    }

    @Test
    @DisplayName("Zero-interest loan: payment = principal / term")
    void zeroInterestLoan() {
        BigDecimal payment = calculator.calculateMonthlyPayment(
                new BigDecimal("1200.00"),
                BigDecimal.ZERO,
                12
        );

        assertThat(payment).isEqualByComparingTo("100.0000");
    }

    @Test
    @DisplayName("Standard loan: 10k at 12% for 12 months")
    void standardLoan() {
        // Known value: 10000, 12% annual, 12 months → 888.4879 per month
        BigDecimal payment = calculator.calculateMonthlyPayment(
                new BigDecimal("10000.00"),
                new BigDecimal("12.00"),
                12
        );

        // Allow 0.01 tolerance for rounding differences
        assertThat(payment).isCloseTo(
                new BigDecimal("888.4879"),
                within(new BigDecimal("0.01"))
        );
    }

    @Test
    @DisplayName("30-year mortgage: 300k at 6% → ~1798.65/month")
    void thirtyYearMortgage() {
        BigDecimal payment = calculator.calculateMonthlyPayment(
                new BigDecimal("300000.00"),
                new BigDecimal("6.00"),
                360
        );

        assertThat(payment).isCloseTo(
                new BigDecimal("1798.6516"),
                within(new BigDecimal("0.01"))
        );
    }

    @Test
    @DisplayName("Schedule has exactly termMonths installments")
    void scheduleLength() {
        List<AmortizationCalculator.Installment> schedule = calculator.generateSchedule(
                new BigDecimal("10000.00"),
                new BigDecimal("12.00"),
                12
        );

        assertThat(schedule).hasSize(12);
    }

    @Test
    @DisplayName("Schedule: final installment leaves zero balance")
    void scheduleFinalBalance() {
        List<AmortizationCalculator.Installment> schedule = calculator.generateSchedule(
                new BigDecimal("10000.00"),
                new BigDecimal("12.00"),
                12
        );

        AmortizationCalculator.Installment last = schedule.get(schedule.size() - 1);
        assertThat(last.remainingBalance()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("30-year mortgage: first installment has more interest than principal")
    void scheduleFirstInstallmentMostlyInterest() {
        List<AmortizationCalculator.Installment> schedule = calculator.generateSchedule(
                new BigDecimal("300000.00"),
                new BigDecimal("6.00"),
                360
        );

        AmortizationCalculator.Installment first = schedule.get(0);
        assertThat(first.interest()).isGreaterThan(first.principal());
    }

    @Test
    @DisplayName("30-year mortgage: last installment has more principal than interest")
    void scheduleLastInstallmentMostlyPrincipal() {
        List<AmortizationCalculator.Installment> schedule = calculator.generateSchedule(
                new BigDecimal("300000.00"),
                new BigDecimal("6.00"),
                360
        );

        AmortizationCalculator.Installment last = schedule.get(schedule.size() - 1);
        assertThat(last.principal()).isGreaterThan(last.interest());
    }

    @Test
    @DisplayName("Schedule: principal portions sum to original principal")
    void schedulePrincipalSumEqualsPrincipal() {
        BigDecimal principal = new BigDecimal("10000.00");
        List<AmortizationCalculator.Installment> schedule = calculator.generateSchedule(
                principal,
                new BigDecimal("12.00"),
                12
        );

        BigDecimal principalSum = schedule.stream()
                .map(AmortizationCalculator.Installment::principal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        assertThat(principalSum).isEqualByComparingTo(principal);
    }

    @Test
    @DisplayName("Total interest is positive for interest-bearing loan")
    void totalInterestPositive() {
        BigDecimal totalInterest = calculator.calculateTotalInterest(
                new BigDecimal("10000.00"),
                new BigDecimal("12.00"),
                12
        );

        assertThat(totalInterest).isGreaterThan(BigDecimal.ZERO);
        assertThat(totalInterest).isCloseTo(
                new BigDecimal("661.86"),
                within(new BigDecimal("1.00"))
        );
    }

    @Test
    @DisplayName("Total interest is zero for zero-interest loan")
    void totalInterestZeroForZeroRate() {
        BigDecimal totalInterest = calculator.calculateTotalInterest(
                new BigDecimal("10000.00"),
                BigDecimal.ZERO,
                12
        );

        assertThat(totalInterest).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Negative principal throws IllegalArgumentException")
    void negativePrincipalThrows() {
        assertThatThrownBy(() -> calculator.calculateMonthlyPayment(
                new BigDecimal("-1000.00"),
                new BigDecimal("12.00"),
                12
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Principal must be positive");
    }

    @Test
    @DisplayName("Zero term throws IllegalArgumentException")
    void zeroTermThrows() {
        assertThatThrownBy(() -> calculator.calculateMonthlyPayment(
                new BigDecimal("10000.00"),
                new BigDecimal("12.00"),
                0
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Term must be positive");
    }
}