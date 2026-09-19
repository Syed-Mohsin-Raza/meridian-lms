package com.meridian.lms.dto.response;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenuePoint {
    private String period;          // "2026-09"
    private BigDecimal interestRevenue;
    private BigDecimal lateFees;
    private BigDecimal total;
}