package com.meridian.lms.security;

import com.meridian.lms.entity.Permission;
import com.meridian.lms.entity.User;
import com.meridian.lms.repository.PermissionRepository;
import com.meridian.lms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

@Component("permissions")
public class PermissionEvaluator {

    private static final Logger log = LoggerFactory.getLogger(PermissionEvaluator.class);

    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;

    public PermissionEvaluator(UserRepository userRepository,
                               PermissionRepository permissionRepository) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        log.info("PermissionEvaluator bean initialized");
    }

    public boolean has(Authentication authentication, String permissionCode) {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                log.debug("Permission check denied: no authentication");
                return false;
            }

            Object principal = authentication.getPrincipal();
            if (!(principal instanceof UserDetails userDetails)) {
                log.debug("Permission check denied: principal is not UserDetails");
                return false;
            }

            User user = userRepository.findByEmail(userDetails.getUsername()).orElse(null);
            if (user == null) {
                log.debug("Permission check denied: user not found");
                return false;
            }

            // Admins bypass permission checks
            if (user.getRole() == User.Role.ADMIN) {
                return true;
            }

            // Non-employees have no permissions
            if (user.getRole() != User.Role.EMPLOYEE) {
                return false;
            }

            Permission.PermissionType type;
            try {
                type = Permission.PermissionType.valueOf(permissionCode);
            } catch (IllegalArgumentException e) {
                log.warn("Permission check denied: unknown permission code {}", permissionCode);
                return false;
            }

            boolean has = permissionRepository.existsByEmployeeAndPermission(user, type);
            log.debug("Permission check for {} on {}: {}", user.getEmail(), permissionCode, has);
            return has;

        } catch (Exception e) {
            // Never throw from an authorization check — deny on any error
            log.error("Permission check threw exception for permission {}", permissionCode, e);
            return false;
        }
    }
}