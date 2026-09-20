package com.meridian.lms.ai.dto;

public record NarrativeResult(
        String narrative,
        boolean cached,
        boolean fallbackUsed
) {}