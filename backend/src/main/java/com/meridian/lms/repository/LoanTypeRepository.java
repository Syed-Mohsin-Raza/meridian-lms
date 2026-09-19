package com.meridian.lms.repository;

import com.meridian.lms.entity.LoanType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LoanTypeRepository extends JpaRepository<LoanType, Long> {

    Optional<LoanType> findByCode(String code);

    List<LoanType> findByActiveTrue();
}