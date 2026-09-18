package com.meridian.lms.service;

import com.meridian.lms.dto.request.LoanApplicationRequest;
import com.meridian.lms.dto.request.ReviewLoanRequest;
import com.meridian.lms.dto.response.LoanResponse;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.repository.LoanRepository;
import com.meridian.lms.repository.PaymentRepository;
import com.meridian.lms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class LoanServiceTest {

    @Autowired LoanService loanService;
    @Autowired LoanRepository loanRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired UserRepository userRepository;

    private User customer;
    private User employee;

    @BeforeEach
    void setup() {
        paymentRepository.deleteAll();
        loanRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .email("cust@test.com")
                .passwordHash("x")
                .fullName("Cust")
                .role(User.Role.CUSTOMER)
                .creditScore(700)
                .status(User.UserStatus.ACTIVE)
                .build());

        employee = userRepository.save(User.builder()
                .email("emp@test.com")
                .passwordHash("x")
                .fullName("Emp")
                .role(User.Role.EMPLOYEE)
                .creditScore(800)
                .status(User.UserStatus.ACTIVE)
                .build());
    }

    @Test
    void apply_createsLoanInPendingState() {
        LoanResponse response = loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL")
                .amount(new BigDecimal("10000.00"))
                .termMonths(12)
                .purpose("Test")
                .build());

        assertThat(response.getId()).isNotNull();
        assertThat(response.getStatus()).isEqualTo("PENDING");
        assertThat(response.getMonthlyPayment()).isPositive();
        assertThat(response.getTotalPayable()).isGreaterThan(response.getAmount());
    }

    @Test
    void apply_amountAboveMax_throws() {
        assertThatThrownBy(() -> loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL")
                .amount(new BigDecimal("999999.00"))   // max is 50000
                .termMonths(12)
                .build()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Amount must be between");
    }

    @Test
    void apply_termAboveMax_throws() {
        assertThatThrownBy(() -> loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL")
                .amount(new BigDecimal("10000.00"))
                .termMonths(120)   // max is 60
                .build()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Term must be between");
    }

    @Test
    void approve_generatesScheduleAndUpdatesCreditScore() {
        int oldScore = customer.getCreditScore();

        LoanResponse applied = loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL")
                .amount(new BigDecimal("10000.00"))
                .termMonths(12)
                .build());

        loanService.review(employee, applied.getId(),
                ReviewLoanRequest.builder().decision("APPROVE").build());

        Loan loan = loanRepository.findById(applied.getId()).orElseThrow();
        assertThat(loan.getStatus()).isEqualTo(Loan.LoanStatus.ACTIVE);

        // Schedule should have 12 installments
        var schedule = paymentRepository.findByLoanOrderByInstallmentNumberAsc(loan);
        assertThat(schedule).hasSize(12);

        // Credit score bumped by +10
        User updated = userRepository.findById(customer.getId()).orElseThrow();
        assertThat(updated.getCreditScore()).isEqualTo(oldScore + 10);
    }

    @Test
    void reject_updatesStatusAndCreditScore() {
        int oldScore = customer.getCreditScore();

        LoanResponse applied = loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL")
                .amount(new BigDecimal("10000.00"))
                .termMonths(12)
                .build());

        loanService.review(employee, applied.getId(),
                ReviewLoanRequest.builder().decision("REJECT").reason("Bad credit").build());

        Loan loan = loanRepository.findById(applied.getId()).orElseThrow();
        assertThat(loan.getStatus()).isEqualTo(Loan.LoanStatus.REJECTED);
        assertThat(loan.getRejectionReason()).isEqualTo("Bad credit");

        User updated = userRepository.findById(customer.getId()).orElseThrow();
        assertThat(updated.getCreditScore()).isEqualTo(oldScore - 5);
    }

    @Test
    void approve_alreadyApproved_throws() {
        LoanResponse applied = loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL")
                .amount(new BigDecimal("10000.00"))
                .termMonths(12)
                .build());

        loanService.review(employee, applied.getId(),
                ReviewLoanRequest.builder().decision("APPROVE").build());

        // Second approve should fail
        assertThatThrownBy(() -> loanService.review(employee, applied.getId(),
                ReviewLoanRequest.builder().decision("APPROVE").build()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Can only approve");
    }
}