package com.meridian.lms.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendPoint {
    private String period;        // e.g. "2026-09"
    private long applications;
    private long approvals;
    private long rejections;
}