package com.meridian.lms.service;

import com.meridian.lms.dto.request.PaymentRequest;
import com.meridian.lms.dto.response.PaymentResponse;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.Payment;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.exception.ForbiddenException;
import com.meridian.lms.exception.NotFoundException;
import com.meridian.lms.repository.LoanRepository;
import com.meridian.lms.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final LoanRepository loanRepository;
    private final CreditScoreService creditScoreService;

    public PaymentService(PaymentRepository paymentRepository,
                          LoanRepository loanRepository,
                          CreditScoreService creditScoreService) {
        this.paymentRepository = paymentRepository;
        this.loanRepository = loanRepository;
        this.creditScoreService = creditScoreService;
    }

    /**
     * List all payments for a loan. Customer can only see own.
     */
    @Transactional(readOnly = true)
    public List<PaymentResponse> listForLoan(User requester, Long loanId) {
        Loan loan = loanRepository.findById(loanId)
                .orElseThrow(() -> new NotFoundException("Loan not found: " + loanId));
        assertCanView(requester, loan);

        return paymentRepository.findByLoanOrderByInstallmentNumberAsc(loan).stream()
                .map(PaymentResponse::from)
                .toList();
    }

    /**
     * Record a payment. Idempotent by idempotency key.
     * Wrapped in a transaction so loan balance + payment status update atomically.
     */
    @Transactional
    @CacheEvict(value = {"analytics:dashboard", "analytics:revenue"}, allEntries = true)
    public PaymentResponse pay(User requester, PaymentRequest req) {
        // 1. Idempotency check — if key already processed, return existing result
        Optional<Payment> existing = paymentRepository.findByIdempotencyKey(req.getIdempotencyKey());
        if (existing.isPresent()) {
            log.info("Idempotency key {} already processed — returning existing payment",
                    req.getIdempotencyKey());
            return PaymentResponse.from(existing.get());
        }

        // 2. Load payment
        Payment payment = paymentRepository.findById(req.getPaymentId())
                .orElseThrow(() -> new NotFoundException("Payment not found: " + req.getPaymentId()));

        // 3. Authorization — customer can only pay own loans
        assertCanPay(requester, payment.getLoan());

        // 4. State guard
        if (payment.getStatus() == Payment.PaymentStatus.PAID) {
            throw new BadRequestException("Payment already paid");
        }

        // 5. Determine amount to pay
        BigDecimal amountToPay = req.getAmount() != null
                ? req.getAmount()
                : payment.getAmount();

        if (amountToPay.signum() <= 0) {
            throw new BadRequestException("Payment amount must be positive");
        }

        // 6. Mark payment paid
        payment.setStatus(Payment.PaymentStatus.PAID);
        payment.setPaidAt(LocalDateTime.now());
        payment.setPaymentMethod(req.getPaymentMethod());
        payment.setIdempotencyKey(req.getIdempotencyKey());
        paymentRepository.save(payment);

        // 7. Reduce loan outstanding balance
        Loan loan = payment.getLoan();
        BigDecimal newBalance = loan.getOutstandingBalance().subtract(amountToPay);
        if (newBalance.signum() < 0) newBalance = BigDecimal.ZERO;
        loan.setOutstandingBalance(newBalance);

        // 8. If fully paid, complete the loan and add completion bonus
        if (newBalance.signum() == 0
                && loan.getStatus() == Loan.LoanStatus.ACTIVE) {
            loan.setStatus(Loan.LoanStatus.COMPLETED);
            loan.setCompletedAt(LocalDateTime.now());
            creditScoreService.applyDelta(loan.getCustomer(),
                    CreditScoreService.DELTA_LOAN_COMPLETED, "Loan completed");
        }

        loanRepository.save(loan);

        // 9. Credit score for on-time payment
        boolean onTime = !payment.getDueDate().isBefore(LocalDateTime.now().toLocalDate());
        creditScoreService.applyDelta(loan.getCustomer(),
                onTime ? CreditScoreService.DELTA_PAYMENT_ON_TIME
                        : CreditScoreService.DELTA_PAYMENT_LATE,
                onTime ? "Payment on time" : "Payment late");

        log.info("Payment recorded: id={}, amount={}, loan={}, newBalance={}",
                payment.getId(), amountToPay, loan.getId(), newBalance);

        return PaymentResponse.from(payment);
    }

    private void assertCanView(User requester, Loan loan) {
        if (requester.getRole() == User.Role.ADMIN
                || requester.getRole() == User.Role.EMPLOYEE) return;
        if (!loan.getCustomer().getId().equals(requester.getId())) {
            throw new ForbiddenException("You cannot view this loan's payments");
        }
    }

    private void assertCanPay(User requester, Loan loan) {
        if (requester.getRole() == User.Role.ADMIN
                || requester.getRole() == User.Role.EMPLOYEE) return;
        if (!loan.getCustomer().getId().equals(requester.getId())) {
            throw new ForbiddenException("You cannot pay this loan");
        }
    }
}