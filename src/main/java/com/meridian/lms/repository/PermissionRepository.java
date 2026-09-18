package com.meridian.lms.repository;

import com.meridian.lms.entity.Permission;
import com.meridian.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    List<Permission> findByEmployee(User employee);

    boolean existsByEmployeeAndPermission(User employee, Permission.PermissionType permission);

    void deleteByEmployee(User employee);
}