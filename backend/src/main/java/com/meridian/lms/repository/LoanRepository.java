package com.meridian.lms.repository;

import com.meridian.lms.entity.Loan;
import com.meridian.lms.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoanRepository extends JpaRepository<Loan, Long> {

    List<Loan> findByCustomerOrderByAppliedAtDesc(User customer);

    Page<Loan> findByStatus(Loan.LoanStatus status, Pageable pageable);

    Page<Loan> findByAssignedEmployee(User employee, Pageable pageable);

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.status = :status")
    long countByStatus(@Param("status") Loan.LoanStatus status);

    @Query("SELECT COALESCE(SUM(l.amount), 0) FROM Loan l WHERE l.status IN ('ACTIVE','COMPLETED')")
    java.math.BigDecimal sumDisbursedAmount();

    @Query("SELECT COALESCE(SUM(l.outstandingBalance), 0) FROM Loan l WHERE l.status = 'ACTIVE'")
    java.math.BigDecimal sumOutstandingBalance();

    @Query("SELECT COUNT(l) FROM Loan l WHERE l.appliedAt >= :since")
    long countAppliedSince(@Param("since") java.time.LocalDateTime since);

    // Group by month
    @Query(value = """
    SELECT TO_CHAR(applied_at, 'YYYY-MM') AS period,
           COUNT(*) AS applications,
           COUNT(*) FILTER (WHERE status IN ('APPROVED','ACTIVE','COMPLETED')) AS approvals,
           COUNT(*) FILTER (WHERE status = 'REJECTED') AS rejections
    FROM loans
    WHERE applied_at >= :since
    GROUP BY period
    ORDER BY period
    """, nativeQuery = true)
    List<Object[]> monthlyTrends(@Param("since") java.time.LocalDateTime since);

    // Group by loan type
    @Query(value = """
    SELECT lt.code, lt.name,
           COUNT(l.id) AS count,
           COALESCE(SUM(l.amount), 0) AS total,
           COALESCE(
             COUNT(*) FILTER (WHERE l.status IN ('APPROVED','ACTIVE','COMPLETED'))::float
             / NULLIF(COUNT(l.id), 0), 0
           ) AS approval_rate
    FROM loan_types lt
    LEFT JOIN loans l ON l.loan_type_id = lt.id
    GROUP BY lt.code, lt.name
    ORDER BY count DESC
    """, nativeQuery = true)
    List<Object[]> loanTypeBreakdown();
}