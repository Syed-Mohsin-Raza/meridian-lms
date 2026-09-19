package com.meridian.lms.controller;

import com.meridian.lms.dto.response.LoanTypeResponse;
import com.meridian.lms.service.LoanTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/loans/types")
public class LoanTypeController {

    private final LoanTypeService loanTypeService;

    public LoanTypeController(LoanTypeService loanTypeService) {
        this.loanTypeService = loanTypeService;
    }

    @GetMapping
    public ResponseEntity<List<LoanTypeResponse>> list() {
        return ResponseEntity.ok(loanTypeService.listActive());
    }
}