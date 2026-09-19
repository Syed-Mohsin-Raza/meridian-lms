package com.meridian.lms.dto.response;

import com.meridian.lms.entity.LoanType;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LoanTypeResponse {
    private Long id;
    private String code;
    private String name;
    private String description;
    private BigDecimal minAmount;
    private BigDecimal maxAmount;
    private Integer minTermMonths;
    private Integer maxTermMonths;
    private BigDecimal baseInterestRate;

    public static LoanTypeResponse from(LoanType t) {
        return LoanTypeResponse.builder()
                .id(t.getId())
                .code(t.getCode())
                .name(t.getName())
                .description(t.getDescription())
                .minAmount(t.getMinAmount())
                .maxAmount(t.getMaxAmount())
                .minTermMonths(t.getMinTermMonths())
                .maxTermMonths(t.getMaxTermMonths())
                .baseInterestRate(t.getBaseInterestRate())
                .build();
    }
}