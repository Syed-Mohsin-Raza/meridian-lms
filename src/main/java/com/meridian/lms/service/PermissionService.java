package com.meridian.lms.service;

import com.meridian.lms.entity.Permission;
import com.meridian.lms.entity.User;
import com.meridian.lms.exception.BadRequestException;
import com.meridian.lms.repository.PermissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PermissionService {

    private final PermissionRepository permissionRepository;

    public PermissionService(PermissionRepository permissionRepository) {
        this.permissionRepository = permissionRepository;
    }

    @Transactional(readOnly = true)
    public Set<String> permissionsFor(User employee) {
        return permissionRepository.findByEmployee(employee).stream()
                .map(p -> p.getPermission().name())
                .collect(Collectors.toSet());
    }

    @Transactional
    public void replacePermissions(User employee, Set<String> permissions, User grantedBy) {
        // Delete existing permissions for this employee
        permissionRepository.deleteByEmployee(employee);

        // Parse and validate
        Set<Permission.PermissionType> valid = new HashSet<>();
        for (String p : permissions) {
            try {
                valid.add(Permission.PermissionType.valueOf(p));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Unknown permission: " + p);
            }
        }

        // Insert new
        for (Permission.PermissionType p : valid) {
            permissionRepository.save(Permission.builder()
                    .employee(employee)
                    .permission(p)
                    .grantedBy(grantedBy)
                    .build());
        }
    }

    @Transactional(readOnly = true)
    public boolean hasPermission(User employee, Permission.PermissionType permission) {
        return permissionRepository.existsByEmployeeAndPermission(employee, permission);
    }
}