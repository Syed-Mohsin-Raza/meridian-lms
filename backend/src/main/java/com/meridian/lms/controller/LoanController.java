package com.meridian.lms.controller;

import com.meridian.lms.dto.request.LoanApplicationRequest;
import com.meridian.lms.dto.request.ReviewLoanRequest;
import com.meridian.lms.dto.response.LoanResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.UserRepository;
import com.meridian.lms.service.LoanService;
import com.meridian.lms.entity.Loan;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loans")
public class LoanController {

    private final LoanService loanService;
    private final UserRepository userRepository;

    public LoanController(LoanService loanService, UserRepository userRepository) {
        this.loanService = loanService;
        this.userRepository = userRepository;
    }

    private User currentUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    /**
     * Customer applies for a loan.
     */
    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<LoanResponse> apply(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody LoanApplicationRequest req) {
        LoanResponse response = loanService.apply(currentUser(ud), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Customer views their loans.
     */
    @GetMapping("/my")
    public ResponseEntity<List<LoanResponse>> myLoans(
            @AuthenticationPrincipal UserDetails ud) {
        return ResponseEntity.ok(loanService.myLoans(currentUser(ud)));
    }

    /**
     * Get a loan by ID (customer can only see own; staff any).
     */
    @GetMapping("/{id}")
    public ResponseEntity<LoanResponse> getById(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id) {
        return ResponseEntity.ok(loanService.getById(currentUser(ud), id));
    }

    /**
     * Staff reviews a loan.
     */
    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('ADMIN') or @permissions.has(authentication, 'approve_loans')")
    public ResponseEntity<LoanResponse> review(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody ReviewLoanRequest req) {
        return ResponseEntity.ok(loanService.review(currentUser(ud), id, req));
    }

    /**
     * Staff: paginated list of all loans with optional status filter.
     */

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or @permissions.has(authentication, 'approve_loans')")
    public ResponseEntity<Page<LoanResponse>> list(
            @PageableDefault(size = 20, sort = "appliedAt", direction = Sort.Direction.DESC)
            Pageable pageable,
            @RequestParam(required = false) Loan.LoanStatus status) {
        return ResponseEntity.ok(loanService.list(pageable, status));
    }
}