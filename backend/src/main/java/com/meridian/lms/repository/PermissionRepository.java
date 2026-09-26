package com.meridian.lms.repository;

import com.meridian.lms.entity.Permission;
import com.meridian.lms.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    List<Permission> findByEmployee(User employee);

    boolean existsByEmployeeAndPermission(User employee, Permission.PermissionType permission);

    @Modifying
    @Query("DELETE FROM Permission p WHERE p.employee = :employee")
    void deleteByEmployee(@Param("employee") User employee);
}