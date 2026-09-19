package com.meridian.lms.controller;

import com.meridian.lms.dto.response.AuditEntryResponse;
import com.meridian.lms.service.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping("/loans/{id}")
    public ResponseEntity<List<AuditEntryResponse>> loanHistory(@PathVariable Long id) {
        List<AuditEntryResponse> history = auditService.loanHistory(id).stream()
                .map(e -> AuditEntryResponse.builder()
                        .revisionId(e.revisionId())
                        .revisionType(e.revisionType())
                        .timestamp(e.timestamp())
                        .actorEmail(e.actorEmail())
                        .snapshot(e.entity())
                        .build())
                .toList();
        return ResponseEntity.ok(history);
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<List<AuditEntryResponse>> paymentHistory(@PathVariable Long id) {
        List<AuditEntryResponse> history = auditService.paymentHistory(id).stream()
                .map(e -> AuditEntryResponse.builder()
                        .revisionId(e.revisionId())
                        .revisionType(e.revisionType())
                        .timestamp(e.timestamp())
                        .actorEmail(e.actorEmail())
                        .snapshot(e.entity())
                        .build())
                .toList();
        return ResponseEntity.ok(history);
    }
}