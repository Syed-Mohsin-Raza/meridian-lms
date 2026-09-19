package com.meridian.lms.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardKpiResponse {
    private long totalLoans;
    private long pendingLoans;
    private long activeLoans;
    private long completedLoans;
    private long rejectedLoans;
    private long totalCustomers;
    private BigDecimal totalDisbursed;
    private BigDecimal totalRevenue;
    private BigDecimal totalOutstanding;
    private double approvalRate;
}