package com.meridian.lms.service;

import com.meridian.lms.dto.request.CreateEmployeeRequest;
import com.meridian.lms.dto.request.UpdateEmployeeRequest;
import com.meridian.lms.dto.response.EmployeeResponse;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.exception.NotFoundException;
import com.meridian.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Set;

@Service
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PermissionService permissionService;

    public EmployeeService(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           PermissionService permissionService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.permissionService = permissionService;
    }

    @Transactional(readOnly = true)
    public Page<EmployeeResponse> listAll(Pageable pageable) {
        return userRepository.findByRole(User.Role.EMPLOYEE, pageable)
                .map(user -> EmployeeResponse.from(user, permissionService.permissionsFor(user)));
    }

    @Transactional(readOnly = true)
    public EmployeeResponse getById(Long id) {
        User user = findEmployeeOrThrow(id);
        return EmployeeResponse.from(user, permissionService.permissionsFor(user));
    }

    @Transactional
    public EmployeeResponse create(CreateEmployeeRequest req, User createdBy) {
        if (userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User employee = User.builder()
                .email(req.getEmail().toLowerCase().trim())
                .passwordHash(passwordEncoder.encode(req.getPassword()))
                .fullName(req.getFullName().trim())
                .phone(req.getPhone())
                .role(User.Role.EMPLOYEE)
                .creditScore(650)
                .status(User.UserStatus.ACTIVE)
                .build();

        userRepository.save(employee);

        if (req.getPermissions() != null && !req.getPermissions().isEmpty()) {
            permissionService.replacePermissions(employee, req.getPermissions(), createdBy);
        }

        log.info("Employee created: id={}, email={}", employee.getId(), employee.getEmail());
        return EmployeeResponse.from(employee, permissionService.permissionsFor(employee));
    }

    @Transactional
    public EmployeeResponse update(Long id, UpdateEmployeeRequest req) {
        User employee = findEmployeeOrThrow(id);
        if (req.getFullName() != null) employee.setFullName(req.getFullName().trim());
        if (req.getPhone() != null) employee.setPhone(req.getPhone());
        userRepository.save(employee);
        return EmployeeResponse.from(employee, permissionService.permissionsFor(employee));
    }

    @Transactional
    public EmployeeResponse updatePermissions(Long id, Set<String> permissions, User grantedBy) {
        User employee = findEmployeeOrThrow(id);
        permissionService.replacePermissions(employee, permissions, grantedBy);
        log.info("Permissions updated for employee {}: {}", id, permissions);
        return EmployeeResponse.from(employee, permissionService.permissionsFor(employee));
    }

    @Transactional
    public void deactivate(Long id) {
        User employee = findEmployeeOrThrow(id);
        employee.setStatus(User.UserStatus.SUSPENDED);
        userRepository.save(employee);
        log.info("Employee deactivated: id={}", id);
    }

    private User findEmployeeOrThrow(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Employee not found: " + id));
        if (user.getRole() != User.Role.EMPLOYEE) {
            throw new BadRequestException("User is not an employee: " + id);
        }
        return user;
    }
}