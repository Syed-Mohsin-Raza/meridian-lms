package com.meridian.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewLoanRequest {

    @NotBlank(message = "Decision is required")
    @Pattern(regexp = "APPROVE|REJECT|ASSIGN|START_REVIEW",
            message = "Decision must be APPROVE, REJECT, ASSIGN, or START_REVIEW")
    private String decision;

    @Size(max = 1000, message = "Reason too long")
    private String reason;
}