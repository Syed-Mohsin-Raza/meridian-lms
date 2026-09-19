package com.meridian.lms.controller;

import com.meridian.lms.dto.request.PaymentRequest;
import com.meridian.lms.dto.response.PaymentResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.UserRepository;
import com.meridian.lms.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    private User currentUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    /**
     * List payments for a specific loan.
     */
    @GetMapping("/loan/{loanId}")
    public ResponseEntity<List<PaymentResponse>> listForLoan(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long loanId) {
        return ResponseEntity.ok(paymentService.listForLoan(currentUser(ud), loanId));
    }

    /**
     * Record a payment.
     */
    @PostMapping("/pay")
    public ResponseEntity<PaymentResponse> pay(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody PaymentRequest req) {
        return ResponseEntity.ok(paymentService.pay(currentUser(ud), req));
    }
}