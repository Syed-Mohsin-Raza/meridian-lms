package com.meridian.lms.dto.response;

import com.meridian.lms.entity.Loan;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private Long loanTypeId;
    private String loanTypeName;
    private String loanTypeCode;
    private Long assignedEmployeeId;
    private String assignedEmployeeName;
    private BigDecimal amount;
    private Integer termMonths;
    private BigDecimal interestRate;
    private BigDecimal monthlyPayment;
    private BigDecimal totalPayable;
    private BigDecimal totalInterest;
    private BigDecimal outstandingBalance;
    private String status;
    private String purpose;
    private String rejectionReason;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime completedAt;

    public static LoanResponse from(Loan loan) {
        return LoanResponse.builder()
                .id(loan.getId())
                .customerId(loan.getCustomer().getId())
                .customerName(loan.getCustomer().getFullName())
                .customerEmail(loan.getCustomer().getEmail())
                .loanTypeId(loan.getLoanType().getId())
                .loanTypeName(loan.getLoanType().getName())
                .loanTypeCode(loan.getLoanType().getCode())
                .assignedEmployeeId(loan.getAssignedEmployee() != null
                        ? loan.getAssignedEmployee().getId() : null)
                .assignedEmployeeName(loan.getAssignedEmployee() != null
                        ? loan.getAssignedEmployee().getFullName() : null)
                .amount(loan.getAmount())
                .termMonths(loan.getTermMonths())
                .interestRate(loan.getInterestRate())
                .monthlyPayment(loan.getMonthlyPayment())
                .totalPayable(loan.getTotalPayable())
                .totalInterest(loan.getTotalInterest())
                .outstandingBalance(loan.getOutstandingBalance())
                .status(loan.getStatus().name())
                .purpose(loan.getPurpose())
                .rejectionReason(loan.getRejectionReason())
                .appliedAt(loan.getAppliedAt())
                .reviewedAt(loan.getReviewedAt())
                .approvedAt(loan.getApprovedAt())
                .completedAt(loan.getCompletedAt())
                .build();
    }
}