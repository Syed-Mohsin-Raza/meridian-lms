package com.meridian.lms.controller;

import com.meridian.lms.dto.response.CustomerResponse;
import com.meridian.lms.service.CustomerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customers")
//@PreAuthorize("hasAnyRole('ADMIN','EMPLOYEE')")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or @permissions.has(authentication, 'manage_customers')")
    public ResponseEntity<Page<CustomerResponse>> list(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC)
            Pageable pageable) {
        return ResponseEntity.ok(customerService.listAll(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or @permissions.has(authentication, 'manage_customers')")
    public ResponseEntity<CustomerResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getById(id));
    }

    @PutMapping("/{id}/suspend")
    @PreAuthorize("hasRole('ADMIN') or @permissions.has(authentication, 'manage_customers')")
    public ResponseEntity<CustomerResponse> suspend(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.suspend(id));
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or @permissions.has(authentication, 'manage_customers')")
    public ResponseEntity<CustomerResponse> activate(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.activate(id));
    }
}