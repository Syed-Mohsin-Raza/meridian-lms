package com.meridian.lms.controller;

import com.meridian.lms.dto.response.*;
import com.meridian.lms.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/analytics")
@PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardKpiResponse> dashboard() {
        return ResponseEntity.ok(analyticsService.dashboard());
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendPoint>> trends(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(analyticsService.trends(months));
    }

    @GetMapping("/revenue")
    public ResponseEntity<List<RevenuePoint>> revenue(
            @RequestParam(defaultValue = "12") int months) {
        return ResponseEntity.ok(analyticsService.revenue(months));
    }

    @GetMapping("/loan-types")
    public ResponseEntity<List<LoanTypeBreakdown>> loanTypes() {
        return ResponseEntity.ok(analyticsService.loanTypeBreakdown());
    }
}