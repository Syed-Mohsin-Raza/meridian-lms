package com.meridian.lms.service;

import com.meridian.lms.AbstractIntegrationTest;
import com.meridian.lms.dto.request.LoanApplicationRequest;
import com.meridian.lms.dto.request.ReviewLoanRequest;
import com.meridian.lms.dto.response.LoanResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

import static org.assertj.core.api.Assertions.*;

//@Transactional
class AuditServiceTest extends AbstractIntegrationTest {

    @Autowired LoanService loanService;
    @Autowired AuditService auditService;
    @Autowired UserRepository userRepository;
    @Autowired LoanRepository loanRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired PermissionRepository permissionRepository;
    @Autowired CacheManager cacheManager;

    private User customer;
    private User employee;

    @BeforeEach
    void setup() {
        cacheManager.getCacheNames().forEach(n -> {
            var c = cacheManager.getCache(n);
            if (c != null) c.clear();
        });
        permissionRepository.deleteAll();
        paymentRepository.deleteAll();
        loanRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .email("audit-cust@test.com").passwordHash("x").fullName("Cust")
                .role(User.Role.CUSTOMER).creditScore(700).status(User.UserStatus.ACTIVE).build());

        employee = userRepository.save(User.builder()
                .email("audit-emp@test.com").passwordHash("x").fullName("Emp")
                .role(User.Role.EMPLOYEE).creditScore(800).status(User.UserStatus.ACTIVE).build());

        // Simulate authenticated employee for Envers listener
        UserDetails principal = org.springframework.security.core.userdetails.User
                .withUsername(employee.getEmail()).password("x")
                .authorities(new SimpleGrantedAuthority("ROLE_EMPLOYEE")).build();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities())
        );
    }

    @Test
    void loanHistory_containsAllStateChanges() {
        LoanResponse applied = loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL").amount(new BigDecimal("5000")).termMonths(6).build());

        loanService.review(employee, applied.getId(),
                ReviewLoanRequest.builder().decision("APPROVE").build());

        var history = auditService.loanHistory(applied.getId());

        // Should have at least 2 revisions: INSERT (application) and UPDATE (approval)
        assertThat(history).hasSizeGreaterThanOrEqualTo(2);

        // First entry: creation
        var first = history.get(0);
        assertThat(first.revisionType()).isEqualTo("ADD");
        assertThat(first.entity().getStatus()).isEqualTo(com.meridian.lms.entity.Loan.LoanStatus.PENDING);

        // Last entry: approved
        var last = history.get(history.size() - 1);
        assertThat(last.revisionType()).isEqualTo("MOD");
        assertThat(last.entity().getStatus()).isEqualTo(com.meridian.lms.entity.Loan.LoanStatus.ACTIVE);
    }

    @Test
    void loanHistory_noRevisions_throws() {
        assertThatThrownBy(() -> auditService.loanHistory(999999L))
                .isInstanceOf(com.meridian.lms.exception.NotFoundException.class);
    }
}