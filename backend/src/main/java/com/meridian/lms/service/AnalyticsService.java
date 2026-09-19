package com.meridian.lms.service;

import com.meridian.lms.dto.response.*;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.LoanRepository;
import com.meridian.lms.repository.PaymentRepository;
import com.meridian.lms.repository.UserRepository;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    private final LoanRepository loanRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public AnalyticsService(LoanRepository loanRepository,
                            PaymentRepository paymentRepository,
                            UserRepository userRepository) {
        this.loanRepository = loanRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }


    @Cacheable("analytics:dashboard")
    public DashboardKpiResponse dashboard() {
        long total = loanRepository.count();
        long pending = loanRepository.countByStatus(Loan.LoanStatus.PENDING)
                + loanRepository.countByStatus(Loan.LoanStatus.UNDER_REVIEW);
        long active = loanRepository.countByStatus(Loan.LoanStatus.ACTIVE);
        long completed = loanRepository.countByStatus(Loan.LoanStatus.COMPLETED);
        long rejected = loanRepository.countByStatus(Loan.LoanStatus.REJECTED);

        long totalCustomers = userRepository.countByRole(User.Role.CUSTOMER);

        BigDecimal disbursed = loanRepository.sumDisbursedAmount();
        BigDecimal outstanding = loanRepository.sumOutstandingBalance();

        BigDecimal interest = paymentRepository.sumInterestRevenue();
        BigDecimal lateFees = paymentRepository.sumLateFees();
        BigDecimal revenue = interest.add(lateFees);

        long decided = active + completed + rejected;
        double approvalRate = decided == 0 ? 0.0
                : (double) (active + completed) / decided;

        return DashboardKpiResponse.builder()
                .totalLoans(total)
                .pendingLoans(pending)
                .activeLoans(active)
                .completedLoans(completed)
                .rejectedLoans(rejected)
                .totalCustomers(totalCustomers)
                .totalDisbursed(disbursed)
                .totalOutstanding(outstanding)
                .totalRevenue(revenue)
                .approvalRate(round(approvalRate * 100, 1))
                .build();
    }



    @Cacheable(value = "analytics:trends", key = "#months")
    public List<TrendPoint> trends(int months) {
        LocalDateTime since = LocalDateTime.now().minusMonths(months);
        List<Object[]> rows = loanRepository.monthlyTrends(since);
        List<TrendPoint> points = new ArrayList<>();
        for (Object[] r : rows) {
            points.add(TrendPoint.builder()
                    .period((String) r[0])
                    .applications(((Number) r[1]).longValue())
                    .approvals(((Number) r[2]).longValue())
                    .rejections(((Number) r[3]).longValue())
                    .build());
        }
        return points;
    }


    @Cacheable(value = "analytics:revenue", key = "#months")
    public List<RevenuePoint> revenue(int months) {
        LocalDateTime since = LocalDateTime.now().minusMonths(months);
        List<Object[]> rows = paymentRepository.monthlyRevenue(since);
        List<RevenuePoint> points = new ArrayList<>();
        for (Object[] r : rows) {
            BigDecimal interest = toBigDecimal(r[1]);
            BigDecimal lateFees = toBigDecimal(r[2]);
            points.add(RevenuePoint.builder()
                    .period((String) r[0])
                    .interestRevenue(interest)
                    .lateFees(lateFees)
                    .total(interest.add(lateFees))
                    .build());
        }
        return points;
    }


    @Cacheable("analytics:loan-types")
    public List<LoanTypeBreakdown> loanTypeBreakdown() {
        List<Object[]> rows = loanRepository.loanTypeBreakdown();
        List<LoanTypeBreakdown> items = new ArrayList<>();
        for (Object[] r : rows) {
            items.add(LoanTypeBreakdown.builder()
                    .code((String) r[0])
                    .name((String) r[1])
                    .count(((Number) r[2]).longValue())
                    .totalDisbursed(toBigDecimal(r[3]))
                    .approvalRate(round(((Number) r[4]).doubleValue() * 100, 1))
                    .build());
        }
        return items;
    }

    private BigDecimal toBigDecimal(Object o) {
        if (o == null) return BigDecimal.ZERO;
        if (o instanceof BigDecimal bd) return bd;
        return new BigDecimal(o.toString());
    }

    private double round(double value, int places) {
        return BigDecimal.valueOf(value)
                .setScale(places, RoundingMode.HALF_EVEN)
                .doubleValue();
    }

}