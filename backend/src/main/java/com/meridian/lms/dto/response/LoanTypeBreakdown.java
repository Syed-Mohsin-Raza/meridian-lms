package com.meridian.lms.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanTypeBreakdown {
    private String code;
    private String name;
    private long count;
    private BigDecimal totalDisbursed;
    private double approvalRate;
}