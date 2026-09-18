package com.meridian.lms.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Payment ID is required")
    private Long paymentId;

    @NotBlank(message = "Payment method is required")
    @Size(max = 50)
    private String paymentMethod;

    @NotBlank(message = "Idempotency key is required")
    @Size(min = 8, max = 100)
    private String idempotencyKey;

    // Amount can differ from scheduled (partial payment) — optional
    private BigDecimal amount;
}