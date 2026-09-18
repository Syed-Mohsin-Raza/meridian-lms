package com.meridian.lms.service;

import com.meridian.lms.dto.request.LoanApplicationRequest;
import com.meridian.lms.dto.request.ReviewLoanRequest;
import com.meridian.lms.dto.response.LoanResponse;
import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.LoanType;
import com.meridian.lms.entity.Payment;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.exception.ForbiddenException;
import com.meridian.lms.exception.NotFoundException;
import com.meridian.lms.repository.LoanRepository;
import com.meridian.lms.repository.PaymentRepository;
import com.meridian.lms.repository.UserRepository;
import com.meridian.lms.util.AmortizationCalculator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;


@Service
public class LoanService {

    private static final Logger log = LoggerFactory.getLogger(LoanService.class);

    private final LoanRepository loanRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final LoanTypeService loanTypeService;
    private final AmortizationCalculator amortization;
    private final CreditScoreService creditScoreService;

    private final Counter loansApplied;
    private final Counter loansApproved;
    private final Counter loansRejected;
    private final Timer approvalTimer;

    public LoanService(LoanRepository loanRepository,
                       PaymentRepository paymentRepository,
                       UserRepository userRepository,
                       LoanTypeService loanTypeService,
                       AmortizationCalculator amortization,
                       CreditScoreService creditScoreService,
                       MeterRegistry meterRegistry) {
        this.loanRepository = loanRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
        this.loanTypeService = loanTypeService;
        this.amortization = amortization;
        this.creditScoreService = creditScoreService;
        this.loansApplied = meterRegistry.counter("loan.applied");
        this.loansApproved = meterRegistry.counter("loan.approved");
        this.loansRejected = meterRegistry.counter("loan.rejected");
        this.approvalTimer = meterRegistry.timer("loan.approval.duration");
    }

    /**
     * Customer applies for a loan.
     */
    @Transactional
    @CacheEvict(value = {"analytics:dashboard", "analytics:trends", "analytics:loan-types"}, allEntries = true)
    public LoanResponse apply(User customer, LoanApplicationRequest req) {
        LoanType loanType = loanTypeService.findByCode(req.getLoanTypeCode());

        // Validate against loan type constraints
        if (req.getAmount().compareTo(loanType.getMinAmount()) < 0
                || req.getAmount().compareTo(loanType.getMaxAmount()) > 0) {
            throw new BadRequestException(
                    "Amount must be between " + loanType.getMinAmount()
                            + " and " + loanType.getMaxAmount());
        }
        if (req.getTermMonths() < loanType.getMinTermMonths()
                || req.getTermMonths() > loanType.getMaxTermMonths()) {
            throw new BadRequestException(
                    "Term must be between " + loanType.getMinTermMonths()
                            + " and " + loanType.getMaxTermMonths() + " months");
        }

        // Calculate adjusted interest rate based on credit score
        BigDecimal adjustment = creditScoreService.rateAdjustmentFor(customer.getCreditScore());
        BigDecimal effectiveRate = loanType.getBaseInterestRate().add(adjustment);
        if (effectiveRate.signum() < 0) effectiveRate = BigDecimal.ZERO;

        // Calculate amortization values
        BigDecimal monthlyPayment = amortization.calculateMonthlyPayment(
                req.getAmount(), effectiveRate, req.getTermMonths());
        BigDecimal totalInterest = amortization.calculateTotalInterest(
                req.getAmount(), effectiveRate, req.getTermMonths());
        BigDecimal totalPayable = req.getAmount().add(totalInterest);

        Loan loan = Loan.builder()
                .customer(customer)
                .loanType(loanType)
                .amount(req.getAmount().setScale(4, RoundingMode.HALF_EVEN))
                .termMonths(req.getTermMonths())
                .interestRate(effectiveRate.setScale(2, RoundingMode.HALF_EVEN))
                .monthlyPayment(monthlyPayment)
                .totalInterest(totalInterest)
                .totalPayable(totalPayable)
                .outstandingBalance(totalPayable)
                .status(Loan.LoanStatus.PENDING)
                .purpose(req.getPurpose())
                .build();

        loanRepository.save(loan);
        log.info("Loan application created: id={}, customer={}, amount={}, type={}",
                loan.getId(), customer.getId(), loan.getAmount(), loanType.getCode());

        loansApplied.increment();
        return LoanResponse.from(loan);
    }

    /**
     * Customer views their loan history.
     */
    @Transactional(readOnly = true)
    public List<LoanResponse> myLoans(User customer) {
        return loanRepository.findByCustomerOrderByAppliedAtDesc(customer).stream()
                .map(LoanResponse::from)
                .toList();
    }

    /**
     * Get a single loan (with authorization check).
     */
    @Transactional(readOnly = true)
    public LoanResponse getById(User requester, Long loanId) {
        Loan loan = findLoanOrThrow(loanId);
        assertCanView(requester, loan);
        return LoanResponse.from(loan);
    }

