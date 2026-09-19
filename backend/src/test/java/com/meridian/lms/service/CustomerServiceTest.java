package com.meridian.lms.service;

import com.meridian.lms.AbstractIntegrationTest;
import com.meridian.lms.dto.response.CustomerResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.*;


@Transactional
class CustomerServiceTest extends AbstractIntegrationTest {

    @Autowired CustomerService customerService;
    @Autowired UserRepository userRepository;
    @Autowired LoanRepository loanRepository;
    @Autowired PaymentRepository paymentRepository;
    @Autowired CacheManager cacheManager;

    @BeforeEach
    void setup() {
        cacheManager.getCacheNames().forEach(n -> {
            var c = cacheManager.getCache(n);
            if (c != null) c.clear();
        });
        paymentRepository.deleteAll();
        loanRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void listAll_returnsOnlyCustomers() {
        userRepository.save(User.builder()
                .email("c1@test.com").passwordHash("x").fullName("C1")
                .role(User.Role.CUSTOMER).creditScore(700).status(User.UserStatus.ACTIVE).build());
        userRepository.save(User.builder()
                .email("e1@test.com").passwordHash("x").fullName("E1")
                .role(User.Role.EMPLOYEE).creditScore(700).status(User.UserStatus.ACTIVE).build());

        List<CustomerResponse> result = customerService.listAll();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmail()).isEqualTo("c1@test.com");
    }

    @Test
    void suspend_setsStatusSuspended() {
        User c = userRepository.save(User.builder()
                .email("c2@test.com").passwordHash("x").fullName("C2")
                .role(User.Role.CUSTOMER).creditScore(700).status(User.UserStatus.ACTIVE).build());

        CustomerResponse result = customerService.suspend(c.getId());
        assertThat(result.getStatus()).isEqualTo("SUSPENDED");
    }

    @Test
    void suspend_employee_throws() {
        User e = userRepository.save(User.builder()
                .email("e2@test.com").passwordHash("x").fullName("E2")
                .role(User.Role.EMPLOYEE).creditScore(700).status(User.UserStatus.ACTIVE).build());

        assertThatThrownBy(() -> customerService.suspend(e.getId()))
                .isInstanceOf(BadRequestException.class);
    }
}