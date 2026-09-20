package com.meridian.lms.ai.dto;

import java.time.Instant;

public record CreditRiskNarrativeResponse(
        Long customerId,
        String narrative,
        String model,
        boolean cached,
        boolean fallbackUsed,
        Instant generatedAt
) {}