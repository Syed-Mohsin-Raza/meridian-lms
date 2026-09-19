package com.meridian.lms.service;

import com.meridian.lms.AbstractIntegrationTest;
import com.meridian.lms.dto.response.DashboardKpiResponse;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.LoanType;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.*;


@Transactional
class AnalyticsServiceTest extends AbstractIntegrationTest {

    @Autowired AnalyticsService analyticsService;
    @Autowired LoanRepository loanRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired UserRepository userRepository;
    @Autowired LoanTypeRepository loanTypeRepository;
    @Autowired CacheManager cacheManager;

    private User customer;
    private LoanType loanType;

    @BeforeEach
    void setup() {

        cacheManager.getCacheNames().forEach(name -> {
            var cache = cacheManager.getCache(name);
            if (cache != null) cache.clear();
        });

        paymentRepository.deleteAll();
        loanRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .email("analytics@test.com")
                .passwordHash("x")
                .fullName("Analytics Cust")
                .role(User.Role.CUSTOMER)
                .creditScore(700)
                .status(User.UserStatus.ACTIVE)
                .build());

        loanType = loanTypeRepository.findByCode("PERSONAL").orElseThrow();
    }

    @Test
    void dashboard_emptyDatabase_returnsZeros() {
        DashboardKpiResponse kpi = analyticsService.dashboard();
        assertThat(kpi.getTotalLoans()).isZero();
        assertThat(kpi.getTotalRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(kpi.getApprovalRate()).isEqualTo(0.0);
    }

    @Test
    void dashboard_countsActiveLoan() {
        loanRepository.save(Loan.builder()
                .customer(customer).loanType(loanType)
                .amount(new BigDecimal("10000"))
                .termMonths(12).interestRate(new BigDecimal("12.5"))
                .monthlyPayment(new BigDecimal("888"))
                .totalPayable(new BigDecimal("10660"))
                .totalInterest(new BigDecimal("660"))
                .outstandingBalance(new BigDecimal("10660"))
                .status(Loan.LoanStatus.ACTIVE)
                .build());

        DashboardKpiResponse kpi = analyticsService.dashboard();
        assertThat(kpi.getTotalLoans()).isEqualTo(1);
        assertThat(kpi.getActiveLoans()).isEqualTo(1);
    }
}