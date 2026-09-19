package com.meridian.lms.dto.response;

import com.meridian.lms.entity.Payment;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long loanId;
    private BigDecimal amount;
    private BigDecimal principalPortion;
    private BigDecimal interestPortion;
    private LocalDate dueDate;
    private LocalDateTime paidAt;
    private String status;
    private String paymentMethod;
    private BigDecimal lateFee;
    private Integer installmentNumber;

    public static PaymentResponse from(Payment p) {
        return PaymentResponse.builder()
                .id(p.getId())
                .loanId(p.getLoan().getId())
                .amount(p.getAmount())
                .principalPortion(p.getPrincipalPortion())
                .interestPortion(p.getInterestPortion())
                .dueDate(p.getDueDate())
                .paidAt(p.getPaidAt())
                .status(p.getStatus().name())
                .paymentMethod(p.getPaymentMethod())
                .lateFee(p.getLateFee())
                .installmentNumber(p.getInstallmentNumber())
                .build();
    }
}