    /**
     * Get loan entity (for internal use).
     */
    @Transactional(readOnly = true)
    public Loan findLoanOrThrow(Long loanId) {
        return loanRepository.findById(loanId)
                .orElseThrow(() -> new NotFoundException("Loan not found: " + loanId));
    }

    private void assertCanView(User requester, Loan loan) {
        // Admin/employee can view any loan
        if (requester.getRole() == User.Role.ADMIN
                || requester.getRole() == User.Role.EMPLOYEE) {
            return;
        }
        // Customer can only view their own loans
        if (!loan.getCustomer().getId().equals(requester.getId())) {
            throw new ForbiddenException("You cannot view this loan");
        }
    }

    /**
     * Staff reviews a loan (approve/reject/assign/start review).
     */
    @Transactional
    public LoanResponse review(User reviewer, Long loanId, ReviewLoanRequest req) {
        Loan loan = findLoanOrThrow(loanId);

        switch (req.getDecision()) {
            case "START_REVIEW" -> startReview(loan, reviewer);
            case "ASSIGN" -> assign(loan, reviewer);
            case "APPROVE" -> approve(loan, reviewer);
            case "REJECT" -> reject(loan, reviewer, req.getReason());
            default -> throw new BadRequestException("Unknown decision: " + req.getDecision());
        }

        return LoanResponse.from(loan);
    }

    private void startReview(Loan loan, User reviewer) {
        if (loan.getStatus() != Loan.LoanStatus.PENDING) {
            throw new BadRequestException("Can only start review on PENDING loans");
        }
        loan.setStatus(Loan.LoanStatus.UNDER_REVIEW);
        loan.setAssignedEmployee(reviewer);
        loan.setReviewedAt(LocalDateTime.now());
    }

    private void assign(Loan loan, User reviewer) {
        if (loan.getStatus() != Loan.LoanStatus.PENDING
                && loan.getStatus() != Loan.LoanStatus.UNDER_REVIEW) {
            throw new BadRequestException("Can only assign PENDING or UNDER_REVIEW loans");
        }
        loan.setAssignedEmployee(reviewer);
        if (loan.getStatus() == Loan.LoanStatus.PENDING) {
            loan.setStatus(Loan.LoanStatus.UNDER_REVIEW);
            loan.setReviewedAt(LocalDateTime.now());
        }
    }

    /**
     * Approve a loan and generate amortized schedule in the same transaction.
     */
    @CacheEvict(value = {"analytics:dashboard", "analytics:trends", "analytics:loan-types"}, allEntries = true)
    private void approve(Loan loan, User reviewer) {
        approvalTimer.record(() -> {
            if (loan.getStatus() != Loan.LoanStatus.PENDING
                    && loan.getStatus() != Loan.LoanStatus.UNDER_REVIEW) {
                throw new BadRequestException("Can only approve PENDING or UNDER_REVIEW loans");
            }

            LocalDateTime now = LocalDateTime.now();
            loan.setStatus(Loan.LoanStatus.APPROVED);
            loan.setAssignedEmployee(reviewer);
            loan.setReviewedAt(now);
            loan.setApprovedAt(now);

            // Generate payment schedule
            List<AmortizationCalculator.Installment> schedule = amortization.generateSchedule(
                    loan.getAmount(), loan.getInterestRate(), loan.getTermMonths());

            LocalDate firstDue = LocalDate.now().plusMonths(1).withDayOfMonth(1);
            for (AmortizationCalculator.Installment inst : schedule) {
                Payment payment = Payment.builder()
                        .loan(loan)
                        .customer(loan.getCustomer())
                        .amount(inst.payment())
                        .principalPortion(inst.principal())
                        .interestPortion(inst.interest())
                        .dueDate(firstDue.plusMonths(inst.number() - 1))
                        .status(Payment.PaymentStatus.PENDING)
                        .installmentNumber(inst.number())
                        .build();
                paymentRepository.save(payment);
            }

            loan.setStatus(Loan.LoanStatus.ACTIVE);

            // Update credit score
            creditScoreService.applyDelta(loan.getCustomer(),
                    CreditScoreService.DELTA_LOAN_APPROVED, "Loan approved");

            log.info("Loan approved: id={}, schedule generated with {} installments",
                    loan.getId(), schedule.size());

            loansApproved.increment();
        });
    }


    @CacheEvict(value = {"analytics:dashboard", "analytics:trends", "analytics:loan-types"}, allEntries = true)
    private void reject(Loan loan, User reviewer, String reason) {
        if (loan.getStatus() != Loan.LoanStatus.PENDING
                && loan.getStatus() != Loan.LoanStatus.UNDER_REVIEW) {
            throw new BadRequestException("Can only reject PENDING or UNDER_REVIEW loans");
        }
        loan.setStatus(Loan.LoanStatus.REJECTED);
        loan.setAssignedEmployee(reviewer);
        loan.setReviewedAt(LocalDateTime.now());
        loan.setRejectionReason(reason);

        creditScoreService.applyDelta(loan.getCustomer(),
                CreditScoreService.DELTA_LOAN_REJECTED, "Loan rejected");

        loansRejected.increment();
    }
}