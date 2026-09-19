package com.meridian.lms.service;

import com.meridian.lms.AbstractIntegrationTest;
import com.meridian.lms.dto.request.LoanApplicationRequest;
import com.meridian.lms.dto.request.PaymentRequest;
import com.meridian.lms.dto.request.ReviewLoanRequest;
import com.meridian.lms.dto.response.LoanResponse;
import com.meridian.lms.dto.response.PaymentResponse;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.repository.LoanRepository;
import com.meridian.lms.repository.PaymentRepository;
import com.meridian.lms.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.*;


@Transactional
class PaymentServiceTest extends AbstractIntegrationTest {

    @Autowired LoanService loanService;
    @Autowired PaymentService paymentService;
    @Autowired LoanRepository loanRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired UserRepository userRepository;

    private User customer;
    private User employee;
    private Loan activeLoan;

    @BeforeEach
    void setup() {
        paymentRepository.deleteAll();
        loanRepository.deleteAll();
        userRepository.deleteAll();

        customer = userRepository.save(User.builder()
                .email("pay@test.com")
                .passwordHash("x")
                .fullName("Pay Cust")
                .role(User.Role.CUSTOMER)
                .creditScore(700)
                .status(User.UserStatus.ACTIVE)
                .build());

        employee = userRepository.save(User.builder()
                .email("emp2@test.com")
                .passwordHash("x")
                .fullName("Emp")
                .role(User.Role.EMPLOYEE)
                .creditScore(800)
                .status(User.UserStatus.ACTIVE)
                .build());

        LoanResponse applied = loanService.apply(customer, LoanApplicationRequest.builder()
                .loanTypeCode("PERSONAL")
                .amount(new BigDecimal("12000.00"))
                .termMonths(12)
                .build());

        loanService.review(employee, applied.getId(),
                ReviewLoanRequest.builder().decision("APPROVE").build());

        activeLoan = loanRepository.findById(applied.getId()).orElseThrow();
    }

    @Test
    void pay_marksPaymentPaidAndReducesBalance() {
        BigDecimal before = activeLoan.getOutstandingBalance();
        var firstPayment = paymentRepository.findByLoanOrderByInstallmentNumberAsc(activeLoan).get(0);

        PaymentResponse response = paymentService.pay(customer, PaymentRequest.builder()
                .paymentId(firstPayment.getId())
                .paymentMethod("CREDIT_CARD")
                .idempotencyKey("test-key-" + firstPayment.getId())
                .build());

        assertThat(response.getStatus()).isEqualTo("PAID");

        Loan updated = loanRepository.findById(activeLoan.getId()).orElseThrow();
        assertThat(updated.getOutstandingBalance()).isLessThan(before);
    }

    @Test
    void pay_idempotent_sameKeyReturnsSamePayment() {
        var firstPayment = paymentRepository.findByLoanOrderByInstallmentNumberAsc(activeLoan).get(0);
        String key = "idem-key-" + firstPayment.getId();

        PaymentResponse first = paymentService.pay(customer, PaymentRequest.builder()
                .paymentId(firstPayment.getId())
                .paymentMethod("CREDIT_CARD")
                .idempotencyKey(key)
                .build());

        PaymentResponse second = paymentService.pay(customer, PaymentRequest.builder()
                .paymentId(firstPayment.getId())
                .paymentMethod("CREDIT_CARD")
                .idempotencyKey(key)
                .build());

        // Both should return the same payment ID
        assertThat(second.getId()).isEqualTo(first.getId());
    }

    @Test
    void pay_alreadyPaidDifferentKey_throws() {
        var firstPayment = paymentRepository.findByLoanOrderByInstallmentNumberAsc(activeLoan).get(0);

        paymentService.pay(customer, PaymentRequest.builder()
                .paymentId(firstPayment.getId())
                .paymentMethod("CREDIT_CARD")
                .idempotencyKey("key-1")
                .build());

        // New key, same payment → should fail because already paid
        assertThatThrownBy(() -> paymentService.pay(customer, PaymentRequest.builder()
                .paymentId(firstPayment.getId())
                .paymentMethod("CREDIT_CARD")
                .idempotencyKey("key-2")
                .build()))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already paid");
    }

    @Test
    void pay_allInstallments_completesLoan() {
        var allPayments = paymentRepository.findByLoanOrderByInstallmentNumberAsc(activeLoan);

        int i = 0;
        for (var p : allPayments) {
            paymentService.pay(customer, PaymentRequest.builder()
                    .paymentId(p.getId())
                    .paymentMethod("BANK_TRANSFER")
                    .idempotencyKey("bulk-" + (i++))
                    .build());
        }

        Loan completed = loanRepository.findById(activeLoan.getId()).orElseThrow();
        assertThat(completed.getStatus()).isEqualTo(Loan.LoanStatus.COMPLETED);
        assertThat(completed.getOutstandingBalance()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void pay_otherCustomerLoan_throwsForbidden() {
        User otherCustomer = userRepository.save(User.builder()
                .email("other@test.com")
                .passwordHash("x")
                .fullName("Other")
                .role(User.Role.CUSTOMER)
                .creditScore(700)
                .status(User.UserStatus.ACTIVE)
                .build());

        var firstPayment = paymentRepository.findByLoanOrderByInstallmentNumberAsc(activeLoan).get(0);

        assertThatThrownBy(() -> paymentService.pay(otherCustomer, PaymentRequest.builder()
                .paymentId(firstPayment.getId())
                .paymentMethod("CREDIT_CARD")
                .idempotencyKey("other-key")
                .build()))
                .isInstanceOf(com.meridian.lms.exception.ForbiddenException.class);
    }
}