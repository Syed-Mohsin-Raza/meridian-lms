package com.meridian.lms.controller;

import com.meridian.lms.dto.request.CreateEmployeeRequest;
import com.meridian.lms.dto.request.UpdateEmployeeRequest;
import com.meridian.lms.dto.request.UpdatePermissionsRequest;
import com.meridian.lms.dto.response.EmployeeResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.UserRepository;
import com.meridian.lms.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@PreAuthorize("hasRole('ADMIN')")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final UserRepository userRepository;

    public EmployeeController(EmployeeService employeeService, UserRepository userRepository) {
        this.employeeService = employeeService;
        this.userRepository = userRepository;
    }

    private User currentUser(UserDetails ud) {
        return userRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"));
    }

    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> list() {
        return ResponseEntity.ok(employeeService.listAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getById(id));
    }

    @PostMapping
    public ResponseEntity<EmployeeResponse> create(
            @AuthenticationPrincipal UserDetails ud,
            @Valid @RequestBody CreateEmployeeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(employeeService.create(req, currentUser(ud)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateEmployeeRequest req) {
        return ResponseEntity.ok(employeeService.update(id, req));
    }

    @PutMapping("/{id}/permissions")
    public ResponseEntity<EmployeeResponse> updatePermissions(
            @AuthenticationPrincipal UserDetails ud,
            @PathVariable Long id,
            @Valid @RequestBody UpdatePermissionsRequest req) {
        return ResponseEntity.ok(
                employeeService.updatePermissions(id, req.getPermissions(), currentUser(ud)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable Long id) {
        employeeService.deactivate(id);
        return ResponseEntity.noContent().build();
    }
}