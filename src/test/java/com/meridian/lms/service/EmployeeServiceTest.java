package com.meridian.lms.service;

import com.meridian.lms.AbstractIntegrationTest;
import com.meridian.lms.dto.request.CreateEmployeeRequest;
import com.meridian.lms.dto.response.EmployeeResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

import static org.assertj.core.api.Assertions.*;


@Transactional
class EmployeeServiceTest extends AbstractIntegrationTest {

    @Autowired EmployeeService employeeService;
    @Autowired UserRepository userRepository;
    @Autowired LoanRepository loanRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired PermissionRepository permissionRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired CacheManager cacheManager;

    private User admin;

    @BeforeEach
    void setup() {
        cacheManager.getCacheNames().forEach(n -> {
            var c = cacheManager.getCache(n);
            if (c != null) c.clear();
        });
        permissionRepository.deleteAll();
        paymentRepository.deleteAll();
        loanRepository.deleteAll();
        userRepository.deleteAll();

        admin = userRepository.save(User.builder()
                .email("admin-test@lms.com").passwordHash(passwordEncoder.encode("x"))
                .fullName("Admin").role(User.Role.ADMIN)
                .creditScore(850).status(User.UserStatus.ACTIVE).build());
    }

    @Test
    void create_employeeWithPermissions() {
        EmployeeResponse result = employeeService.create(
                CreateEmployeeRequest.builder()
                        .email("new-emp@lms.com")
                        .password("SecurePass1")
                        .fullName("New Employee")
                        .permissions(Set.of("manage_loans", "view_analytics"))
                        .build(),
                admin);

        assertThat(result.getEmail()).isEqualTo("new-emp@lms.com");
        assertThat(result.getPermissions()).containsExactlyInAnyOrder("manage_loans", "view_analytics");
    }

    @Test
    void updatePermissions_replacesExisting() {
        EmployeeResponse created = employeeService.create(
                CreateEmployeeRequest.builder()
                        .email("emp2@lms.com").password("SecurePass1").fullName("E2")
                        .permissions(Set.of("manage_loans")).build(),
                admin);

        EmployeeResponse updated = employeeService.updatePermissions(
                created.getId(), Set.of("approve_loans", "manage_payments"), admin);

        assertThat(updated.getPermissions())
                .containsExactlyInAnyOrder("approve_loans", "manage_payments");
    }

    @Test
    void deactivate_setsSuspended() {
        EmployeeResponse created = employeeService.create(
                CreateEmployeeRequest.builder()
                        .email("emp3@lms.com").password("SecurePass1").fullName("E3")
                        .build(),
                admin);

        employeeService.deactivate(created.getId());
        EmployeeResponse fetched = employeeService.getById(created.getId());
        assertThat(fetched.getStatus()).isEqualTo("SUSPENDED");
    }
}