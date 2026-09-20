package com.meridian.lms.ai;

import com.meridian.lms.ai.dto.CustomerCreditProfile;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.Payment;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.NotFoundException;
import com.meridian.lms.repository.LoanRepository;
import com.meridian.lms.repository.PaymentRepository;
import com.meridian.lms.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Objects;

@Component
public class CreditProfileAggregator {

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final PaymentRepository paymentRepository;

    public CreditProfileAggregator(
            UserRepository userRepository,
            LoanRepository loanRepository,
            PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.loanRepository = loanRepository;
        this.paymentRepository = paymentRepository;
    }

    public CustomerCreditProfile aggregate(Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + customerId));

        List<Loan> loans = loanRepository.findByCustomerOrderByAppliedAtDesc(customer);
        List<Payment> payments = paymentRepository.findByCustomer(customer);

        int totalLoans = loans.size();
        int activeLoans = (int) loans.stream()
                .filter(l -> l.getStatus() == Loan.LoanStatus.ACTIVE)
                .count();
        int delinquentLoans = (int) loans.stream()
                .filter(l -> l.getStatus() == Loan.LoanStatus.DEFAULTED)
                .count();

        BigDecimal totalBorrowed = loans.stream()
                .map(Loan::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal largestLoan = loans.stream()
                .map(Loan::getAmount)
                .filter(Objects::nonNull)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        double onTimeRate = computeOnTimePaymentRate(payments);
        int avgLoanAgeMonths = computeAverageLoanAgeMonths(loans);
        int creditScore = customer.getCreditScore() != null ? customer.getCreditScore() : 650;
        String creditTier = tierFor(creditScore);

        return new CustomerCreditProfile(
                customerId,
                creditScore,
                creditTier,
                totalLoans,
                activeLoans,
                delinquentLoans,
                totalBorrowed.setScale(2, RoundingMode.HALF_UP),
                round1(onTimeRate),
                avgLoanAgeMonths,
                largestLoan.setScale(2, RoundingMode.HALF_UP)
        );
    }

    /**
     * A payment is on-time if it was PAID and paidAt <= dueDate.
     * PENDING payments are excluded from the denominator — they're not yet due.
     * OVERDUE and PARTIAL count as late.
     */
    private double computeOnTimePaymentRate(List<Payment> payments) {
        List<Payment> settled = payments.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID
                        || p.getStatus() == Payment.PaymentStatus.OVERDUE
                        || p.getStatus() == Payment.PaymentStatus.PARTIAL)
                .toList();

        if (settled.isEmpty()) return 100.0;

        long onTime = settled.stream()
                .filter(p -> p.getStatus() == Payment.PaymentStatus.PAID
                        && p.getPaidAt() != null
                        && p.getDueDate() != null
                        && !p.getPaidAt().toLocalDate().isAfter(p.getDueDate()))
                .count();

        return (onTime * 100.0) / settled.size();
    }

    private int computeAverageLoanAgeMonths(List<Loan> loans) {
        if (loans.isEmpty()) return 0;
        LocalDate now = LocalDate.now();
        long totalMonths = loans.stream()
                .filter(l -> l.getAppliedAt() != null)
                .mapToLong(l -> ChronoUnit.MONTHS.between(
                        l.getAppliedAt().toLocalDate(), now))
                .sum();
        return (int) (totalMonths / loans.size());
    }

    private String tierFor(int score) {
        if (score >= 750) return "PRIME";
        if (score >= 700) return "NEAR_PRIME";
        if (score >= 650) return "STANDARD";
        if (score >= 600) return "SUBPRIME";
        return "DEEP_SUBPRIME";
    }

    private double round1(double value) {
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }
}