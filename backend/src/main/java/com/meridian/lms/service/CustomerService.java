package com.meridian.lms.service;

import com.meridian.lms.dto.response.CustomerResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.exception.NotFoundException;
import com.meridian.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CustomerService {

    private static final Logger log = LoggerFactory.getLogger(CustomerService.class);

    private final UserRepository userRepository;

    public CustomerService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<CustomerResponse> listAll() {
        return userRepository.findByRole(User.Role.CUSTOMER).stream()
                .map(CustomerResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CustomerResponse getById(Long id) {
        return CustomerResponse.from(findCustomerOrThrow(id));
    }

    @Transactional
    public CustomerResponse suspend(Long id) {
        return changeStatus(id, User.UserStatus.SUSPENDED);
    }

    @Transactional
    public CustomerResponse activate(Long id) {
        return changeStatus(id, User.UserStatus.ACTIVE);
    }

    private CustomerResponse changeStatus(Long id, User.UserStatus status) {
        User user = findCustomerOrThrow(id);
        user.setStatus(status);
        userRepository.save(user);
        log.info("Customer {} status changed to {}", id, status);
        return CustomerResponse.from(user);
    }

    private User findCustomerOrThrow(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Customer not found: " + id));
        if (user.getRole() != User.Role.CUSTOMER) {
            throw new BadRequestException("User is not a customer: " + id);
        }
        return user;
    }
}