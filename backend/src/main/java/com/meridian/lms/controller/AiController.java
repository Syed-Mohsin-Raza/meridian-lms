package com.meridian.lms.controller;

import com.meridian.lms.ai.CreditProfileAggregator;
import com.meridian.lms.ai.CreditRiskNarrativeService;
import com.meridian.lms.ai.dto.CreditRiskNarrativeResponse;
import com.meridian.lms.ai.dto.CustomerCreditProfile;
import com.meridian.lms.ai.dto.NarrativeResult;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI", description = "AI-powered credit risk assessment")
public class AiController {

    private final CreditRiskNarrativeService narrativeService;
    private final CreditProfileAggregator profileAggregator;

    @Value("${meridian.ai.model:unknown}")
    private String configuredModel;

    public AiController(CreditRiskNarrativeService narrativeService,
                        CreditProfileAggregator profileAggregator) {
        this.narrativeService = narrativeService;
        this.profileAggregator = profileAggregator;
    }

    @GetMapping("/credit-risk/{customerId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    @Operation(summary = "Generate AI credit risk narrative for a customer")
    public ResponseEntity<CreditRiskNarrativeResponse> getCreditRiskNarrative(
            @PathVariable Long customerId
    ) {
        CustomerCreditProfile profile = profileAggregator.aggregate(customerId);
        NarrativeResult result = narrativeService.generateNarrative(profile);

        return ResponseEntity.ok(new CreditRiskNarrativeResponse(
                customerId,
                result.narrative(),
                configuredModel,
                result.cached(),
                result.fallbackUsed(),
                Instant.now()
        ));
    }
}